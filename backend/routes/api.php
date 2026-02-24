<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function() { //Para que haga uso de middleware. Basicamente las rutas dentro de est solamente se puedne acceder is el usuario  esta logueado
    Route::post('/logout', [AuthController::class, 'logout']); //Permite la usuario salir de la aplciacion
    Route::post('/user', [AuthController::class, 'me']); //Define el URL al que angular debe llamar para obtener los datos del usuario logueado
});
