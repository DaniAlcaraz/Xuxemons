<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\UsuarioController;
use App\Models\Xuxemon;

// Sin middleware por ahora para pruebas
// Rutas abiertas para pruebas
Route::post('/register', [AuthController::class, 'register']); //Crea un usuario (Lo registra)
Route::post('/login', [AuthController::class, 'login']);
//Finalmente tendra que ir dentro de un middleawre, pero ahora esta asi para probar que funcionen las rutas
//Route::get('/me', [AuthController::class, 'me']);      
//Route::post('/logout', [AuthController::class, 'logout']); 

// Rutas PROTEGIDAS (Necesitan token/sesión)
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Rutas de Usuario
    Route::get('/usuarios', [UsuarioController::class, 'index']);
    Route::get('/usuarios/{id}', [UsuarioController::class, 'show']);
    Route::delete('/usuarios/{id}', [UsuarioController::class, 'destroy']);
    Route::post('/usuario/baja', [AuthController::class, 'baja']);

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
});