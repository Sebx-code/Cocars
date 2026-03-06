<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Trip;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }
    /**
     * Liste des réservations (pour un conducteur - ses trajets)
     */
    public function index(Request $request)
    {
        $query = Booking::with(['trip', 'passenger', 'payment'])
            ->whereHas('trip', function ($q) use ($request) {
                $q->where('driver_id', $request->user()->id);
            });

        // Filtre par trajet
        if ($request->filled('trip_id')) {
            $query->where('trip_id', $request->trip_id);
        }

        // Filtre par statut
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $bookings = $query->latest()->get();

        return $this->success($bookings);
    }

    /**
     * Mes réservations (en tant que passager)
     */
    public function myBookings(Request $request)
    {
        $query = $request->user()
            ->bookings()
            ->with(['trip.driver', 'payment']);

        // Filtre par statut
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $bookings = $query->latest()->get();

        return $this->success($bookings);
    }

    /**
     * Créer une réservation
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'trip_id' => 'required|exists:trips,id',
            'seats_booked' => 'required|integer|min:1|max:8',
            'message' => 'nullable|string|max:500',
            'pickup_point' => 'nullable|string|max:255',
            'dropoff_point' => 'nullable|string|max:255',
        ]);

        $user = $request->user();

        // Vérifications initiales hors transaction
        $trip = Trip::findOrFail($validated['trip_id']);

        if ($trip->driver_id === $user->id) {
            return $this->error('Vous ne pouvez pas réserver votre propre trajet', 400);
        }

        try {
            $booking = DB::transaction(function () use ($validated, $user) {
                // Verrouiller le trajet pour éviter la race condition sur les places
                $trip = Trip::lockForUpdate()->findOrFail($validated['trip_id']);

                if (!$trip->canBeBooked($validated['seats_booked'])) {
                    throw new \Exception('Ce trajet n\'est plus disponible ou n\'a pas assez de places', 400);
                }

                // Vérifier si l'utilisateur n'a pas déjà une réservation active
                $existingBooking = Booking::where('trip_id', $trip->id)
                    ->where('passenger_id', $user->id)
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->first();

                if ($existingBooking) {
                    throw new \Exception('Vous avez déjà une réservation active pour ce trajet', 409);
                }

                // Supprimer les anciennes réservations annulées/rejetées pour éviter la contrainte unique
                Booking::where('trip_id', $trip->id)
                    ->where('passenger_id', $user->id)
                    ->whereIn('status', ['rejected', 'cancelled'])
                    ->delete();

                $booking = Booking::create([
                    'trip_id' => $trip->id,
                    'passenger_id' => $user->id,
                    'seats_booked' => $validated['seats_booked'],
                    'total_price' => $trip->price_per_seat * $validated['seats_booked'],
                    'message' => $validated['message'] ?? null,
                    'pickup_point' => $validated['pickup_point'] ?? null,
                    'dropoff_point' => $validated['dropoff_point'] ?? null,
                    'status' => 'pending',
                ]);

                return $booking;
            });

            // Notifier le conducteur en temps réel (hors transaction)
            $this->notificationService->notifyNewBooking($booking);

            $booking->load(['trip.driver', 'passenger']);

            return $this->success($booking, 'Demande de réservation envoyée', 201);

        } catch (\Exception $e) {
            $code = $e->getCode() >= 400 ? $e->getCode() : 400;
            return $this->error($e->getMessage(), $code);
        }
    }

    /**
     * Afficher une réservation
     */
    public function show(Request $request, Booking $booking)
    {
        // Vérifier les autorisations
        $user = $request->user();
        if ($booking->passenger_id !== $user->id && $booking->trip->driver_id !== $user->id && !$user->isAdmin()) {
            return $this->error('Accès non autorisé', 403);
        }

        $booking->load(['trip.driver', 'passenger', 'payment']);

        return $this->success($booking);
    }

    /**
     * Confirmer une réservation (conducteur)
     */
    public function confirm(Request $request, Booking $booking)
    {
        // Vérifier que l'utilisateur est le conducteur
        if ($booking->trip->driver_id !== $request->user()->id) {
            return $this->error('Vous n\'êtes pas autorisé à confirmer cette réservation', 403);
        }

        if ($booking->status !== 'pending') {
            return $this->error('Cette réservation ne peut pas être confirmée', 400);
        }

        $validated = $request->validate([
            'driver_response' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($booking, $validated) {
            $booking->confirm($validated['driver_response'] ?? null);
        });

        return $this->success($booking->fresh(['trip', 'passenger']), 'Réservation confirmée');
    }

    /**
     * Rejeter une réservation (conducteur)
     */
    public function reject(Request $request, Booking $booking)
    {
        if ($booking->trip->driver_id !== $request->user()->id) {
            return $this->error('Vous n\'êtes pas autorisé à rejeter cette réservation', 403);
        }

        if ($booking->status !== 'pending') {
            return $this->error('Cette réservation ne peut pas être rejetée', 400);
        }

        $validated = $request->validate([
            'driver_response' => 'nullable|string|max:500',
        ]);

        $booking->reject($validated['driver_response'] ?? null);

        return $this->success($booking->fresh(['trip', 'passenger']), 'Réservation rejetée');
    }

    /**
     * Annuler une réservation (passager)
     */
    public function cancel(Request $request, Booking $booking)
    {
        if ($booking->passenger_id !== $request->user()->id) {
            return $this->error('Vous n\'êtes pas autorisé à annuler cette réservation', 403);
        }

        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return $this->error('Cette réservation ne peut pas être annulée', 400);
        }

        $validated = $request->validate([
            'cancellation_reason' => 'nullable|string|max:500',
        ]);

        // Utiliser la nouvelle méthode avec gestion du remboursement
        if ($booking->hasEscrowPayment()) {
            $booking->cancelWithRefund($validated['cancellation_reason'] ?? null, 'passenger');
        } else {
            $booking->cancel($validated['cancellation_reason'] ?? null);
        }

        return $this->success($booking->fresh(['trip', 'passenger', 'payment']), 'Réservation annulée');
    }

    /**
     * Conducteur confirme le départ d'un passager
     */
    public function confirmDepartureByDriver(Request $request, Booking $booking)
    {
        $user = $request->user();

        // Vérifier que l'utilisateur est le conducteur
        if ($booking->trip->driver_id !== $user->id) {
            return $this->error('Vous n\'êtes pas autorisé à confirmer ce départ', 403);
        }

        // Vérifier le statut de la réservation
        if ($booking->status !== Booking::STATUS_CONFIRMED) {
            return $this->error('La réservation doit être confirmée pour pouvoir signaler le départ', 400);
        }

        // Vérifier que le paiement est effectué
        if (!$booking->isPaid()) {
            return $this->error('Le passager doit d\'abord effectuer le paiement', 400);
        }

        // Vérifier si déjà confirmé
        if ($booking->driver_confirmed_departure) {
            return $this->error('Vous avez déjà confirmé le départ', 400);
        }

        $booking->driverConfirmsDeparture();

        $message = $booking->trip_started 
            ? 'Départ confirmé ! Le voyage a commencé et le paiement a été transféré.'
            : 'Départ confirmé ! En attente de la confirmation du passager.';

        return $this->success($booking->fresh(['trip', 'passenger', 'payment']), $message);
    }
    
    /**
     * Conducteur valide le départ du véhicule avec la liste des passagers présents
     * Permet de confirmer plusieurs passagers à la fois avec leurs codes
     */
    public function validateDeparture(Request $request, Trip $trip)
    {
        $user = $request->user();

        // Vérifier que l'utilisateur est le conducteur
        if ($trip->driver_id !== $user->id) {
            return $this->error('Vous n\'êtes pas autorisé à valider ce départ', 403);
        }

        // Valider les données
        $validated = $request->validate([
            'passenger_codes' => 'required|array|min:1',
            'passenger_codes.*' => 'required|integer|min:1',
            'total_passengers' => 'required|integer|min:1',
        ]);

        // Récupérer toutes les réservations confirmées et payées pour ce trajet
        $allBookings = $trip->bookings()
            ->where('status', Booking::STATUS_CONFIRMED)
            ->whereHas('payment', function($q) {
                $q->where('status', Payment::STATUS_COMPLETED);
            })
            ->with(['passenger', 'payment'])
            ->get();

        if ($allBookings->isEmpty()) {
            return $this->error('Aucune réservation confirmée et payée trouvée pour ce trajet', 400);
        }

        // Vérifier que le total correspond
        if ($validated['total_passengers'] != count($validated['passenger_codes'])) {
            return $this->error('Le nombre de passagers ne correspond pas au nombre de codes fournis', 400);
        }

        $presentBookings = [];
        $absentBookings = [];

        // Traiter chaque réservation
        foreach ($allBookings as $booking) {
            if (in_array($booking->passenger_code, $validated['passenger_codes'])) {
                // Passager présent - confirmer le départ
                if (!$booking->driver_confirmed_departure) {
                    $booking->driverConfirmsDeparture();
                }
                $presentBookings[] = $booking;
            } else {
                // Passager absent - marquer comme no-show
                if (!$booking->passenger_no_show && !$booking->driver_confirmed_departure) {
                    $booking->markAsNoShow();
                }
                $absentBookings[] = $booking;
            }
        }

        return $this->success([
            'trip' => $trip->fresh(['bookings.passenger', 'bookings.payment']),
            'present_count' => count($presentBookings),
            'absent_count' => count($absentBookings),
            'present_passengers' => collect($presentBookings)->map(fn($b) => [
                'booking_id' => $b->id,
                'passenger_code' => $b->passenger_code,
                'passenger_name' => $b->passenger->name,
                'trip_started' => $b->trip_started,
            ]),
            'absent_passengers' => collect($absentBookings)->map(fn($b) => [
                'booking_id' => $b->id,
                'passenger_code' => $b->passenger_code,
                'passenger_name' => $b->passenger->name,
                'refund_amount' => $b->payment->refund_amount ?? 0,
            ]),
        ], 'Départ validé avec succès');
    }

    /**
     * Passager confirme le départ
     */
    public function confirmDepartureByPassenger(Request $request, Booking $booking)
    {
        $user = $request->user();

        // Vérifier que l'utilisateur est le passager
        if ($booking->passenger_id !== $user->id) {
            return $this->error('Vous n\'êtes pas autorisé à confirmer ce départ', 403);
        }

        // Vérifier le statut de la réservation
        if ($booking->status !== Booking::STATUS_CONFIRMED) {
            return $this->error('La réservation doit être confirmée pour pouvoir signaler le départ', 400);
        }

        // Vérifier que le paiement est effectué
        if (!$booking->isPaid()) {
            return $this->error('Vous devez d\'abord effectuer le paiement', 400);
        }

        // Vérifier si déjà confirmé
        if ($booking->passenger_confirmed_departure) {
            return $this->error('Vous avez déjà confirmé le départ', 400);
        }

        $booking->passengerConfirmsDeparture();

        $message = $booking->trip_started 
            ? 'Départ confirmé ! Bon voyage !'
            : 'Départ confirmé ! En attente de la confirmation du conducteur.';

        return $this->success($booking->fresh(['trip.driver', 'passenger', 'payment']), $message);
    }

    /**
     * Conducteur signale qu'un passager est absent (no-show)
     */
    public function markNoShow(Request $request, Booking $booking)
    {
        $user = $request->user();

        // Vérifier que l'utilisateur est le conducteur
        if ($booking->trip->driver_id !== $user->id) {
            return $this->error('Vous n\'êtes pas autorisé à signaler une absence', 403);
        }

        // Vérifier que la réservation est confirmée et payée
        if ($booking->status !== Booking::STATUS_CONFIRMED) {
            return $this->error('La réservation doit être confirmée', 400);
        }

        // Vérifier que le passager n'a pas déjà confirmé
        if ($booking->passenger_confirmed_departure) {
            return $this->error('Le passager a déjà confirmé sa présence', 400);
        }

        // Vérifier que c'est le jour du voyage ou après
        $departureDate = $booking->trip->departure_date;
        if (now()->format('Y-m-d') < $departureDate) {
            return $this->error('Vous ne pouvez signaler une absence qu\'à partir du jour du voyage', 400);
        }

        $booking->markAsNoShow();

        return $this->success(
            $booking->fresh(['trip', 'passenger', 'payment']), 
            'Absence signalée. Le passager a été remboursé avec une pénalité.'
        );
    }

    /**
     * Passager signale que le chauffeur est absent (driver no-show)
     */
    public function markDriverNoShow(Request $request, Booking $booking)
    {
        $user = $request->user();

        // Vérifier que l'utilisateur est le passager
        if ($booking->passenger_id !== $user->id) {
            return $this->error('Vous n\'êtes pas autorisé à signaler une absence du chauffeur', 403);
        }

        // La réservation doit être confirmée et payée
        if ($booking->status !== Booking::STATUS_CONFIRMED) {
            return $this->error('La réservation doit être confirmée', 400);
        }

        if (!$booking->isPaid()) {
            return $this->error('Le paiement doit être effectué avant de signaler une absence', 400);
        }

        // Si le chauffeur a déjà confirmé le départ, il n'est pas absent
        if ($booking->driver_confirmed_departure) {
            return $this->error('Le conducteur a déjà confirmé le départ', 400);
        }

        // Vérifier que c'est le jour du voyage ou après
        $departureDate = $booking->trip->departure_date;
        if (now()->format('Y-m-d') < $departureDate) {
            return $this->error('Vous ne pouvez signaler une absence qu\'à partir du jour du voyage', 400);
        }

        if ($booking->driver_no_show) {
            return $this->error('Le chauffeur a déjà été signalé absent', 400);
        }

        $booking->markDriverAsNoShow();

        return $this->success(
            $booking->fresh(['trip.driver', 'passenger', 'payment']),
            'Absence du chauffeur signalée. Un remboursement complet a été effectué.'
        );
    }

    public function departureStatus(Request $request, Booking $booking)
    {
        $user = $request->user();

        // Vérifier les autorisations
        if ($booking->passenger_id !== $user->id && $booking->trip->driver_id !== $user->id) {
            return $this->error('Accès non autorisé', 403);
        }

        return $this->success([
            'booking_id' => $booking->id,
            'status' => $booking->status,
            'driver_confirmed' => $booking->driver_confirmed_departure,
            'driver_confirmed_at' => $booking->driver_departure_confirmed_at,
            'passenger_confirmed' => $booking->passenger_confirmed_departure,
            'passenger_confirmed_at' => $booking->passenger_departure_confirmed_at,
            'trip_started' => $booking->trip_started,
            'trip_started_at' => $booking->trip_started_at,
            'payment_status' => $booking->payment?->status,
            'escrow_status' => $booking->payment?->escrow_status,
        ]);
    }
}
