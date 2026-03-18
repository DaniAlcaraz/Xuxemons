<?php

namespace App\Http\Controllers;

use App\Models\Xuxemon;
use App\Models\User;
use Illuminate\Http\Request;

class XuxemonController extends Controller
{
    public function index()
    {
        return response()->json(Xuxemon::all());
    }

    public function misXuxemons(Request $request)
{
    $xuxemons = $request->user()->xuxemons()->get()->map(function($x) {
        return [
            'IDxuxemon' => $x->IDxuxemon,
            'nombre' => $x->nombre,
            'tipo' => $x->tipo,
            'tamano' => $x->pivot->tamano,
            'xuxes_acumuladas' => $x->pivot->xuxes_acumuladas,
            'archivo' => $x->archivo,
        ];
    });
    return response()->json($xuxemons);
}

    public function anadirXuxemon(Request $request)
    {
        $request->validate([
            'user_identificador' => 'required|string|exists:usuarios,identificador',
            'xuxemon_id' => 'required|integer|exists:xuxemons,IDxuxemon',
        ]);

        $user = User::where('identificador', $request->user_identificador)->firstOrFail();
        
        // syncWithoutDetaching evita duplicados si ya lo tiene
        $user->xuxemons()->syncWithoutDetaching([$request->xuxemon_id]);

        return response()->json(['message' => 'Xuxemon añadido correctamente.']);
    }

    public function quitarXuxemon(Request $request)
    {
        $request->validate([
            'user_identificador' => 'required|string|exists:usuarios,identificador',
            'xuxemon_id' => 'required|integer|exists:xuxemons,IDxuxemon',
        ]);

        $user = User::where('identificador', $request->user_identificador)->firstOrFail();
        $user->xuxemons()->detach($request->xuxemon_id);

        return response()->json(['message' => 'Xuxemon quitado correctamente.']);
    }

    public function anadirAleatorio(Request $request)
    {
        $request->validate([
            'user_identificador' => 'required|string|exists:usuarios,identificador',
        ]);

        $user = User::where('identificador', $request->user_identificador)->firstOrFail();
        
        // Obtener xuxemons que el usuario aún no tiene
        $idsExistentes = $user->xuxemons()->pluck('xuxemons.IDxuxemon')->toArray();
        $pool = Xuxemon::whereNotIn('IDxuxemon', $idsExistentes)->get();

        if ($pool->isEmpty()) {
            return response()->json(['error' => 'El usuario ya tiene todos los Xuxemons disponibles.'], 400);
        }

        $xuxemon = $pool->random();
        $user->xuxemons()->attach($xuxemon->IDxuxemon);

        return response()->json([
            'message' => '¡Se ha descubierto un ' . $xuxemon->nombre . '!',
            'xuxemon' => $xuxemon
        ]);
    }
    //funcion para subir de nivel a los xuxemons
  public function subirNivel(Request $request, $id)
{
    $user = $request->user();
    
    // Buscar el xuxemon en la colección del usuario
    $pivot = $user->xuxemons()->where('xuxemons.IDxuxemon', $id)->first();
    
    if (!$pivot) {
        return response()->json(['error' => 'No tienes este Xuxemon.'], 404);
    }

    $tamanoActual = $pivot->pivot->tamano;

    if ($tamanoActual === 'Grande') {
        return response()->json(['error' => 'Este Xuxemon ya está en su tamaño máximo.'], 400);
    }

    // Xuxes necesarias según tamaño actual
    $xuxesNecesarias = $tamanoActual === 'Pequeño' ? 3 : 5;

    $xuxesAcumuladas = $pivot->pivot->xuxes_acumuladas + 1;

    if ($xuxesAcumuladas >= $xuxesNecesarias) {
        // Evolucionar
        $nuevoTamano = $tamanoActual === 'Pequeño' ? 'Mediano' : 'Grande';
        $user->xuxemons()->updateExistingPivot($id, [
            'tamano' => $nuevoTamano,
            'xuxes_acumuladas' => 0,
        ]);
        return response()->json([
            'message' => '¡' . $pivot->nombre . ' ha evolucionado a ' . $nuevoTamano . '!',
            'evolucionado' => true,
            'tamano' => $nuevoTamano,
            'xuxes_acumuladas' => 0,
        ]);
    } else {
        // Acumular xuxe
        $user->xuxemons()->updateExistingPivot($id, [
            'xuxes_acumuladas' => $xuxesAcumuladas,
        ]);
        $restantes = $xuxesNecesarias - $xuxesAcumuladas;
        return response()->json([
            'message' => 'Xuxe añadida. Faltan ' . $restantes . ' xuxes para evolucionar.',
            'evolucionado' => false,
            'tamano' => $tamanoActual,
            'xuxes_acumuladas' => $xuxesAcumuladas,
        ]);
    }
}
}
