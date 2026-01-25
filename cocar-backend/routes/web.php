<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'Rideshare API',
        'version' => '1.0.0',
        'description' => 'API Backend pour l\'application de covoiturage',
        'documentation' => '/api/docs',
    ]);
});
