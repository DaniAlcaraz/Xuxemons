<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\MochilaController;
use App\Http\Controllers\XuxemonController;
use App\Http\Controllers\AmistadController;


// ── Rutas públicas ────────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::get('/items',     [MochilaController::class, 'catalogoItems']);

// ── Rutas protegidas con Sanctum ──────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Perfil de usuario
    Route::put('/usuario',        [UsuarioController::class, 'update']);
    Route::post('/usuario/baja',  [AuthController::class, 'baja']);

    // Mochila
    Route::get('/mochila',         [MochilaController::class, 'index']);
    Route::post('/mochila/anadir', [MochilaController::class, 'anadir']);
    Route::post('/mochila/quitar', [MochilaController::class, 'quitar']);

    // Admin mochila y xuxemons de usuario
    Route::get('/admin/mochila', function(\Illuminate\Http\Request $request) {
        $id      = $request->query('user');
        $mochila = \App\Models\Mochila::where('user_identificador', $id)->with('item')->get();
        return response()->json($mochila);
    });
    Route::get('/admin/usuarios/{identificador}/xuxemons', function($id) {
        $user = \App\Models\User::where('identificador', $id)->firstOrFail();
        return response()->json($user->xuxemons()->withPivot('enfermo', 'enfermedad')->get());
    });
    Route::get('/admin/usuarios/{identificador}/xuxes-diarios', [UsuarioController::class, 'obtenerXuxesDiariosConfig']);
    Route::put('/admin/usuarios/{identificador}/xuxes-diarios', [UsuarioController::class, 'actualizarXuxesDiariosConfig']);
    Route::get('/admin/usuarios/{identificador}/xuxemons-diarios', [UsuarioController::class, 'obtenerXuxemonsDiariosConfig']);
    Route::put('/admin/usuarios/{identificador}/xuxemons-diarios', [UsuarioController::class, 'actualizarXuxemonsDiariosConfig']);

    // Xuxemons — rutas fijas SIEMPRE antes que las dinámicas {id}
    Route::get('/xuxemons',        [XuxemonController::class, 'index']);
    Route::get('/xuxemons/me',     [XuxemonController::class, 'misXuxemons']);
    Route::post('/xuxemons/curar', [XuxemonController::class, 'curarXuxemon']);
    Route::post('/xuxemons/{id}/evolucionar', [XuxemonController::class, 'subirNivel']);

    // Admin xuxemons
    Route::prefix('admin/xuxemons')->group(function () {
        Route::post('/anadir',    [XuxemonController::class, 'anadirXuxemon']);
        Route::post('/quitar',    [XuxemonController::class, 'quitarXuxemon']);
        Route::post('/aleatorio', [XuxemonController::class, 'anadirAleatorio']);
        Route::post('/enfermar',  [XuxemonController::class, 'enfermarXuxemon']);
    });

    // Configuración global de xuxes
    Route::get('/configuracion/xuxes',  [XuxemonController::class, 'getConfigXuxes']);
    Route::post('/configuracion/xuxes', [XuxemonController::class, 'setConfigXuxes']);

    // Amistades
    Route::prefix('amigos')->group(function () {
    Route::get('/buscar',                [AmistadController::class, 'buscar']);            // GET  /api/amigos/buscar?q=...
    Route::post('/solicitud',            [AmistadController::class, 'enviarSolicitud']);   // POST /api/amigos/solicitud
    Route::get('/solicitudes',           [AmistadController::class, 'solicitudesRecibidas']); // GET  /api/amigos/solicitudes
    Route::post('/solicitud/{id}/aceptar',  [AmistadController::class, 'aceptar']);       // POST /api/amigos/solicitud/{id}/aceptar
    Route::post('/solicitud/{id}/rechazar', [AmistadController::class, 'rechazar']);      // POST /api/amigos/solicitud/{id}/rechazar
    Route::get('/',                      [AmistadController::class, 'listaAmigos']);       // GET  /api/amigos
    Route::delete('/{id}',               [AmistadController::class, 'eliminarAmigo']);    // DELETE /api/amigos/{id}
});
});

// Rutas de gestión de usuarios
Route::get('/usuarios',         [UsuarioController::class, 'index']);
Route::get('/usuarios/{id}',    [UsuarioController::class, 'show']);
Route::delete('/usuarios/{id}', [UsuarioController::class, 'destroy']);