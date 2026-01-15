<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Trip;
use App\Models\Notification;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    /**
     * Liste des réservations (pour un conducteur - ses trajets)
     */
    public function index(Request $request)
    {
        $query = Booking::with(['trip', 'passenger'])
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
            'seats_booked' => 'required|integer|min:1',
            'message' => 'nullable|string|max:500',
            'pickup_point' => 'nullable|string|max:255',
            'dropoff_point' => 'nullable|string|max:255',
        ]);

        $trip = Trip::findOrFail($validated['trip_id']);
        $user = $request->user();

        // Vérifications
        if ($trip->driver_id === $user->id) {
            return $this->error('Vous ne pouvez pas réserver votre propre trajet', 400);
        }

        if (!$trip->canBeBooked($validated['seats_booked'])) {
            return $this->error('Ce trajet n\'est plus disponible ou n\'a pas assez de places', 400);
        }

        // Vérifier si l'utilisateur n'a pas déjà une réservation active
        $existingBooking = Booking::where('trip_id', $trip->id)
            ->where('passenger_id', $user->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->first();

        if ($existingBooking) {
            return $this->error('Vous avez déjà une réservation active pour ce trajet', 400);
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

        // Notifier le conducteur
        Notification::create([
            'user_id' => $trip->driver_id,
            'type' => 'booking_request',
            'title' => 'Nouvelle demande de réservation',
            'message' => "{$user->name} souhaite réserver {$validated['seats_booked']} place(s) pour votre trajet {$trip->departure_city} → {$trip->arrival_city}.",
            'data' => ['booking_id' => $booking->id, 'trip_id' => $trip->id],
        ]);

        $booking->load(['trip.driver', 'passenger']);

        return $this->success($booking, 'Demande de réservation envoyée', 201);
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

        $booking->confirm($validated['driver_response'] ?? null);

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

        $booking->cancel($validated['cancellation_reason'] ?? null);

        return $this->success($booking->fresh(['trip', 'passenger']), 'Réservation annulée');
    }
}
