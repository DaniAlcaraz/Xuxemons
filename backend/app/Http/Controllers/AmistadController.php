<?php

namespace App\Http\Controllers;

use App\Models\Amistad;
use App\Models\User;
use Illuminate\Http\Request;

class AmistadController extends Controller
{
    // ── Buscar usuarios por ID (mínimo 3 caracteres)
    public function buscar(Request $request)
    {
        $query = $request->query('q', '');

        if (strlen($query) < 3) {
            return response()->json([]);
        }

        $yo = $request->user()->identificador;

        $usuarios = User::where('identificador', 'like', "%{$query}%")
            ->where('identificador', '!=', $yo)
            ->select('identificador', 'nombre', 'apellidos')
            ->limit(10)
            ->get();

        return response()->json($usuarios);
    }

    // ── Enviar solicitud de amistad 
    public function enviarSolicitud(Request $request)
    {
        $request->validate([
            'receptor_id' => 'required|string|exists:usuarios,identificador',
        ]);

        $yo = $request->user()->identificador;
        $receptor = $request->receptor_id;

        if ($yo === $receptor) {
            return response()->json(['message' => 'No puedes añadirte a ti mismo.'], 422);
        }

        // Comprobar si ya existe alguna relación en cualquier dirección
        $existe = Amistad::where(function ($q) use ($yo, $receptor) {
            $q->where('solicitante_id', $yo)->where('receptor_id', $receptor);
        })->orWhere(function ($q) use ($yo, $receptor) {
            $q->where('solicitante_id', $receptor)->where('receptor_id', $yo);
        })->first();

        if ($existe) {
            if ($existe->estado === 'accepted') {
                return response()->json(['message' => 'Ya sois amigos.'], 422);
            }
            if ($existe->estado === 'pending') {
                return response()->json(['message' => 'Ya existe una solicitud pendiente.'], 422);
            }
            // Si fue rechazada, se puede volver a intentar: la actualizamos
            $existe->update(['solicitante_id' => $yo, 'receptor_id' => $receptor, 'estado' => 'pending']);
            return response()->json(['message' => 'Solicitud enviada.']);
        }

        Amistad::create([
            'solicitante_id' => $yo,
            'receptor_id'    => $receptor,
            'estado'         => 'pending',
        ]);

        return response()->json(['message' => 'Solicitud enviada.'], 201);
    }

    // ── Solicitudes recibidas pendientes 
    public function solicitudesRecibidas(Request $request)
    {
        $yo = $request->user()->identificador;

        $solicitudes = Amistad::where('receptor_id', $yo)
            ->where('estado', 'pending')
            ->with('solicitante:identificador,nombre,apellidos')
            ->get();

        return response()->json($solicitudes);
    }

    // ── Aceptar solicitud 
    public function aceptar(Request $request, $id)
    {
        $yo = $request->user()->identificador;

        $amistad = Amistad::where('id', $id)
            ->where('receptor_id', $yo)
            ->where('estado', 'pending')
            ->firstOrFail();

        $amistad->update(['estado' => 'accepted']);

        return response()->json(['message' => 'Amistad aceptada.']);
    }

    // ── Rechazar solicitud 
    public function rechazar(Request $request, $id)
    {
        $yo = $request->user()->identificador;

        $amistad = Amistad::where('id', $id)
            ->where('receptor_id', $yo)
            ->where('estado', 'pending')
            ->firstOrFail();

        $amistad->delete();

        return response()->json(['message' => 'Solicitud rechazada y eliminada.']);
    }

    // ── Lista de amigos 
    public function listaAmigos(Request $request)
    {
        $yo = $request->user()->identificador;

        $amistades = Amistad::where('estado', 'accepted')
            ->where(function ($q) use ($yo) {
                $q->where('solicitante_id', $yo)->orWhere('receptor_id', $yo);
            })
            ->with([
                'solicitante:identificador,nombre,apellidos',
                'receptor:identificador,nombre,apellidos',
            ])
            ->get();

        // Devolvemos siempre "el otro" usuario, no yo mismo
        $amigos = $amistades->map(function ($a) use ($yo) {
            $amigo = $a->solicitante_id === $yo ? $a->receptor : $a->solicitante;
            return [
                'amistad_id'    => $a->id,
                'identificador' => $amigo->identificador,
                'nombre'        => $amigo->nombre,
                'apellidos'     => $amigo->apellidos,
            ];
        });

        return response()->json($amigos);
    }

    // ── Eliminar amigo (bidireccional) 
    public function eliminarAmigo(Request $request, $id)
    {
        $yo = $request->user()->identificador;

        $amistad = Amistad::where('id', $id)
            ->where('estado', 'accepted')
            ->where(function ($q) use ($yo) {
                $q->where('solicitante_id', $yo)->orWhere('receptor_id', $yo);
            })
            ->firstOrFail();

        $amistad->delete();

        return response()->json(['message' => 'Amigo eliminado.']);
    }
}