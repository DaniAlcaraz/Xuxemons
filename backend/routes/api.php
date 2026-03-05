<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\UsuarioController;

// Rutas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/usuarios', [UsuarioController::class, 'index']); //Muestra todos los usuarios
Route::get('/usuarios/{id}', [UsuarioController::class, 'show']); //Al probar la ruta en postman, hay que poner % en le id en vez de # porque si no no muestra individualmente el registro.
Route::delete('/usuarios/{id}', [UsuarioController::class, 'destroy']); //Elimina usuario
Route::post('/usuario/baja', [AuthController::class, 'baja']); //Dar de baja un usuario

Route::post('/xuxemons/{id}/evolucionar', [XuxemonController::class, 'subirNivel']);
Route::get('/xuxedex', [XuxemonController::class, 'mostrarXuxedex']);
