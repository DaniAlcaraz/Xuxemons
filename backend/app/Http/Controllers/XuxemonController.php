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
        return response()->json($request->user()->xuxemons);
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

    public function subirNivel($id) {
        $xuxemon = Xuxemon::findOrFail($id);
        
        // Llamamos al método que creamos en el modelo
        $xuxemon->evolucionar();

        return response()->json([
            'message' => '¡El Xuxemon ha evolucionado!',
            'xuxemon' => $xuxemon
    ]);
}
}
