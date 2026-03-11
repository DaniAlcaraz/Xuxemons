<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\MochilaController;
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
    Route::put('/usuario', [AuthController::class, 'update']);
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
});

// Rutas de gestión de usuarios
Route::get('/usuarios', [UsuarioController::class, 'index']);
Route::get('/usuarios/{id}', [UsuarioController::class, 'show']);
Route::delete('/usuarios/{id}', [UsuarioController::class, 'destroy']);

// Rutas de Xuxemons
Route::get('/xuxemons', function () {
    return Xuxemon::all();
});

Route::get('/xuxemons/{id}', function ($id) {
    $xuxemon = Xuxemon::find($id);
    return $xuxemon ? response()->json($xuxemon) : response()->json(['error' => 'No encontrado'], 404);
});

Route::post('/xuxemons/{id}/evolucionar', function ($id) {
    $xuxemon = Xuxemon::find($id);
    if (!$xuxemon) return response()->json(['error' => 'No encontrado'], 404);
        
    $xuxemon->evolucionar();
    return response()->json(['mensaje' => '¡Evolucionado!', 'xuxemon' => $xuxemon]);
});