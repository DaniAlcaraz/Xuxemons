<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

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
}