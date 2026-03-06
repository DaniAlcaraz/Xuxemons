<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\UsuarioController;
use App\Models\Xuxemon;

// Rutas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas con Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/usuario', [AuthController::class, 'update']);
    Route::post('/usuario/baja', [AuthController::class, 'baja']);
});

// Rutas de gestión de usuardocker-compose down -vios
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