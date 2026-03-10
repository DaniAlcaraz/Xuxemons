<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\UsuarioController;
use App\Models\Xuxemon;
use App\Models\Coleccion;

// ── Rutas públicas ────────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ── Rutas protegidas con Sanctum ──────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/usuario', [AuthController::class, 'update']);
    Route::post('/usuario/baja', [AuthController::class, 'baja']);

    // ── Colección del usuario (Xuxedex / Mochila) ─────────────────────────────

    // GET /coleccion → devuelve todos los xuxemons del usuario autenticado
    Route::get('/coleccion', function (Request $request) {
        $usuario = $request->user();

        // Cargamos cada entrada de coleccion con su xuxemon
        $coleccion = Coleccion::where('usuario_id', $usuario->identificador)
            ->with('xuxemon')
            ->get();

        return response()->json([
            'total' => $coleccion->count(),
            'coleccion' => $coleccion->map(function ($entrada) {
                return [
                    'coleccion_id' => $entrada->id,
                    'xuxemon' => $entrada->xuxemon,
                ];
            }),
        ]);
    });

    // POST /coleccion/añadir-aleatorio → añade un xuxemon aleatorio a la colección
    Route::post('/coleccion/anadir-aleatorio', function (Request $request) {
        $usuario = $request->user();

        // Seleccionamos un xuxemon aleatorio de todos los existentes
        $xuxemon = Xuxemon::inRandomOrder()->first();

        if (!$xuxemon) {
            return response()->json(['error' => 'No hay xuxemons disponibles'], 404);
        }

        // Lo añadimos a la colección (se permiten repetidos)
        $entrada = Coleccion::create([
            'usuario_id' => $usuario->identificador,
            'xuxemon_id' => $xuxemon->IDxuxemon,
        ]);

        return response()->json([
            'mensaje' => '¡Nuevo xuxemon añadido a tu colección!',
            'xuxemon' => $xuxemon,
            'coleccion_id' => $entrada->id,
        ], 201);
    });
});

// ── Rutas de gestión de usuarios ──────────────────────────────────────────────
Route::get('/usuarios', [UsuarioController::class, 'index']);
Route::get('/usuarios/{id}', [UsuarioController::class, 'show']);
Route::delete('/usuarios/{id}', [UsuarioController::class, 'destroy']);

// ── Rutas de Xuxemons (catálogo global) ───────────────────────────────────────
Route::get('/xuxemons', function () {
    return response()->json(Xuxemon::all());
});

Route::get('/xuxemons/{id}', function ($id) {
    $xuxemon = Xuxemon::find($id);
    return $xuxemon
        ? response()->json($xuxemon)
        : response()->json(['error' => 'No encontrado'], 404);
});

Route::post('/xuxemons/{id}/evolucionar', function ($id) {
    $xuxemon = Xuxemon::find($id);
    if (!$xuxemon) return response()->json(['error' => 'No encontrado'], 404);

    $xuxemon->evolucionar();
    return response()->json(['mensaje' => '¡Evolucionado!', 'xuxemon' => $xuxemon]);
});