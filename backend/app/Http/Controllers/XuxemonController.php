<?php

namespace App\Http\Controllers;

use App\Models\Xuxemon;
use App\Models\User;
use App\Models\Mochila;
use Illuminate\Http\Request;

class XuxemonController extends Controller
{
    private const VACUNA_CURA = [
        'Chocolatina'         => 'Bajón de azúcar',
        'Mermelada de frutas' => 'Atracón',
        'Insulina'            => '*',
    ];

    private const INFECCION = [
        'Bajón de azúcar'     => 5,
        'Sobredosis de sucre' => 10,
        'Atracón'             => 15,
    ];

    public function index()
    {
        return response()->json(Xuxemon::all());
    }

    // ── FUSIÓN: devuelve campos de evolución Y de enfermedad ──
    public function misXuxemons(Request $request)
    {
        $xuxemons = $request->user()->xuxemons()->get()->map(function($x) {
            return [
                'IDxuxemon'        => $x->IDxuxemon,
                'nombre'           => $x->nombre,
                'tipo'             => $x->tipo,
                'tamano'           => $x->pivot->tamano,
                'xuxes_acumuladas' => $x->pivot->xuxes_acumuladas,
                'archivo'          => $x->archivo,
                'enfermo'          => (bool) $x->pivot->enfermo,
                'enfermedad'       => $x->pivot->enfermedad,
            ];
        });
        return response()->json($xuxemons);
    }

    public function curarXuxemon(Request $request)
    {
        $request->validate([
            'xuxemon_id' => 'required|integer|exists:xuxemons,IDxuxemon',
            'item_id'    => 'required|integer|exists:items,id',
        ]);

        $user = $request->user();

        $xuxemon = $user->xuxemons()
                        ->where('xuxemons.IDxuxemon', $request->xuxemon_id)
                        ->first();

        if (!$xuxemon) {
            return response()->json(['error' => 'No tienes ese xuxemon'], 404);
        }

        if (!$xuxemon->pivot->enfermo) {
            return response()->json(['error' => 'El xuxemon no está enfermo'], 400);
        }

        $entradaMochila = Mochila::where('user_identificador', $user->identificador)
                            ->where('item_id', $request->item_id)
                            ->with('item')
                            ->first();

        if (!$entradaMochila || $entradaMochila->item->tipo !== 'vacuna') {
            return response()->json(['error' => 'No tienes esa vacuna en la mochila'], 400);
        }

        $nombreVacuna     = $entradaMochila->item->nombre;
        $enfermedadActual = $xuxemon->pivot->enfermedad;
        $cura             = self::VACUNA_CURA[$nombreVacuna] ?? null;

        if ($cura === null) {
            return response()->json(['error' => 'Esta vacuna no cura nada'], 400);
        }

        if ($cura !== '*' && $cura !== $enfermedadActual) {
            return response()->json([
                'error' => 'Esta vacuna no cura "' . $enfermedadActual . '"'
            ], 400);
        }

        $entradaMochila->cantidad -= 1;
        if ($entradaMochila->cantidad <= 0) $entradaMochila->delete();
        else $entradaMochila->save();

        // ── FIX: clamp xuxes_acumuladas al máximo base (sin enfermedad) ──
        // Si el xuxemon tenía Bajón de azúcar, puede haber acumulado más xuxes
        // de las que el tope base permite. Al curar, recortamos para evitar
        // que la barra quede rota (>100%) o que evolucione sin querer.
        $xuxesAcumuladas  = $xuxemon->pivot->xuxes_acumuladas;
        $tamano           = $xuxemon->pivot->tamano;

        $maxSinEnfermedad = $tamano === 'Pequeño'
            ? (int) \App\Models\Configuracion::get('xuxes_pequeno_a_mediano', 3)
            : (int) \App\Models\Configuracion::get('xuxes_mediano_a_grande', 5);

        // min - 1 para que no evolucione automáticamente al curar.
        // Si prefieres que evolucione al instante cuando ya llegó al tope,
        // cambia ($maxSinEnfermedad - 1) por $maxSinEnfermedad.
        $xuxesAjustadas = min($xuxesAcumuladas, $maxSinEnfermedad - 1);

        $user->xuxemons()->updateExistingPivot($request->xuxemon_id, [
            'enfermo'          => false,
            'enfermedad'       => null,
            'xuxes_acumuladas' => $xuxesAjustadas,
        ]);

        return response()->json([
            'message' => '¡' . $xuxemon->nombre . ' ha sido curado de "' . $enfermedadActual . '"!'
        ]);
    }

    public function enfermarXuxemon(Request $request)
    {
        $request->validate([
            'user_identificador' => 'required|string|exists:usuarios,identificador',
            'xuxemon_id'         => 'required|integer|exists:xuxemons,IDxuxemon',
            'enfermedad'         => 'required|string|in:Bajón de azúcar,Atracón,Sobredosis de sucre',
        ]);

        $user = User::where('identificador', $request->user_identificador)->firstOrFail();

        if (!$user->xuxemons()->where('xuxemons.IDxuxemon', $request->xuxemon_id)->exists()) {
            return response()->json(['error' => 'El usuario no tiene ese xuxemon'], 404);
        }

        $user->xuxemons()->updateExistingPivot($request->xuxemon_id, [
            'enfermo'    => true,
            'enfermedad' => $request->enfermedad,
        ]);

        return response()->json(['message' => 'Xuxemon enfermado: ' . $request->enfermedad]);
    }

    private function intentarInfectar(User $user, Xuxemon $xuxemon): void
    {
        $pivot = $user->xuxemons()
                      ->where('xuxemons.IDxuxemon', $xuxemon->IDxuxemon)
                      ->first();

        if ($pivot && $pivot->pivot->enfermo) return;

        $rand      = rand(1, 100);
        $acumulado = 0;

        foreach (self::INFECCION as $enfermedad => $porcentaje) {
            $acumulado += $porcentaje;
            if ($rand <= $acumulado) {
                $user->xuxemons()->updateExistingPivot($xuxemon->IDxuxemon, [
                    'enfermo'    => true,
                    'enfermedad' => $enfermedad,
                ]);
                return;
            }
        }
    }

    public function subirNivel(Request $request, $id)
    {
        $user  = $request->user();
        $pivot = $user->xuxemons()->where('xuxemons.IDxuxemon', $id)->first();

        if (!$pivot) {
            return response()->json(['error' => 'No tienes este Xuxemon.'], 404);
        }

        // Bloqueo por enfermedad Atracón
        if ($pivot->pivot->enfermo && $pivot->pivot->enfermedad === 'Atracón') {
            return response()->json([
                'error' => 'Este xuxemon tiene Atracón y no puede alimentarse'
            ], 400);
        }

        $tamanoActual = $pivot->pivot->tamano;

        if ($tamanoActual === 'Grande') {
            return response()->json(['error' => 'Este Xuxemon ya está en su tamaño máximo.'], 400);
        }

        $xuxesNecesarias = $tamanoActual === 'Pequeño'
            ? (int) \App\Models\Configuracion::get('xuxes_pequeno_a_mediano', 3)
            : (int) \App\Models\Configuracion::get('xuxes_mediano_a_grande', 5);

        // Bajón de azúcar requiere +2 xuxes por nivel
        if ($pivot->pivot->enfermo && $pivot->pivot->enfermedad === 'Bajón de azúcar') {
            $xuxesNecesarias += 2;
        }

        $xuxesAcumuladas = $pivot->pivot->xuxes_acumuladas + 1;

        if ($xuxesAcumuladas >= $xuxesNecesarias) {
            $nuevoTamano = $tamanoActual === 'Pequeño' ? 'Mediano' : 'Grande';
            $user->xuxemons()->updateExistingPivot($id, [
                'tamano'           => $nuevoTamano,
                'xuxes_acumuladas' => 0,
            ]);

            $xuxemon = Xuxemon::findOrFail($id);
            $this->intentarInfectar($user, $xuxemon);

            return response()->json([
                'message'          => '¡' . $pivot->nombre . ' ha evolucionado a ' . $nuevoTamano . '!',
                'evolucionado'     => true,
                'tamano'           => $nuevoTamano,
                'xuxes_acumuladas' => 0,
                'xuxes_necesarias' => $xuxesNecesarias,
            ]);
        } else {
            $user->xuxemons()->updateExistingPivot($id, [
                'xuxes_acumuladas' => $xuxesAcumuladas,
            ]);

            $xuxemon = Xuxemon::findOrFail($id);
            $this->intentarInfectar($user, $xuxemon);

            $restantes = $xuxesNecesarias - $xuxesAcumuladas;
            return response()->json([
                'message'          => 'Xuxe añadida. Faltan ' . $restantes . ' xuxes para evolucionar.',
                'evolucionado'     => false,
                'tamano'           => $tamanoActual,
                'xuxes_acumuladas' => $xuxesAcumuladas,
                'xuxes_necesarias' => $xuxesNecesarias,
            ]);
        }
    }

    public function anadirXuxemon(Request $request)
    {
        $request->validate([
            'user_identificador' => 'required|string|exists:usuarios,identificador',
            'xuxemon_id'         => 'required|integer|exists:xuxemons,IDxuxemon',
        ]);

        $user = User::where('identificador', $request->user_identificador)->firstOrFail();
        $user->xuxemons()->syncWithoutDetaching([$request->xuxemon_id]);

        return response()->json(['message' => 'Xuxemon añadido correctamente.']);
    }

    public function quitarXuxemon(Request $request)
    {
        $request->validate([
            'user_identificador' => 'required|string|exists:usuarios,identificador',
            'xuxemon_id'         => 'required|integer|exists:xuxemons,IDxuxemon',
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

        $user          = User::where('identificador', $request->user_identificador)->firstOrFail();
        $idsExistentes = $user->xuxemons()->pluck('xuxemons.IDxuxemon')->toArray();
        $pool          = Xuxemon::whereNotIn('IDxuxemon', $idsExistentes)->get();

        if ($pool->isEmpty()) {
            return response()->json(['error' => 'El usuario ya tiene todos los Xuxemons'], 400);
        }

        $xuxemon = $pool->random();
        $user->xuxemons()->attach($xuxemon->IDxuxemon);

        return response()->json([
            'message' => '¡Se ha descubierto un ' . $xuxemon->nombre . '!',
            'xuxemon' => $xuxemon
        ]);
    }

    public function getConfigXuxes()
    {
        return response()->json([
            'xuxes_pequeno_a_mediano' => (int) \App\Models\Configuracion::get('xuxes_pequeno_a_mediano', 3),
            'xuxes_mediano_a_grande'  => (int) \App\Models\Configuracion::get('xuxes_mediano_a_grande', 5),
        ]);
    }

    public function setConfigXuxes(Request $request)
    {
        $request->validate([
            'xuxes_pequeno_a_mediano' => 'required|integer|min:1|max:99',
            'xuxes_mediano_a_grande'  => 'required|integer|min:1|max:99',
        ]);

        \App\Models\Configuracion::set('xuxes_pequeno_a_mediano', $request->xuxes_pequeno_a_mediano);
        \App\Models\Configuracion::set('xuxes_mediano_a_grande',  $request->xuxes_mediano_a_grande);

        return response()->json(['message' => 'Configuración actualizada correctamente.']);
    }
}