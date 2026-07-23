<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php', // Active le support des fichiers de routes API
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Configuration globale des Middlewares si nécessaire
        $middleware->alias([
        'role' => \App\Http\Middleware\RoleMiddleware::class, // Assure-toi de mettre le bon nom de ton middleware ici
    ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();