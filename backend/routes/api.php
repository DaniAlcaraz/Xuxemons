<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\UsuarioController;

// Sin middleware por ahora para pruebas
// Rutas abiertas para pruebas
Route::post('/register', [AuthController::class, 'register']); //Crea un usuario (Lo registra)
Route::post('/login', [AuthController::class, 'login']);
//Finalmente tendra que ir dentro de un middleawre, pero ahora esta asi para probar que funcionen las rutas
//Route::get('/me', [AuthController::class, 'me']);      
//Route::post('/logout', [AuthController::class, 'logout']); 

Route::get('/usuarios', [UsuarioController::class, 'index']); //Muestra todos los usuarios
Route::get('/usuarios/{id}', [UsuarioController::class, 'show']); //Al probar la ruta en postman, hay que poner % en le id en vez de # porque si no no muestra individualmente el registro.
Route::delete('/usuarios/{id}', [UsuarioController::class, 'destroy']); //Elimina usuario