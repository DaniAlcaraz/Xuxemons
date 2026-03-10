<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\MochilaController;

// Rutas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas con Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/usuario', [AuthController::class, 'update']);
    Route::post('/usuario/baja', [AuthController::class, 'baja']);

    // Mochila
    Route::get('/mochila', [MochilaController::class, 'index']);
    Route::get('/items', [MochilaController::class, 'catalogoItems']);
    Route::post('/mochila/anadir', [MochilaController::class, 'anadir']);
    Route::post('/mochila/quitar', [MochilaController::class, 'quitar']);

    
    Route::get('/admin/mochila/{identificador}', function(\Illuminate\Http\Request $request, $identificador) {
    $mochila = \App\Models\Mochila::where('user_identificador', $identificador)->with('item')->get();
    return response()->json($mochila);
});
});

// Rutas de gestión de usuarios
Route::get('/usuarios', [UsuarioController::class, 'index']);
Route::get('/usuarios/{id}', [UsuarioController::class, 'show']);
Route::delete('/usuarios/{id}', [UsuarioController::class, 'destroy']);

Route::post('/xuxemons/{id}/evolucionar', [XuxemonController::class, 'subirNivel']);
Route::get('/xuxedex', [XuxemonController::class, 'mostrarXuxedex']);