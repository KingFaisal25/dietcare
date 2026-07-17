<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;

Route::get('/', function () {
    return view('welcome');
});

/*
|--------------------------------------------------------------------------
| SPA Auth Routes (web middleware — session + CSRF required for Sanctum SPA)
|--------------------------------------------------------------------------
*/
Route::prefix('api')->middleware('web')->group(function () {
    // Endpoint utama: mengembalikan raw CSRF token (dikirim sebagai X-CSRF-TOKEN header)
    Route::get('/csrf', function () {
        return response()->json(['token' => csrf_token()]);
    });

    if (app()->environment('local')) {
        Route::get('/test-profile-bug', function () {
            $logFile = storage_path('logs/laravel.log');
            if (!file_exists($logFile)) return 'No log file';

            $lines = file($logFile);
            $lastLines = array_slice($lines, -50);
            return response()->json(['log' => $lastLines]);
        });
    }

    // Debug endpoint: periksa status session dan CSRF (hanya untuk development)
    if (app()->environment('local')) {
        Route::get('/csrf-debug', function () {
            return response()->json([
                'session_id'   => session()->getId(),
                'csrf_token'   => csrf_token(),
                'session_started' => session()->isStarted(),
                'session_driver'  => config('session.driver'),
                'app_key_set'  => !empty(config('app.key')),
            ]);
        });
    }

    Route::post('/register', [AuthController::class, 'register'])
        ->middleware('prevent_role_escalation');
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:api-login');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});
