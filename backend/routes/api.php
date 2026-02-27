<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\AuthController;
// use App\Http\Controllers\UsuarioController;

// Sin middleware por ahora para pruebas
// Rutas abiertas para pruebas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
//Finalmente tendra que ir dentro de un middleawre, pero ahora esta asi para probar que funcionen las rutas
//Route::get('/me', [AuthController::class, 'me']);      
Route::post('/logout', [AuthController::class, 'logout']); 
