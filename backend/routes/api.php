<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ThreatController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Threat logging endpoints
Route::post('/threats', [ThreatController::class, 'store']);
Route::get('/threats/recent', [ThreatController::class, 'recent']);
Route::get('/threats/stats', [ThreatController::class, 'stats']);
Route::get('/threats/map', [ThreatController::class, 'map']);
