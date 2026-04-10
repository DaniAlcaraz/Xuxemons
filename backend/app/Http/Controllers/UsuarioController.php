<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UsuarioController extends Controller
{
    public function index()
    {
        return response()->json(User::all());
    }

    public function show($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }
        return response()->json($user);
    }

    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }
        $user->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }

    public function deshabilitarCuenta(Request $request) {
        $user = $request->user();
        
        // 1. Invalidamos sus tokens actuales para que lo "eche" de la app
        $user->tokens()->delete(); 
        
        // 2. Marcamos la cuenta como borrada (lógicamente)
        $user->delete(); 

        return response()->json(['message' => 'Cuenta deshabilitada.']);
    }


    public function update(Request $request)
{
    $user = $request->user();

    $validated = $request->validate([
        'nombre'    => 'required|string|max:255',
        'apellidos' => 'required|string|max:255',
        'email'     => [
            'required', 'email',
            Rule::unique('usuarios', 'email')->ignore($user->identificador, 'identificador'),
        ],
        'password'  => 'nullable|string|min:6',
    ]);

    $user->nombre    = $validated['nombre'];
    $user->apellidos = $validated['apellidos'];
    $user->email     = $validated['email'];

    if (!empty($validated['password'])) {
        $user->password = Hash::make($validated['password']);
    }

    $user->save();

    return response()->json(['user' => $user]);
}

    //LOGICA XUXES

    //Obtiene xuxes
    public function obtenerXuxesDiariosConfig($identificador)
    {
        $user = User::where('identificador', $identificador)->first();
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        return response()->json([
            'activo' => (bool) ($user->xuxes_diarios_activo ?? true),
            'cantidad' => (int) ($user->xuxes_diarios_cantidad ?? 5),
            'hora' => substr((string) ($user->xuxes_diarios_hora ?? '09:00:00'), 0, 5),
            'ultimo_reparto' => $user->xuxes_diarios_ultimo_reparto?->toDateString(),
        ]);
    }

    //Actualiza xuxes
    public function actualizarXuxesDiariosConfig(Request $request, $identificador)
    {
        $user = User::where('identificador', $identificador)->first();
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $validated = $request->validate([
            'activo' => 'required|boolean',
            'cantidad' => 'required|integer|min:1|max:999',
            'hora' => 'required|date_format:H:i',
        ]);

        $user->xuxes_diarios_activo = (bool) $validated['activo'];
        $user->xuxes_diarios_cantidad = (int) $validated['cantidad'];
        $user->xuxes_diarios_hora = $validated['hora'] . ':00';
        $user->save();

        return response()->json([
            'message' => 'Configuración de xuxes diarios actualizada.',
            'config' => [
                'activo' => (bool) $user->xuxes_diarios_activo,
                'cantidad' => (int) $user->xuxes_diarios_cantidad,
                'hora' => substr((string) $user->xuxes_diarios_hora, 0, 5),
            ],
        ]);
    }

    //LOGICA PARA XUXEMONS

    //Obtiene xuxemons
    public function obtenerXuxemonsDiariosConfig($identificador)
    {
        $user = User::where('identificador', $identificador)->first();
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        return response()->json([
            'activo' => (bool) ($user->xuxemons_diarios_activo ?? true),
            'hora' => substr((string) ($user->xuxemons_diarios_hora ?? '09:00:00'), 0, 5),
            'ultimo_descubrimiento' => $user->xuxemons_diarios_ultimo_descubrimiento?->toDateString(),
        ]);
    }

    //Actualiza xuxemons
    public function actualizarXuxemonsDiariosConfig(Request $request, $identificador)
    {
        $user = User::where('identificador', $identificador)->first();
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $validated = $request->validate([
            'activo' => 'required|boolean',
            'hora' => 'required|date_format:H:i',
        ]);

        $user->xuxemons_diarios_activo = (bool) $validated['activo'];
        $user->xuxemons_diarios_hora = $validated['hora'] . ':00';
        $user->save();

        return response()->json([
            'message' => 'Configuración de xuxemons diarios actualizada.',
            'config' => [
                'activo' => (bool) $user->xuxemons_diarios_activo,
                'hora' => substr((string) $user->xuxemons_diarios_hora, 0, 5),
            ],
        ]);
    }

}