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

Route::get('/usuarios', [UsuarioController::class, 'index']); //Muestra todos los usuarios
Route::get('/usuarios/{id}', [UsuarioController::class, 'show']); //Al probar la ruta en postman, hay que poner % en le id en vez de # porque si no no muestra individualmente el registro.
Route::delete('/usuarios/{id}', [UsuarioController::class, 'destroy']); //Elimina usuario
Route::post('/usuario/baja', [AuthController::class, 'baja']); //Dar de baja un usuario

//Mostrar xuxemons
Route::get('/xuxemons', function () {
    return Xuxemon::all();
});

// Ruta para mostrar un Xuxemon específico por su ID
Route::get('/xuxemons/{id}', function ($id) {
    // Buscamos por la clave primaria que definiste (IDxuxemon)
    $xuxemon = Xuxemon::find($id);

    // Si no existe, devolvemos un error 404 para que Postman nos avise
    if (!$xuxemon) {
        return response()->json(['error' => 'Xuxemon no encontrado'], 404);
    }

    return response()->json($xuxemon);
});

// Ruta para evolucionar un Xuxemon
Route::post('/xuxemons/{id}/evolucionar', function ($id) {
    // 1. Buscar al bicho
    $xuxemon = Xuxemon::find($id);

    if (!$xuxemon) {
        return response()->json(['error' => 'Xuxemon no encontrado'], 404);
    }

    // 2. Ejecutar la función que creamos en el modelo
    $xuxemon->evolucionar();

    // 3. Devolver el bicho ya actualizado para ver el cambio
    return response()->json([
        'mensaje' => '¡El Xuxemon ha evolucionado!',
        'xuxemon' => $xuxemon
    ]);
});