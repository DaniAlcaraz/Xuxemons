<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuarioController;

// Sin middleware por ahora para pruebas
Route::post('/login',   [AuthController::class, 'loginUsuario']);
Route::post('/usuario', [AuthController::class, 'registroUsuario']);
Route::post('/logout',  [AuthController::class, 'logoutUsuario']);

Route::get('/usuario/{id}',    [UsuarioController::class, 'listarInfo']);
Route::put('/usuario/{id}',    [UsuarioController::class, 'actualizarUsuario']);
Route::delete('/usuario/{id}', [UsuarioController::class, 'borrarUsuario']);
