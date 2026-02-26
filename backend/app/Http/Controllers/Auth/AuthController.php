<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request) { //Si el usuario se registra
        $validated = $request->validate([
            'nombre' => 'requred|string|max:255', //obligatorio, tipo texto, maximo 255 caracteres
            'apellidos' => 'requred|string|max:255',
            'email' => 'required|email|unique:users', //obligatorio, tipo email, que no se repita
            'password' => 'required|string|min:8|confirmed', //obligatorio, minimo 8 caracteres
        ]);

        //Añadir mascara #NombreXXXX
        $nombreLimpio = str_replace(' ', '', $request->nombre);
        $idMascara = '#' . $nombreLimpio . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);

        
        //Registra los campos con los nuevos datos a la BD
        $user = User::create([
            'nombre' => $validated['nombre'], //Sube el nombre validado
            'apellidos' => $validated['apellidos'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']), //Cifra la contraseña y sube el registro validado
        ]);

        $token = $user->createToken('auth_token')->plainTextToken; //Permite identificar al usuario sin usar su contraseña. Esto genera un codigo temporal que angular guardará. Así, cada vez que angular le pida algo a laravel, le enseñará ese código para demostrar quién es de forma segura.

        return response()->json([ //Devuelve la información después de que el usuario le diera a "registrarse" o "inicar sesion"
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    public function login(Request $request) { //Si el usuario inicia sesion
        $request->validate([ //Valida, como antes en el registro
            'email' => 'required|email',
            'password' => 'required,'
        ]);

        $user = User::where('email', $request->email)->first(); //Revisa si el usuario intorducido existe.

        if (!$user || !Hash::check($request->password, $user->password)) { //Si el usuario o contraseña son incorrectos...
            throw ValidationException::withMessages([
                'email'=>['las credenciales no son correctas.'],
            ]);
        }

        $user->tokens()->delete(); //Cierra todas las sesiones abiertas de un usuario. Por seguridad, elimina los tokens (llaves) antiguos. Es por seguridad, y osbretodo porque evita que un usuario tenga varias sesiones iniciadas.

        $token = $user->createToken('auth_token')->plainTextToken; //Genera un nuevo token (llave)

        return response()->json([ //Devuelve la repsuesta frente a la peticvion del usuario
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $resquest) { //Respuesta frente a la peticion del usuario de cerrar sesion
        $request->user()->currentAccesToken()->delete();
        return response()->json(['message' => 'Sesión cerrada']);
    }

    public function me(Request $request) { //Devuelve los datos correspondientes del usuario logueado
        return response()->json($request->user());
    }
}
