<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\SmsLog;
use Twilio\Http\CurlClient;
use Twilio\Rest\Client;
use Illuminate\Support\Facades\Log;
use Exception;

class SmsNotificationService
{
    protected Client $twilioClient;
    protected bool $enabled;
    protected string $fromNumber;

    public function __construct()
    {
        $this->enabled = config('twilio.sms.enabled');
        $this->fromNumber = config('twilio.sms.from') ?: config('twilio.phone_number');

        if (!$this->fromNumber) {
            $this->enabled = false;
            Log::warning('Twilio from number is not configured');
        }

        if ($this->enabled) {
            try {
                $accountSid = config('twilio.account_sid');
                $authToken = config('twilio.auth_token');

                if (!$accountSid || !$authToken) {
                    $this->enabled = false;
                    Log::warning('Twilio credentials not configured');
                } else {
                    $sslVerify = config('twilio.sms.ssl_verify', true);
                    $cacertPath = config('twilio.sms.cacert_path') ?: env('TWILIO_CACERT_PATH');

                    $curlOptions = [
                        CURLOPT_SSL_VERIFYPEER => $sslVerify,
                        CURLOPT_SSL_VERIFYHOST => $sslVerify ? 2 : 0,
                    ];

                    if (!empty($cacertPath) && file_exists($cacertPath)) {
                        $curlOptions[CURLOPT_CAINFO] = $cacertPath;
                    }

                    $httpClient = new CurlClient($curlOptions);
                    $this->twilioClient = new Client($accountSid, $authToken, null, null, $httpClient);
                }
            } catch (Exception $e) {
                $this->enabled = false;
                Log::error('Failed to initialize Twilio client', ['error' => $e->getMessage()]);
            }
        }
    }

    /**
     * Envoyer un SMS à un utilisateur
     */
    public function sendToUser(User $user, string $message): bool
    {
        if (!$this->enabled || !$user->phone || !$user->phone_verified) {
            return false;
        }

        return $this->send($user->phone, $message);
    }

    /**
     * Envoyer un SMS à un numéro de téléphone spécifique
     */
    public function send(string $phoneNumber, string $message): bool
    {
        if (!$this->enabled) {
            Log::warning('SMS notifications are disabled');
            return false;
        }

        try {
            // Valider et formater le numéro
            $formattedNumber = $this->formatPhoneNumber($phoneNumber);
            if (!$formattedNumber) {
                Log::warning('Invalid phone number', ['original' => $phoneNumber]);
                return false;
            }

            // Limiter la longueur du message
            $message = $this->truncateMessage($message);

            // Envoyer via Twilio
            $response = $this->twilioClient->messages->create(
                $formattedNumber,
                [
                    'from' => $this->fromNumber,
                    'body' => $message,
                ]
            );

            if ($response->sid) {
                $this->logSms($phoneNumber, $message, 'sent', $response->sid);
                return true;
            }

            $this->logSms($phoneNumber, $message, 'failed', null);
            return false;

        } catch (Exception $e) {
            Log::error('Failed to send SMS', [
                'phone' => $phoneNumber,
                'error' => $e->getMessage(),
            ]);
            $this->logSms($phoneNumber, $message, 'error', null, $e->getMessage());
            return false;
        }
    }

    /**
     * Envoyer des SMS à plusieurs utilisateurs
     */
    public function sendBatch(array $users, string $message): array
    {
        $results = [
            'success' => 0,
            'failed' => 0,
            'skipped' => 0,
            'details' => [],
        ];

        foreach ($users as $user) {
            if (!$user->phone || !$user->phone_verified) {
                $results['skipped']++;
                $results['details'][] = [
                    'user_id' => $user->id,
                    'status' => 'skipped',
                    'reason' => 'No verified phone',
                ];
                continue;
            }

            $success = $this->sendToUser($user, $message);
            
            if ($success) {
                $results['success']++;
            } else {
                $results['failed']++;
            }

            $results['details'][] = [
                'user_id' => $user->id,
                'status' => $success ? 'sent' : 'failed',
            ];
        }

        return $results;
    }

    /**
     * Envoyer une notification de réservation (nouveau)
     */
    public function notifyNewBooking($booking): bool
    {
        $booking->load(['trip.driver', 'passenger']);
        $trip = $booking->trip;
        $passenger = $booking->passenger;
        $driver = $trip->driver;

        $message = "Nouvelle réservation! {$passenger->name} demande {$booking->seats_booked} place(s) pour {$trip->departure_city} → {$trip->arrival_city} le {$trip->departure_date->format('d/m')}. À {$trip->departure_time}";

        return $this->sendToUser($driver, $this->truncateMessage($message));
    }

    /**
     * Envoyer une notification de confirmation de réservation
     */
    public function notifyBookingConfirmed($booking): bool
    {
        $booking->load(['trip.driver', 'passenger']);
        $trip = $booking->trip;
        $driver = $trip->driver;

        $message = "Réservation confirmée! {$driver->name} a accepté votre réservation pour {$trip->departure_city} → {$trip->arrival_city} le {$trip->departure_date->format('d/m')} à {$trip->departure_time}";

        return $this->sendToUser($booking->passenger, $this->truncateMessage($message));
    }

    /**
     * Envoyer une notification d'annulation
     */
    public function notifyBookingCancelled($booking, string $cancelledBy = 'passenger'): bool
    {
        $booking->load(['trip.driver', 'passenger']);
        $trip = $booking->trip;

        if ($cancelledBy === 'passenger') {
            $message = "Annulation: {$booking->passenger->name} a annulé sa réservation pour {$trip->departure_city} → {$trip->arrival_city}";
            return $this->sendToUser($trip->driver, $this->truncateMessage($message));
        } else {
            $message = "Annulation: Le conducteur a annulé votre réservation pour {$trip->departure_city} → {$trip->arrival_city}. Montant remboursé: {$booking->total_price}€";
            return $this->sendToUser($booking->passenger, $this->truncateMessage($message));
        }
    }

    /**
     * Envoyer un rappel de trajet
     */
    public function sendTripReminder($trip, string $reminderType = 'h24'): bool
    {
        $trip->load(['driver', 'bookings.passenger']);

        $messages = [
            'h24' => "Rappel: Votre trajet {$trip->departure_city} → {$trip->arrival_city} part demain à {$trip->departure_time}. Vérifiez que vous êtes prêt!",
            'h2' => "Départ dans 2h! Trajet {$trip->departure_city} → {$trip->arrival_city} à {$trip->departure_time}. À bientôt!",
            'departure' => "Votre trajet {$trip->departure_city} → {$trip->arrival_city} commence maintenant! Point de départ: {$trip->departure_point}",
        ];

        $message = $messages[$reminderType] ?? $messages['h24'];

        // Envoyer au conducteur
        $driverResult = $this->sendToUser($trip->driver, $this->truncateMessage($message));

        // Envoyer aux passagers
        $results = ['driver' => $driverResult, 'passengers' => []];
        
        foreach ($trip->bookings as $booking) {
            if (in_array($booking->status, ['pending', 'confirmed'])) {
                $passengerMessage = "Rappel de trajet: {$trip->departure_city} → {$trip->arrival_city} " . 
                    ($reminderType === 'h24' ? 'demain' : ($reminderType === 'h2' ? 'dans 2h' : 'maintenant')) .
                    " à {$trip->departure_time}";
                
                $results['passengers'][] = $this->sendToUser(
                    $booking->passenger,
                    $this->truncateMessage($passengerMessage)
                );
            }
        }

        return $driverResult;
    }

    /**
     * Envoyer une notification de paiement
     */
    public function notifyPaymentReceived($payment): bool
    {
        $message = "Paiement reçu! Montant: {$payment->amount}€. Référence: {$payment->reference}";
        
        if ($payment->user_id) {
            return $this->sendToUser(
                User::find($payment->user_id),
                $this->truncateMessage($message)
            );
        }

        return false;
    }

    /**
     * Envoyer une notification de remboursement
     */
    public function notifyRefund($payment): bool
    {
        $message = "Remboursement traité! Montant: {$payment->amount}€. Vous recevrez l'argent dans 3-5 jours ouvrables.";
        
        if ($payment->user_id) {
            return $this->sendToUser(
                User::find($payment->user_id),
                $this->truncateMessage($message)
            );
        }

        return false;
    }

    /**
     * Formater un numéro de téléphone
     */
    protected function formatPhoneNumber(string $phoneNumber): ?string
    {
        // Supprimer les espaces, tirets, parenthèses
        $cleaned = preg_replace('/[^\d+]/', '', $phoneNumber);

        // Vérifier si le numéro commence par + (format international)
        if (!str_starts_with($cleaned, '+')) {
            // Ajouter le préfixe pour la France si absent
            if (str_starts_with($cleaned, '0')) {
                $cleaned = '+33' . substr($cleaned, 1);
            } elseif (!str_starts_with($cleaned, '33')) {
                $cleaned = '+33' . $cleaned;
            } else {
                $cleaned = '+' . $cleaned;
            }
        }

        // Valider le format (doit avoir entre 10 et 15 chiffres)
        $digitCount = strlen(preg_replace('/[^\d]/', '', $cleaned));
        if ($digitCount < 10 || $digitCount > 15) {
            return null;
        }

        return $cleaned;
    }

    /**
     * Tronquer un message à la longueur limite (avec gestion des caractères spéciaux)
     */
    protected function truncateMessage(string $message, int $maxLength = 160): string
    {
        if (strlen($message) <= $maxLength) {
            return $message;
        }

        return substr($message, 0, $maxLength - 3) . '...';
    }

    /**
     * Logger un envoi SMS
     */
    protected function logSms(
        string $phoneNumber,
        string $message,
        string $status,
        ?string $sid = null,
        ?string $error = null
    ): void {
        if (!config('twilio.log_enabled')) {
            return;
        }

        $logData = [
            'phone' => $phoneNumber,
            'message_length' => strlen($message),
            'status' => $status,
            'timestamp' => now()->toIso8601String(),
        ];

        if ($sid) {
            $logData['sid'] = $sid;
        }

        if ($error) {
            $logData['error'] = $error;
        }

        $channel = config('twilio.log_channel', 'stack');

        if ($status === 'error' || $status === 'failed') {
            Log::channel($channel)->warning('SMS notification failed', $logData);
        } else {
            Log::channel($channel)->info('SMS sent', $logData);
        }

        // Sauvegarder dans la base de données
        try {
            // Trouver l'utilisateur par numéro de téléphone si possible
            $user = User::where('phone', $phoneNumber)->first();

            SmsLog::create([
                'user_id' => $user?->id,
                'phone_number' => $phoneNumber,
                'message' => $message,
                'status' => $status,
                'twilio_sid' => $sid,
                'error_message' => $error,
            ]);
        } catch (Exception $e) {
            Log::channel($channel)->warning('Failed to log SMS to database', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Vérifier si les SMS sont activés
     */
    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    /**
     * Vérifier la configuration Twilio
     */
    public function isConfigured(): bool
    {
        return config('twilio.account_sid') && config('twilio.auth_token') && config('twilio.phone_number');
    }
}
