<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\AuthController;
// use App\Http\Controllers\UsuarioController;

Route::post('/login',   [AuthController::class, 'login']);
Route::post('/usuario', [AuthController::class, 'register']);
Route::post('/logout',  [AuthController::class, 'logout']);

// Route::get('/usuario/{id}',    [UsuarioController::class, 'listarInfo']);
// Route::put('/usuario/{id}',    [UsuarioController::class, 'actualizarUsuario']);
// Route::delete('/usuario/{id}', [UsuarioController::class, 'borrarUsuario']);