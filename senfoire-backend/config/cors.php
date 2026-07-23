<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'], // Autorise GET, POST, PUT, DELETE, etc.

    'allowed_origins' => ['*'], // En développement, on autorise tout. Tu pourras restreindre à ['http://localhost:5173'] plus tard.

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'], // Très important pour accepter le header 'Authorization: Bearer <token>'

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true, // Permet de gérer la sécurité et les cookies de session si besoin

];