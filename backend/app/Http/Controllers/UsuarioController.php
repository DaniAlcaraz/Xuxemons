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

}