<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TripController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\RatingController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\UserVehicleController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\VerificationController;
use App\Http\Controllers\Api\FeedController;
use App\Http\Controllers\Api\AnalyticsController;

/*
|--------------------------------------------------------------------------
| API Routes - Application de Covoiturage Rideshare
|--------------------------------------------------------------------------
*/

// ============ ROUTES PUBLIQUES ============

// Authentification (rate limiting strict : 5 tentatives par minute)
Route::prefix('auth')->middleware('throttle:5,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/refresh', [AuthController::class, 'refresh']); // Refresh token
});

// Fil d'actualité (lecture publique)
Route::get('/feed', [FeedController::class, 'index']);

// Trajets (lecture publique)
Route::get('/trips', [TripController::class, 'index']);
Route::get('/trips/search', [TripController::class, 'search']);
Route::get('/trips/{trip}', [TripController::class, 'show']);

// Profil utilisateur public
Route::get('/users/{user}/profile', [UserController::class, 'profile']);

// Webhooks de paiement (routes publiques pour les callbacks)
Route::post('/webhooks/payment/{provider}', [PaymentController::class, 'webhook']);

// Évaluations (lecture publique)
Route::get('/ratings/user/{user}', [RatingController::class, 'userRatings']);
Route::get('/ratings/user/{user}/average', [RatingController::class, 'userAverage']);
Route::get('/ratings/trip/{trip}', [RatingController::class, 'tripRatings']);


// ============ ROUTES PROTÉGÉES (authentification requise) ============

Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    
    // --- Authentification ---
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/profile/password', [AuthController::class, 'changePassword']);
        Route::post('/profile/avatar', [AuthController::class, 'uploadAvatar']);
        Route::delete('/profile/avatar', [AuthController::class, 'deleteAvatar']);
    });
    
    // --- Statistiques utilisateur ---
    Route::get('/user/stats', [UserController::class, 'stats']);
    
    // --- Profil utilisateur ---
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::post('/user/avatar', [UserController::class, 'uploadAvatar']);
    Route::delete('/user/avatar', [UserController::class, 'deleteAvatar']);
    
    // --- Véhicules utilisateur ---
    Route::get('/user/vehicles', [UserVehicleController::class, 'index']);
    Route::post('/user/vehicles', [UserVehicleController::class, 'store']);
    Route::get('/user/vehicles/{id}', [UserVehicleController::class, 'show']);
    Route::put('/user/vehicles/{id}', [UserVehicleController::class, 'update']);
    Route::delete('/user/vehicles/{id}', [UserVehicleController::class, 'destroy']);
    Route::post('/user/vehicles/{id}/set-default', [UserVehicleController::class, 'setDefault']);

    // --- Photos des véhicules utilisateur ---
    Route::get('/user/vehicles/{id}/photos', [UserVehicleController::class, 'listPhotos']);
    Route::post('/user/vehicles/{id}/photos', [UserVehicleController::class, 'uploadPhoto']);
    Route::post('/user/vehicles/{id}/photos/{photoId}/primary', [UserVehicleController::class, 'setPrimaryPhoto']);
    Route::delete('/user/vehicles/{id}/photos/{photoId}', [UserVehicleController::class, 'deletePhoto']);
    
    // --- Trajets ---
    Route::get('/my-trips', [TripController::class, 'myTrips']);
    Route::post('/trips', [TripController::class, 'store']);
    Route::put('/trips/{trip}', [TripController::class, 'update']);
    Route::delete('/trips/{trip}', [TripController::class, 'destroy']);
    
    // --- Réservations ---
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/my-bookings', [BookingController::class, 'myBookings']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);
    Route::post('/bookings/{booking}/confirm', [BookingController::class, 'confirm']);
    Route::post('/bookings/{booking}/reject', [BookingController::class, 'reject']);
    Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);
    
    // Confirmation de départ (système escrow)
    Route::post('/bookings/{booking}/confirm-departure/driver', [BookingController::class, 'confirmDepartureByDriver']);
    Route::post('/bookings/{booking}/confirm-departure/passenger', [BookingController::class, 'confirmDepartureByPassenger']);
    Route::post('/bookings/{booking}/no-show', [BookingController::class, 'markNoShow']);
    Route::post('/bookings/{booking}/driver-no-show', [BookingController::class, 'markDriverNoShow']);
    Route::get('/bookings/{booking}/departure-status', [BookingController::class, 'departureStatus']);
    
    // Validation du départ par le chauffeur (avec codes passagers)
    Route::post('/trips/{trip}/validate-departure', [BookingController::class, 'validateDeparture']);
    
    // --- Paiements (rate limiting strict : 3 tentatives par minute) ---
    Route::middleware('throttle:3,1')->group(function () {
        Route::post('/payments/process', [PaymentController::class, 'process']);
        Route::post('/payments/{payment}/confirm-cash', [PaymentController::class, 'confirmCash']);
        Route::post('/payments/{payment}/refund', [PaymentController::class, 'requestRefund']);
        Route::post('/wallet/withdraw', [PaymentController::class, 'withdraw']);
    });
    Route::get('/payments/methods', [PaymentController::class, 'methods']);
    Route::get('/payments/history', [PaymentController::class, 'history']);
    Route::get('/payments/status/{transactionId}', [PaymentController::class, 'status']);

    // --- Portefeuille (Wallet) ---
    Route::get('/wallet', [PaymentController::class, 'wallet']);
    Route::get('/wallet/transactions', [PaymentController::class, 'walletTransactions']);

    // --- Analytics ---
    Route::get('/analytics/driver/financial', [AnalyticsController::class, 'driverFinancial']);
    
    // --- Évaluations ---
    Route::post('/ratings', [RatingController::class, 'store']);
    Route::get('/ratings/can-rate/{trip}', [RatingController::class, 'canRate']);
    
    // --- Véhicules ---
    Route::get('/my-vehicles', [VehicleController::class, 'index']);
    Route::get('/vehicles/{vehicle}', [VehicleController::class, 'show']);
    Route::post('/vehicles', [VehicleController::class, 'store']);
    Route::put('/vehicles/{vehicle}', [VehicleController::class, 'update']);
    Route::delete('/vehicles/{vehicle}', [VehicleController::class, 'destroy']);
    
    // --- Notifications ---
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);
    
    // --- Vérification d'identité ---
    Route::prefix('verification')->group(function () {
        Route::post('/documents', [VerificationController::class, 'uploadDocuments']);
        Route::post('/phone/send', [VerificationController::class, 'sendPhoneVerification']);
        Route::post('/phone/verify', [VerificationController::class, 'verifyPhone']);
        Route::get('/status', [VerificationController::class, 'status']);
    });
    
    // --- Messagerie ---
    Route::get('/conversations', [MessageController::class, 'conversations']);
    Route::get('/conversations/{conversation}/messages', [MessageController::class, 'messages']);
    Route::post('/conversations/{conversation}/messages', [MessageController::class, 'sendMessage']);
    Route::post('/conversations/{conversation}/mark-read', [MessageController::class, 'markAsRead']);
    Route::post('/conversations/{conversation}/typing', [MessageController::class, 'typing']);
    Route::post('/conversations/trip/{trip}', [MessageController::class, 'getOrCreateTripConversation']);
    Route::post('/conversations/support', [MessageController::class, 'createSupportConversation']);
    Route::get('/messages/unread-count', [MessageController::class, 'unreadCount']);
    
    // ============ ROUTES ADMIN ============
    Route::prefix('admin')->middleware(\App\Http\Middleware\AdminMiddleware::class)->group(function () {
        // Dashboard stats
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/activity', [AdminController::class, 'recentActivity']);
        
        // Gestion des utilisateurs
        Route::get('/users', [AdminController::class, 'users']);
        Route::post('/users/{user}/verify', [AdminController::class, 'verifyUser']);
        Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);
        
        // Vérification des documents utilisateurs
        Route::post('/verification/{user}/approve', [VerificationController::class, 'approve']);
        Route::post('/verification/{user}/reject', [VerificationController::class, 'reject']);
        
        // Gestion des trajets
        Route::get('/trips', [AdminController::class, 'trips']);
        Route::delete('/trips/{trip}', [AdminController::class, 'deleteTrip']);
        
        // Gestion des réservations
        Route::get('/bookings', [AdminController::class, 'bookings']);
        Route::post('/bookings/{booking}/confirm', [AdminController::class, 'confirmBooking']);
        Route::post('/bookings/{booking}/cancel', [AdminController::class, 'cancelBooking']);

        // Analytics entreprise + rapport imprimable
        Route::get('/analytics/company/financial', [AnalyticsController::class, 'companyFinancial']);
        Route::get('/analytics/company/financial.pdf', [AnalyticsController::class, 'companyFinancialPdf']);
        
        // Statistiques de crédibilité
        Route::get('/analytics/credibility', [AdminController::class, 'credibilityStats']);
        
        // Rapport financier PDF
        Route::get('/reports/financial', [AdminController::class, 'generateFinancialReport']);
    });
});
