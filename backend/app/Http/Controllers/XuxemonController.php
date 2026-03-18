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

    public function misXuxemons(Request $request)
    {
        $xuxemons = $request->user()
            ->xuxemons()
            ->withPivot('enfermo', 'enfermedad')
            ->get();

        return response()->json($xuxemons->map(function ($x) {
            return [
                'IDxuxemon'  => $x->IDxuxemon,
                'nombre'     => $x->nombre,
                'tipo'       => $x->tipo,
                'tamano'     => $x->tamano,
                'archivo'    => $x->archivo,
                'enfermo'    => (bool) $x->pivot->enfermo,
                'enfermedad' => $x->pivot->enfermedad,
            ];
        }));
    }

    public function curarXuxemon(Request $request)
    {
        $request->validate([
            'xuxemon_id' => 'required|integer|exists:xuxemons,IDxuxemon',
            'item_id'    => 'required|integer|exists:items,id',
        ]);

        $user = $request->user();

        $xuxemon = $user->xuxemons()
                        ->withPivot('enfermo', 'enfermedad')
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

        // Gastar 1 vacuna
        $entradaMochila->cantidad -= 1;
        if ($entradaMochila->cantidad <= 0) $entradaMochila->delete();
        else $entradaMochila->save();

        // Curar
        $user->xuxemons()->updateExistingPivot($request->xuxemon_id, [
            'enfermo'    => false,
            'enfermedad' => null,
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
                      ->withPivot('enfermo')
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

    public function subirNivel($id)
    {
        $xuxemon = Xuxemon::findOrFail($id);
        $user    = request()->user();

        $pivot = $user->xuxemons()
                      ->withPivot('enfermo', 'enfermedad')
                      ->where('xuxemons.IDxuxemon', $id)
                      ->first();

        if ($pivot && $pivot->pivot->enfermo && $pivot->pivot->enfermedad === 'Atracón') {
            return response()->json([
                'error' => 'Este xuxemon tiene Atracón y no puede alimentarse'
            ], 400);
        }

        $xuxemon->evolucionar();

        $this->intentarInfectar($user, $xuxemon);

        return response()->json([
            'message' => '¡El Xuxemon ha evolucionado!',
            'xuxemon' => $xuxemon
        ]);
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
}