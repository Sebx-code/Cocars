<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Twilio Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration pour l'intégration Twilio SMS
    |
    */

    'account_sid' => env('TWILIO_ACCOUNT_SID'),
    'auth_token' => env('TWILIO_AUTH_TOKEN'),
    'phone_number' => env('TWILIO_PHONE_NUMBER'),
    
    /*
    |--------------------------------------------------------------------------
    | SMS Settings
    |--------------------------------------------------------------------------
    |
    | Configuration des paramètres SMS
    |
    */

    'sms' => [
        'enabled' => env('SMS_NOTIFICATIONS_ENABLED', false),
        'from' => env('TWILIO_PHONE_NUMBER'),
        'max_length' => 160,
        'batch_size' => 20,
        'ssl_verify' => env('TWILIO_SSL_VERIFY', true),
        'cacert_path' => env('TWILIO_CACERT_PATH', null),
    ],

    /*
    |--------------------------------------------------------------------------
    | Notification Types Configuration
    |--------------------------------------------------------------------------
    |
    | Quels types de notifications doivent être envoyés par SMS
    |
    */

    'notification_types' => [
        'booking_new' => true,
        'booking_confirmed' => true,
        'booking_cancelled' => true,
        'booking_completed' => true,
        'trip_reminder' => true,
        'trip_cancelled' => true,
        'trip_updated' => true,
        'message_new' => false,
        'payment_received' => true,
        'payment_refund' => true,
        'verification_approved' => true,
        'verification_rejected' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Log Settings
    |--------------------------------------------------------------------------
    |
    | Logging des envois SMS
    |
    */

    'log_enabled' => env('SMS_LOG_ENABLED', true),
    'log_channel' => env('SMS_LOG_CHANNEL', 'stack'),
];
