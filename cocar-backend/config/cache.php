<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Cache Store
    |--------------------------------------------------------------------------
    |
    | Le workspace contient une config "light". Sans ce fichier, Laravel peut
    | se rabattre sur un store DB et tenter d'accéder à la table `cache`.
    | On force donc un défaut "file" (sans dépendance DB) tout en conservant
    | la possibilité de surcharger via .env.
    |
    */

    'default' => 'file',

    'stores' => [
        'array' => [
            'driver' => 'array',
            'serialize' => false,
        ],

        'file' => [
            'driver' => 'file',
            'path' => storage_path('framework/cache/data'),
            'lock_path' => storage_path('framework/cache/data'),
        ],

        'database' => [
            'driver' => 'database',
            'table' => 'cache',
            'connection' => null,
            'lock_connection' => null,
        ],

        'redis' => [
            'driver' => 'redis',
            'connection' => 'cache',
            'lock_connection' => 'default',
        ],
    ],

    'prefix' => env(
        'CACHE_PREFIX',
        'rideshare_cache_'
    ),
];
