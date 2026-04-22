<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UsuarioController extends Controller
{
    /**
     * Muestra la lista de todos los usuarios registrados.
     * Útil para que el administrador tenga una visión global de la base de datos.
     */
    public function index()
    {
        return response()->json(User::all());
    }

    /**
     * Busca un usuario específico por su ID.
     * Devuelve error 404 si el usuario no existe.
     */
    public function show($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }
        return response()->json($user);
    }

    /**
     * Eliminación física de un usuario por ID.
     * Borra permanentemente el registro de la tabla 'usuarios'.
     */
    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }
        $user->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }

    /**
     * Baja de cuenta iniciada por el propio usuario.
     * Primero revoca todos sus tokens de acceso (Sanctum) para cerrar su sesión 
     * en todos los dispositivos y luego deshabilita el registro.
     */
    public function deshabilitarCuenta(Request $request) {
        $user = $request->user();
        
        // 1. Invalidamos sus tokens actuales para que lo "eche" de la app inmediatamente
        $user->tokens()->delete(); 
        
        // 2. Marcamos la cuenta como borrada
        $user->delete(); 

        return response()->json(['message' => 'Cuenta deshabilitada.']);
    }

    /**
     * Actualiza el perfil del usuario autenticado.
     * Gestiona la validación de email único (ignorando el propio email del usuario)
     * y permite actualizar la contraseña solo si se proporciona una nueva.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'nombre'    => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'email'     => [
                'required', 'email',
                // Asegura que el correo no esté duplicado, ignorando al usuario actual
                Rule::unique('usuarios', 'email')->ignore($user->identificador, 'identificador'),
            ],
            'password'  => 'nullable|string|min:6',
        ]);

        $user->nombre    = $validated['nombre'];
        $user->apellidos = $validated['apellidos'];
        $user->email     = $validated['email'];

        // Solo encriptamos y guardamos la contraseña si el usuario escribió algo en el campo
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json(['user' => $user]);
    }

    // --- CONFIGURACIÓN DE XUXES DIARIOS (REGALO DE OBJETOS) ---

    /**
     * Obtiene los ajustes de regalo diario de xuxes para un usuario.
     * Incluye cantidad, hora programada y si la función está activa.
     */
    public function obtenerXuxesDiariosConfig($identificador)
    {
        $user = User::where('identificador', $identificador)->first();
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        return response()->json([
            'activo' => (bool) ($user->xuxes_diarios_activo ?? true),
            'cantidad' => (int) ($user->xuxes_diarios_cantidad ?? 5),
            'hora' => substr((string) ($user->xuxes_diarios_hora ?? '09:00:00'), 0, 5), // Formato HH:MM
            'ultimo_reparto' => $user->xuxes_diarios_ultimo_reparto?->toDateString(),
        ]);
    }

    /**
     * Permite al admin cambiar cuántas xuxes recibe el usuario y a qué hora.
     */
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
        $user->xuxes_diarios_hora = $validated['hora'] . ':00'; // Añade segundos para la DB
        $user->save();

        return response()->json(['message' => 'Configuración de xuxes diarios actualizada.']);
    }

    // --- CONFIGURACIÓN DE XUXEMONS DIARIOS (REGALO DE CRIATURAS) ---

    /**
     * Obtiene los ajustes de descubrimiento diario de Xuxemons.
     */
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

    /**
     * Actualiza el horario y estado del descubrimiento diario automático.
     */
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

        return response()->json(['message' => 'Configuración de xuxemons diarios actualizada.']);
    }
}