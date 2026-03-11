<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    { //Si el usuario se registra
        $validated = $request->validate([
            'nombre' => 'required|string|max:255', //obligatorio, tipo texto, maximo 255 caracteres
            'apellidos' => 'required|string|max:255',
            'email' => 'required|email|unique:usuarios', //obligatorio, tipo email, que no se repita
            'password' => 'required|string|min:8|confirmed', //obligatorio, minimo 8 caracteres
        ]);

        //Añadir mascara #NombreXXXX
        $nombreLimpio = str_replace(' ', '', $validated['nombre']);
        $idMascara = '#' . $nombreLimpio . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);

        //Para que el primer usuario sea admin
        $esAdmin = User::count() === 0;

        //Registra los campos con los nuevos datos a la BD
        $user = User::create([
            'identificador' => $idMascara,
            'nombre' => $validated['nombre'], //Sube el nombre validado
            'apellidos' => $validated['apellidos'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']), //Cifra la contraseña y sube el registro validado
            'rol' => $esAdmin ? 'admin' : 'jugador', // Asignación automática
        ]);

        $token = $user->createToken('auth_token')->plainTextToken; //Permite identificar al usuario sin usar su contraseña. Esto genera un codigo temporal que angular guardará. Así, cada vez que angular le pida algo a laravel, le enseñará ese código para demostrar quién es de forma segura.

        return response()->json([ //Devuelve la información después de que el usuario le diera a "registrarse" o "inicar sesion"
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    public function login(Request $request)
    { //Si el usuario inicia sesion
        //Validamos solo l oque necesitamos para entrar
        $request->validate([ //Valida, como antes en el registro
            'identificador' => 'required|string',
            'password' => 'required'
        ]);

        //Buscamos al usuario por su id
        $user = User::withTrashed()->where('identificador', $request->identificador)->first(); //Revisa si el usuario intorducido existe.

        // Si no existe el usuario, lanzamos error inmediatamente
        if (!$user) {
            throw ValidationException::withMessages([
                'identificador' => ['las credenciales no son correctas.'],
            ]);
        }

        //Bloquea el acceso si tiene SoftDelete (Que esté deshabilitada) ANTES de comprobar la contraseña
        // Esto optimiza el proceso, ya que Hash::check() es una operación pesada que tarda varios milisegundos
        if ($user->trashed()) {
            return response()->json(['message' => 'Esta cuenta ha sido dada de baja.'], 403);
        }

        //Verifica credenciales (contraseña)
        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'identificador' => ['las credenciales no son correctas.'],
            ]);
        }

        //Borra sesiones anteriores (Al cerrar sesion)
        $user->tokens()->delete(); //Cierra todas las sesiones abiertas de un usuario. Por seguridad, elimina los tokens (llaves) antiguos. Es por seguridad, y osbretodo porque evita que un usuario tenga varias sesiones iniciadas.

        //Genera token de acceso
        $token = $user->createToken('auth_token')->plainTextToken; //Genera un nuevo token (llave)

        //Respuesta que devuelve finalmente
        return response()->json([ //Devuelve la repsuesta frente a la peticvion del usuario
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);

    }

    public function logout(Request $request)
    { //Respuesta frente a la peticion del usuario de cerrar sesion
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada']);
    }

    public function baja(Request $request)
    {
        // Obtiene el usuario autenticado directamente de Sanctum
        $user = $request->user();

        // Revoca todos los tokens (cierra sesión en el servidor)
        $user->tokens()->delete();

        // Borrado lógico (SoftDelete = inhabilitar)
        $user->delete();

        return response()->json([
            'message' => 'Usuario inhabilitado correctamente',
        ], 200);
    }


    public function me(Request $request)
    { //Devuelve los datos correspondientes del usuario logueado
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'email' => [
                'required',
                'email',

                \Illuminate\Validation\Rule::unique('usuarios', 'email')
                ->ignore($user->identificador, 'identificador'),
            ],
            'password' => 'nullable|string|min:6',
        ]);

        $user->nombre = $validated['nombre'];
        $user->apellidos = $validated['apellidos'];
        $user->email = $validated['email'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json(['user' => $user]);    }

}
