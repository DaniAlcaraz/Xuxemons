<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\MochilaController;
use App\Http\Controllers\XuxemonController;
use App\Http\Controllers\AmistadController;


// ── RUTAS PÚBLICAS 
// Estas rutas son accesibles sin necesidad de token (invitados).
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::get('/items',     [MochilaController::class, 'catalogoItems']); // El catálogo es visible para todos

// ── RUTAS PROTEGIDAS (Requieren Token Sanctum) 
Route::middleware('auth:sanctum')->group(function () {
    
    // Autenticación y Perfil
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']); // Devuelve los datos del usuario logueado

    // Gestión del perfil propio
    Route::put('/usuario',        [UsuarioController::class, 'update']);
    Route::post('/usuario/baja',  [AuthController::class, 'baja']);

    // --- MOCHILA ---
    Route::get('/mochila',         [MochilaController::class, 'index']);      // Ver mi mochila
    Route::post('/mochila/anadir', [MochilaController::class, 'anadir']);     // El admin añade items
    Route::post('/mochila/quitar', [MochilaController::class, 'quitar']);     // El admin quita items

    // --- ADMINISTRACIÓN DE USUARIOS ESPECÍFICOS ---
    // Rutas para que el admin gestione inventarios, xuxemons y configuraciones diarias de otros
    Route::get('/admin/mochila', function(\Illuminate\Http\Request $request) {
        $id      = $request->query('user');
        $mochila = \App\Models\Mochila::where('user_identificador', $id)->with('item')->get();
        return response()->json($mochila);
    });
    
    Route::get('/admin/usuarios/{identificador}/xuxemons', function($id) {
        $user = \App\Models\User::where('identificador', $id)->firstOrFail();
        return response()->json($user->xuxemons()->withPivot('enfermo', 'enfermedad')->get());
    });

    // Configuración personalizada de los repartos diarios (Xuxes y Xuxemons)
    Route::get('/admin/usuarios/{identificador}/xuxes-diarios', [UsuarioController::class, 'obtenerXuxesDiariosConfig']);
    Route::put('/admin/usuarios/{identificador}/xuxes-diarios', [UsuarioController::class, 'actualizarXuxesDiariosConfig']);
    Route::get('/admin/usuarios/{identificador}/xuxemons-diarios', [UsuarioController::class, 'obtenerXuxemonsDiariosConfig']);
    Route::put('/admin/usuarios/{identificador}/xuxemons-diarios', [UsuarioController::class, 'actualizarXuxemonsDiariosConfig']);

    // --- GESTIÓN DE XUXEMONS ---
    Route::get('/xuxemons',         [XuxemonController::class, 'index']);      // Catálogo general
    Route::get('/xuxemons/me',      [XuxemonController::class, 'misXuxemons']); // Mi equipo actual
    Route::post('/xuxemons/curar',  [XuxemonController::class, 'curarXuxemon']);
    Route::post('/xuxemons/{id}/evolucionar', [XuxemonController::class, 'subirNivel']);

    // Acciones administrativas sobre Xuxemons
    Route::prefix('admin/xuxemons')->group(function () {
        Route::post('/anadir',    [XuxemonController::class, 'anadirXuxemon']);
        Route::post('/quitar',    [XuxemonController::class, 'quitarXuxemon']);
        Route::post('/aleatorio', [XuxemonController::class, 'anadirAleatorio']); // Descubrimiento manual
        Route::post('/enfermar',  [XuxemonController::class, 'enfermarXuxemon']); // Forzar enfermedad (debug/admin)
    });

    // Configuración global del juego (Dificultad de evolución)
    Route::get('/configuracion/xuxes',  [XuxemonController::class, 'getConfigXuxes']);
    Route::post('/configuracion/xuxes', [XuxemonController::class, 'setConfigXuxes']);

    // --- SISTEMA DE AMISTADES ---
    // Agrupadas bajo el prefijo /amigos
    Route::prefix('amigos')->group(function () {
        Route::get('/buscar',                [AmistadController::class, 'buscar']);           // Buscar por nombre/email
        Route::post('/solicitud',            [AmistadController::class, 'enviarSolicitud']);  // Mandar petición
        Route::get('/solicitudes',           [AmistadController::class, 'solicitudesRecibidas']); // Pendientes
        Route::post('/solicitud/{id}/aceptar',  [AmistadController::class, 'aceptar']);
        Route::post('/solicitud/{id}/rechazar', [AmistadController::class, 'rechazar']);
        Route::get('/',                      [AmistadController::class, 'listaAmigos']);      // Lista de amigos confirmados
        Route::delete('/{id}',               [AmistadController::class, 'eliminarAmigo']);    // Romper amistad
    });
});

// --- GESTIÓN DE CUENTAS (Fuera del middleware o con middleware distinto) ---
// Rutas típicas de un panel de control de administrador para CRUD de usuarios.
Route::get('/usuarios',         [UsuarioController::class, 'index']);
Route::get('/usuarios/{id}',    [UsuarioController::class, 'show']);
Route::delete('/usuarios/{id}', [UsuarioController::class, 'destroy']);