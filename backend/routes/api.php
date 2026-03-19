<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\MochilaController;
use App\Http\Controllers\XuxemonController;
use App\Models\Xuxemon;
use App\Models\Coleccion;

// ── Rutas públicas ────────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/items', [MochilaController::class, 'catalogoItems']);

// ── Rutas protegidas con Sanctum ──────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Perfil de usuario (requiere autenticación)
    Route::put('/usuario', [UsuarioController::class, 'update']);
    Route::post('/usuario/baja', [AuthController::class, 'baja']); 

    // Mochila
    Route::get('/mochila', [MochilaController::class, 'index']);
    Route::post('/mochila/anadir', [MochilaController::class, 'anadir']);
    Route::post('/mochila/quitar', [MochilaController::class, 'quitar']);

    Route::get('/admin/mochila', function(\Illuminate\Http\Request $request) {
        $id = $request->query('user');
        $mochila = \App\Models\Mochila::where('user_identificador', $id)->with('item')->get();
        return response()->json($mochila);
    });

    Route::get('/admin/usuarios/{identificador}/xuxemons', function($id) {
        $user = \App\Models\User::where('identificador', $id)->firstOrFail();
        return response()->json($user->xuxemons);
    });

    // Colección de Xuxemons del usuario
    Route::get('/xuxemons', [XuxemonController::class, 'index']); 
    Route::get('/xuxemons/me', [XuxemonController::class, 'misXuxemons']);
    Route::post('/xuxemons/{id}/evolucionar', [XuxemonController::class, 'subirNivel']);

    // Gestión Admin de Xuxemons
    Route::prefix('admin/xuxemons')->group(function () {
        Route::post('/anadir', [XuxemonController::class, 'anadirXuxemon']);
        Route::post('/quitar', [XuxemonController::class, 'quitarXuxemon']);
        Route::post('/aleatorio', [XuxemonController::class, 'anadirAleatorio']);
        
    });
    // Configuración global de xuxes
    Route::get('/configuracion/xuxes',  [XuxemonController::class, 'getConfigXuxes']);
    Route::post('/configuracion/xuxes', [XuxemonController::class, 'setConfigXuxes']);

});

// Rutas de gestión de usuarios
Route::get('/usuarios', [UsuarioController::class, 'index']);
Route::get('/usuarios/{id}', [UsuarioController::class, 'show']);
Route::delete('/usuarios/{id}', [UsuarioController::class, 'destroy']);

