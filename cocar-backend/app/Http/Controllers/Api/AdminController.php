<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Trip;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Statistiques du dashboard admin
     */
    public function stats(Request $request)
    {
        $totalUsers = User::count();
        $totalTrips = Trip::count();
        $totalBookings = Booking::count();
        $totalRevenue = Payment::where('status', 'completed')->sum('amount');
        
        $activeUsers = User::where('created_at', '>=', now()->subDays(30))->count();
        $pendingVerifications = User::where('is_verified', false)->count();
        
        // Statistiques des derniers 30 jours
        $newUsersThisMonth = User::where('created_at', '>=', now()->subDays(30))->count();
        $newTripsThisMonth = Trip::where('created_at', '>=', now()->subDays(30))->count();
        $newBookingsThisMonth = Booking::where('created_at', '>=', now()->subDays(30))->count();
        $revenueThisMonth = Payment::where('status', 'completed')
            ->where('created_at', '>=', now()->subDays(30))
            ->sum('amount');

        return $this->success([
            'total_users' => $totalUsers,
            'total_trips' => $totalTrips,
            'total_bookings' => $totalBookings,
            'total_revenue' => $totalRevenue,
            'active_users' => $activeUsers,
            'pending_verifications' => $pendingVerifications,
            'new_users_this_month' => $newUsersThisMonth,
            'new_trips_this_month' => $newTripsThisMonth,
            'new_bookings_this_month' => $newBookingsThisMonth,
            'revenue_this_month' => $revenueThisMonth,
        ]);
    }

    /**
     * Liste des utilisateurs pour l'admin
     */
    public function users(Request $request)
    {
        $query = User::query();

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filtre par rôle
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Filtre par vérification
        if ($request->filled('is_verified')) {
            $query->where('is_verified', $request->is_verified === 'true');
        }

        $users = $query->withCount(['tripsAsDriver', 'bookings', 'ratingsReceived'])
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * Vérifier un utilisateur
     */
    public function verifyUser(Request $request, User $user)
    {
        $user->update(['is_verified' => true]);

        return $this->success($user, 'Utilisateur vérifié avec succès');
    }

    /**
     * Supprimer un utilisateur
     */
    public function deleteUser(Request $request, User $user)
    {
        // Empêcher la suppression des admins
        if ($user->role === 'admin') {
            return $this->error('Impossible de supprimer un administrateur', 403);
        }

        // Annuler les trajets actifs
        $user->tripsAsDriver()
            ->whereIn('status', ['pending', 'confirmed'])
            ->update(['status' => 'cancelled', 'cancellation_reason' => 'Compte utilisateur supprimé']);

        // Annuler les réservations actives
        $user->bookings()
            ->whereIn('status', ['pending', 'confirmed'])
            ->update(['status' => 'cancelled']);

        $user->delete();

        return $this->success(null, 'Utilisateur supprimé avec succès');
    }

    /**
     * Liste des trajets pour l'admin
     */
    public function trips(Request $request)
    {
        $query = Trip::with(['driver', 'vehicle']);

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('departure_city', 'like', "%{$search}%")
                  ->orWhere('arrival_city', 'like', "%{$search}%");
            });
        }

        // Filtre par statut
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filtre par date
        if ($request->filled('date_from')) {
            $query->where('departure_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->where('departure_date', '<=', $request->date_to);
        }

        $trips = $query->withCount('bookings')
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $trips->items(),
            'meta' => [
                'current_page' => $trips->currentPage(),
                'last_page' => $trips->lastPage(),
                'per_page' => $trips->perPage(),
                'total' => $trips->total(),
            ],
        ]);
    }

    /**
     * Supprimer un trajet
     */
    public function deleteTrip(Request $request, Trip $trip)
    {
        // Annuler les réservations actives
        $trip->bookings()
            ->whereIn('status', ['pending', 'confirmed'])
            ->update(['status' => 'cancelled']);

        $trip->update([
            'status' => 'cancelled',
            'cancellation_reason' => 'Supprimé par l\'administrateur',
        ]);

        $trip->delete();

        return $this->success(null, 'Trajet supprimé avec succès');
    }

    /**
     * Liste des réservations pour l'admin
     */
    public function bookings(Request $request)
    {
        $query = Booking::with(['trip.driver', 'passenger', 'payment']);

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('trip', function ($tq) use ($search) {
                    $tq->where('departure_city', 'like', "%{$search}%")
                       ->orWhere('arrival_city', 'like', "%{$search}%");
                })->orWhereHas('passenger', function ($pq) use ($search) {
                    $pq->where('name', 'like', "%{$search}%");
                });
            });
        }

        // Filtre par statut
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $bookings = $query->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $bookings->items(),
            'meta' => [
                'current_page' => $bookings->currentPage(),
                'last_page' => $bookings->lastPage(),
                'per_page' => $bookings->perPage(),
                'total' => $bookings->total(),
            ],
        ]);
    }

    /**
     * Confirmer une réservation (admin)
     */
    public function confirmBooking(Request $request, Booking $booking)
    {
        if ($booking->status !== 'pending') {
            return $this->error('Cette réservation ne peut pas être confirmée', 400);
        }

        $booking->update([
            'status' => 'confirmed',
            'driver_response' => 'Confirmé par l\'administrateur',
        ]);

        // Mettre à jour les places disponibles
        $booking->trip->updateAvailableSeats();

        return $this->success($booking->fresh(['trip', 'passenger']), 'Réservation confirmée');
    }

    /**
     * Annuler une réservation (admin)
     */
    public function cancelBooking(Request $request, Booking $booking)
    {
        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return $this->error('Cette réservation ne peut pas être annulée', 400);
        }

        $booking->update([
            'status' => 'cancelled',
            'cancellation_reason' => 'Annulé par l\'administrateur',
        ]);

        // Mettre à jour les places disponibles
        $booking->trip->updateAvailableSeats();

        return $this->success($booking->fresh(['trip', 'passenger']), 'Réservation annulée');
    }

    /**
     * Activité récente
     */
    public function recentActivity(Request $request)
    {
        $activities = collect();

        // Derniers utilisateurs
        $recentUsers = User::latest()->take(5)->get()->map(function ($user) {
            return [
                'type' => 'user',
                'text' => "Nouvel utilisateur: {$user->name}",
                'time' => $user->created_at->diffForHumans(),
                'created_at' => $user->created_at,
            ];
        });

        // Derniers trajets
        $recentTrips = Trip::with('driver')->latest()->take(5)->get()->map(function ($trip) {
            return [
                'type' => 'trip',
                'text' => "Nouveau trajet: {$trip->departure_city} → {$trip->arrival_city}",
                'time' => $trip->created_at->diffForHumans(),
                'created_at' => $trip->created_at,
            ];
        });

        // Dernières réservations
        $recentBookings = Booking::with('passenger')->latest()->take(5)->get()->map(function ($booking) {
            return [
                'type' => 'booking',
                'text' => "Réservation #{$booking->id} par {$booking->passenger->name}",
                'time' => $booking->created_at->diffForHumans(),
                'created_at' => $booking->created_at,
            ];
        });

        $activities = $activities
            ->merge($recentUsers)
            ->merge($recentTrips)
            ->merge($recentBookings)
            ->sortByDesc('created_at')
            ->take(10)
            ->values();

        return $this->success($activities);
    }

    /**
     * Statistiques de crédibilité
     */
    public function credibilityStats(Request $request)
    {
        // Total des utilisateurs avec crédibilité
        $totalUsers = User::whereNotNull('credibility_points')->count();
        
        // Points moyens
        $averagePoints = (int) User::whereNotNull('credibility_points')
            ->avg('credibility_points');

        // Distribution par niveau d'étoiles
        $distribution = [
            'stars_5' => User::where('credibility_points', '>=', User::CREDIBILITY_LEVELS[5])->count(),
            'stars_4' => User::whereBetween('credibility_points', [User::CREDIBILITY_LEVELS[4], User::CREDIBILITY_LEVELS[5] - 1])->count(),
            'stars_3' => User::whereBetween('credibility_points', [User::CREDIBILITY_LEVELS[3], User::CREDIBILITY_LEVELS[4] - 1])->count(),
            'stars_2' => User::whereBetween('credibility_points', [User::CREDIBILITY_LEVELS[2], User::CREDIBILITY_LEVELS[3] - 1])->count(),
            'stars_1' => User::where('credibility_points', '<', User::CREDIBILITY_LEVELS[2])->count(),
        ];

        // Top 10 des utilisateurs les plus crédibles
        $topUsers = User::whereNotNull('credibility_points')
            ->orderBy('credibility_points', 'desc')
            ->take(10)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'avatar' => $user->avatar,
                    'credibility_points' => $user->credibility_points,
                    'credibility_stars' => $user->getCredibilityStars(),
                    'total_trips_as_driver' => $user->total_trips_as_driver,
                    'total_positive_points' => $user->total_positive_points,
                    'total_negative_points' => $user->total_negative_points,
                ];
            });

        // Statistiques supplémentaires
        $stats = [
            'total_users' => $totalUsers,
            'average_points' => $averagePoints,
            'distribution' => $distribution,
            'top_users' => $topUsers,
            // Statistiques avancées
            'total_positive_points' => User::sum('total_positive_points'),
            'total_negative_points' => User::sum('total_negative_points'),
            'elite_percentage' => $totalUsers > 0 ? round(($distribution['stars_5'] / $totalUsers) * 100, 1) : 0,
        ];

        return $this->success($stats);
    }

    /**
     * Générer un rapport financier en PDF
     */
    public function generateFinancialReport(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'format' => 'nullable|in:json,html,pdf',
        ]);

        $startDate = $validated['start_date'] ?? now()->subMonth()->startOfMonth();
        $endDate = $validated['end_date'] ?? now()->endOfMonth();
        $format = $validated['format'] ?? 'json';

        // Récupérer les données financières
        $paymentsQuery = Payment::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate]);

        $totalRevenue = $paymentsQuery->sum('amount');
        $companyRevenue = $paymentsQuery->sum('platform_fee'); // 10% de commission
        $driverRevenue = $totalRevenue - $companyRevenue;
        $totalTransactions = $paymentsQuery->count();

        // Statistiques par méthode de paiement
        $paymentsByMethod = Payment::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('payment_method')
            ->get();

        // Revenus par jour
        $dailyRevenue = Payment::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total, SUM(platform_fee) as platform_total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top 10 des chauffeurs par revenu
        $topDrivers = Payment::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->join('bookings', 'payments.booking_id', '=', 'bookings.id')
            ->join('trips', 'bookings.trip_id', '=', 'trips.id')
            ->join('users', 'trips.driver_id', '=', 'users.id')
            ->selectRaw('users.id, users.name, users.email, SUM(payments.amount) as total_revenue, SUM(payments.platform_fee) as platform_fee, COUNT(payments.id) as trip_count')
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderByDesc('total_revenue')
            ->take(10)
            ->get();

        $data = [
            'report_period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
            'summary' => [
                'total_revenue' => $totalRevenue,
                'company_revenue' => $companyRevenue,
                'driver_revenue' => $driverRevenue,
                'total_transactions' => $totalTransactions,
                'average_transaction' => $totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0,
            ],
            'by_payment_method' => $paymentsByMethod,
            'daily_revenue' => $dailyRevenue,
            'top_drivers' => $topDrivers,
            'generated_at' => now(),
            'company_name' => config('app.name'),
        ];

        // Retourner selon le format demandé
        if ($format === 'html') {
            return view('reports.financial', $data);
        } elseif ($format === 'pdf') {
            // Si DomPDF est installé, générer le PDF
            if (class_exists('\Barryvdh\DomPDF\Facade\Pdf')) {
                $pdf = \PDF::loadView('reports.financial', $data);
                $pdf->setPaper('a4', 'portrait');
                $filename = 'rapport_financier_' . now()->format('Y-m-d_His') . '.pdf';
                return $pdf->download($filename);
            } else {
                // Sinon, retourner une erreur avec instructions
                return $this->error('PDF generation requires barryvdh/laravel-dompdf package. Run: composer require barryvdh/laravel-dompdf', 501);
            }
        }

        // Par défaut, retourner JSON
        return $this->success($data, 'Rapport financier généré');
    }
}
