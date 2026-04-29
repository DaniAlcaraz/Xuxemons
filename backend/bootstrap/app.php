<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php', // Rutas web (con sesión, CSRF, etc.)
        api: __DIR__.'/../routes/api.php', // Rutas API REST (prefijo /api automático)
        commands: __DIR__.'/../routes/console.php', // Comandos Artisan personalizados
        health: '/up', // Endpoint de salud para verificar que el servidor funciona
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Aquí se registran middlewares globales o de grupo
        // Por ejemplo: autenticación JWT, CORS, throttle, etc.
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Aquí se personaliza el manejo de excepciones
        // Por ejemplo: formato JSON para errores 404/500 en la API
    })->create(); // Construye y devuelve la instancia de la aplicación
