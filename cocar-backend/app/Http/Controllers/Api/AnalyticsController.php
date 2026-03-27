<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Date;
class AnalyticsController extends Controller
{
    /**
     * Statistiques financières du conducteur connecté.
     *
     * Query params:
     * - from (Y-m-d) optionnel
     * - to (Y-m-d) optionnel
     * - group (day|week|month) optionnel (défaut: day)
     */
    public function driverFinancial(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d'],
            'group' => ['nullable', 'in:day,week,month'],
        ]);

        $from = $validated['from'] ?? now()->subDays(30)->format('Y-m-d');
        $to = $validated['to'] ?? now()->format('Y-m-d');
        $group = $validated['group'] ?? 'day';

        [$selectDate, $groupBy] = $this->dateGrouping($group);

        $base = Payment::query()
            ->whereHas('booking.trip', fn($q) => $q->where('driver_id', $user->id))
            ->whereBetween(DB::raw('DATE(payments.created_at)'), [$from, $to]);

        $series = (clone $base)
            ->selectRaw("{$selectDate} as d")
            ->selectRaw("SUM(CASE WHEN escrow_status = ? THEN COALESCE(driver_amount,0) ELSE 0 END) as earned", [Payment::ESCROW_RELEASED])
            ->selectRaw("SUM(CASE WHEN escrow_status = ? THEN COALESCE(amount,0) ELSE 0 END) as pending", [Payment::ESCROW_HELD])
            ->groupByRaw($groupBy)
            ->orderBy('d')
            ->get()
            ->map(fn($r) => [
                'date' => $r->d,
                'earned' => (int) $r->earned,
                'pending' => (int) $r->pending,
            ])
            ->values();

        $totals = [
            'earned' => (int) (clone $base)->where('escrow_status', Payment::ESCROW_RELEASED)->sum('driver_amount'),
            'pending' => (int) (clone $base)->where('escrow_status', Payment::ESCROW_HELD)->sum('amount'),
        ];

        return $this->success([
            'from' => $from,
            'to' => $to,
            'group' => $group,
            'totals' => $totals,
            'series' => $series,
        ]);
    }

    /**
     * Statistiques financières globales entreprise (admin).
     *
     * Query params:
     * - from (Y-m-d) optionnel
     * - to (Y-m-d) optionnel
     * - group (day|week|month) optionnel
     */
    public function companyFinancial(Request $request)
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d'],
            'group' => ['nullable', 'in:day,week,month'],
            'payment_method' => ['nullable', 'in:cash,mobile_money,card,orange_money,mtn_money'],
            'status' => ['nullable', 'in:pending,processing,completed,failed,refunded'],
            'escrow_status' => ['nullable', 'in:none,held,released,refunded,partial_refund'],
        ]);

        $from = $validated['from'] ?? now()->subDays(30)->format('Y-m-d');
        $to = $validated['to'] ?? now()->format('Y-m-d');
        $group = $validated['group'] ?? 'day';

        [$selectDate, $groupBy] = $this->dateGrouping($group);

        $paymentMethod = $validated['payment_method'] ?? null;
        $status        = $validated['status'] ?? null;
        $escrowStatus  = $validated['escrow_status'] ?? null;

        $base = Payment::query()
            ->whereBetween(DB::raw('DATE(payments.created_at)'), [$from, $to]);

        if ($paymentMethod) {
            $base->where('payment_method', $paymentMethod);
        }
        if ($status) {
            $base->where('status', $status);
        }
        if ($escrowStatus) {
            $base->where('escrow_status', $escrowStatus);
        }

        $series = (clone $base)
            ->selectRaw("{$selectDate} as d")
            ->selectRaw("SUM(amount) as gross_revenue")
            ->selectRaw("SUM(COALESCE(commission_amount, 0)) as commission_revenue")
            ->selectRaw("SUM(COALESCE(driver_amount, 0)) as driver_payouts")
            ->selectRaw("SUM(COALESCE(refund_amount, 0)) as refunds")
            ->groupByRaw($groupBy)
            ->orderBy('d')
            ->get()
            ->map(fn($r) => [
                'date' => $r->d,
                'gross_revenue' => (int) $r->gross_revenue,
                'commission_revenue' => (int) $r->commission_revenue,
                'driver_payouts' => (int) $r->driver_payouts,
                'refunds' => (int) $r->refunds,
            ])
            ->values();

        $totals = [
            'gross_revenue' => (int) (clone $base)->sum('amount'),
            'commission_revenue' => (int) (clone $base)->sum('commission_amount'),
            'driver_payouts' => (int) (clone $base)->sum('driver_amount'),
            'refunds' => (int) (clone $base)->sum('refund_amount'),
            'penalties' => (int) (clone $base)->sum('penalty_amount'),
            'bookings' => (int) (clone $base)->distinct('booking_id')->count('booking_id'),
            'payments' => (int) (clone $base)->count(),
        ];

        $escrowBreakdown = [
            Payment::ESCROW_HELD => [
                'count' => (int) (clone $base)->where('escrow_status', Payment::ESCROW_HELD)->count(),
                'amount' => (int) (clone $base)->where('escrow_status', Payment::ESCROW_HELD)->sum('amount'),
            ],
            Payment::ESCROW_RELEASED => [
                'count' => (int) (clone $base)->where('escrow_status', Payment::ESCROW_RELEASED)->count(),
                'amount' => (int) (clone $base)->where('escrow_status', Payment::ESCROW_RELEASED)->sum('amount'),
            ],
            Payment::ESCROW_REFUNDED => [
                'count' => (int) (clone $base)->where('escrow_status', Payment::ESCROW_REFUNDED)->count(),
                'amount' => (int) (clone $base)->where('escrow_status', Payment::ESCROW_REFUNDED)->sum('refund_amount'),
            ],
            Payment::ESCROW_PARTIAL_REFUND => [
                'count' => (int) (clone $base)->where('escrow_status', Payment::ESCROW_PARTIAL_REFUND)->count(),
                'amount' => (int) (clone $base)->where('escrow_status', Payment::ESCROW_PARTIAL_REFUND)->sum('refund_amount'),
            ],
            Payment::ESCROW_NONE => [
                'count' => (int) (clone $base)->where('escrow_status', Payment::ESCROW_NONE)->count(),
                'amount' => (int) (clone $base)->where('escrow_status', Payment::ESCROW_NONE)->sum('amount'),
            ],
        ];

        $paymentStatusBreakdown = [
            Payment::STATUS_PENDING => (int) (clone $base)->where('status', Payment::STATUS_PENDING)->count(),
            Payment::STATUS_PROCESSING => (int) (clone $base)->where('status', Payment::STATUS_PROCESSING)->count(),
            Payment::STATUS_COMPLETED => (int) (clone $base)->where('status', Payment::STATUS_COMPLETED)->count(),
            Payment::STATUS_FAILED => (int) (clone $base)->where('status', Payment::STATUS_FAILED)->count(),
            Payment::STATUS_REFUNDED => (int) (clone $base)->where('status', Payment::STATUS_REFUNDED)->count(),
        ];

        // Top chauffeurs (par montant net versé)
        $topDrivers = (clone $base)
            ->join('bookings', 'bookings.id', '=', 'payments.booking_id')
            ->join('trips', 'trips.id', '=', 'bookings.trip_id')
            ->join('users', 'users.id', '=', 'trips.driver_id')
            ->selectRaw('users.id as driver_id, users.name as driver_name')
            ->selectRaw('SUM(COALESCE(payments.driver_amount,0)) as driver_payouts')
            ->selectRaw('SUM(COALESCE(payments.commission_amount,0)) as commission')
            ->selectRaw('COUNT(DISTINCT trips.id) as trips_count')
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('driver_payouts')
            ->limit(10)
            ->get()
            ->map(fn($r) => [
                'driver_id' => (int) $r->driver_id,
                'driver_name' => $r->driver_name,
                'driver_payouts' => (int) $r->driver_payouts,
                'commission' => (int) $r->commission,
                'trips_count' => (int) $r->trips_count,
            ])
            ->values();

        // Top villes (départs / arrivées)
        $topDepartureCities = (clone $base)
            ->join('bookings', 'bookings.id', '=', 'payments.booking_id')
            ->join('trips', 'trips.id', '=', 'bookings.trip_id')
            ->selectRaw('trips.departure_city as city')
            ->selectRaw('COUNT(*) as bookings')
            ->groupBy('trips.departure_city')
            ->orderByDesc('bookings')
            ->limit(10)
            ->get()
            ->map(fn($r) => ['city' => $r->city, 'bookings' => (int) $r->bookings])
            ->values();

        $topArrivalCities = (clone $base)
            ->join('bookings', 'bookings.id', '=', 'payments.booking_id')
            ->join('trips', 'trips.id', '=', 'bookings.trip_id')
            ->selectRaw('trips.arrival_city as city')
            ->selectRaw('COUNT(*) as bookings')
            ->groupBy('trips.arrival_city')
            ->orderByDesc('bookings')
            ->limit(10)
            ->get()
            ->map(fn($r) => ['city' => $r->city, 'bookings' => (int) $r->bookings])
            ->values();

        // Top trajets (couple départ->arrivée)
        $topRoutes = (clone $base)
            ->join('bookings', 'bookings.id', '=', 'payments.booking_id')
            ->join('trips', 'trips.id', '=', 'bookings.trip_id')
            ->selectRaw('trips.departure_city as departure_city, trips.arrival_city as arrival_city')
            ->selectRaw('COUNT(*) as bookings')
            ->groupBy('trips.departure_city', 'trips.arrival_city')
            ->orderByDesc('bookings')
            ->limit(10)
            ->get()
            ->map(fn($r) => [
                'departure_city' => $r->departure_city,
                'arrival_city' => $r->arrival_city,
                'bookings' => (int) $r->bookings,
            ])
            ->values();

        return $this->success([
            'from' => $from,
            'to' => $to,
            'group' => $group,
            'filters' => [
                'payment_method' => $paymentMethod,
                'status' => $status,
                'escrow_status' => $escrowStatus,
            ],
            'totals' => $totals,
            'series' => $series,
            'breakdowns' => [
                'escrow' => $escrowBreakdown,
                'payment_status' => $paymentStatusBreakdown,
            ],
            'top' => [
                'drivers' => $topDrivers,
                'departure_cities' => $topDepartureCities,
                'arrival_cities' => $topArrivalCities,
                'routes' => $topRoutes,
            ],
        ]);
    }

    /**
     * Télécharger un rapport PDF (admin).
     */
    public function companyFinancialPdf(Request $request)
    {
        $data = $this->companyFinancial($request)->getData(true);
        $payload = $data['data'] ?? [];

        // Export HTML imprimable (l'admin peut utiliser "Imprimer" -> "Enregistrer en PDF").
        // Nous évitons une dépendance PDF (dompdf) car l'installation peut être indisponible selon l'environnement.
        $html = view('reports.financial', [
            'from' => $payload['from'] ?? null,
            'to' => $payload['to'] ?? null,
            'group' => $payload['group'] ?? 'day',
            'totals' => $payload['totals'] ?? [],
            'series' => $payload['series'] ?? [],
            'breakdowns' => $payload['breakdowns'] ?? [],
            'filters' => $payload['filters'] ?? [],
            'top' => $payload['top'] ?? [],
            'generated_at' => now()->format('d/m/Y H:i'),
        ])->render();

        $filename = 'rapport-financier-' . ($payload['from'] ?? 'from') . '-' . ($payload['to'] ?? 'to') . '.html';

        return response($html, 200)
            ->header('Content-Type', 'text/html; charset=UTF-8')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    private function dateGrouping(string $group): array
    {
        // Compatible MySQL (DATE_FORMAT).
        return match ($group) {
            'month' => ["DATE_FORMAT(payments.created_at, '%Y-%m')", "DATE_FORMAT(payments.created_at, '%Y-%m')"],
            'week' => ["DATE_FORMAT(payments.created_at, '%x-W%v')", "DATE_FORMAT(payments.created_at, '%x-W%v')"],
            default => ["DATE_FORMAT(payments.created_at, '%Y-%m-%d')", "DATE_FORMAT(payments.created_at, '%Y-%m-%d')"],
        };
    }
}
