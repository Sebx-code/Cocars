<?php

namespace App\Http\Controllers\Api;

use App\Models\SmsLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SmsAdminController extends \App\Http\Controllers\Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(\App\Http\Middleware\AdminMiddleware::class);
    }

    /**
     * Obtenir les logs SMS
     */
    public function logs(Request $request): JsonResponse
    {
        $query = SmsLog::query();

        // Filtres
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('notification_type', $request->type);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Pagination
        $perPage = $request->get('per_page', 50);
        $logs = $query->latest()->paginate($perPage);

        return response()->json($logs);
    }

    /**
     * Résumé des SMS
     */
    public function summary(Request $request): JsonResponse
    {
        $dateFrom = $request->has('date_from') 
            ? $request->date_from 
            : now()->subDays(30)->toDateString();

        $dateTo = $request->has('date_to') 
            ? $request->date_to 
            : now()->toDateString();

        $stats = SmsLog::whereBetween('created_at', [$dateFrom, $dateTo])
            ->selectRaw('
                status,
                COUNT(*) as count,
                COUNT(DISTINCT user_id) as unique_users
            ')
            ->groupBy('status')
            ->get()
            ->keyBy('status')
            ->toArray();

        $total = SmsLog::whereBetween('created_at', [$dateFrom, $dateTo])->count();

        $topTypes = SmsLog::whereBetween('created_at', [$dateFrom, $dateTo])
            ->selectRaw('notification_type, COUNT(*) as count')
            ->whereNotNull('notification_type')
            ->groupBy('notification_type')
            ->orderByRaw('count DESC')
            ->limit(10)
            ->get()
            ->toArray();

        return response()->json([
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'total' => $total,
            'by_status' => $stats,
            'top_types' => $topTypes,
            'success_rate' => $total > 0 
                ? round(($stats['sent']['count'] ?? 0) / $total * 100, 2) . '%'
                : 'N/A',
        ]);
    }

    /**
     * Logs d'un utilisateur
     */
    public function userLogs(Request $request, User $user): JsonResponse
    {
        $perPage = $request->get('per_page', 25);
        $logs = $user->smsLogs()
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'user' => $user->only('id', 'name', 'email', 'phone', 'phone_verified'),
            'logs' => $logs,
        ]);
    }

    /**
     * Détail d'un log
     */
    public function show(SmsLog $smsLog): JsonResponse
    {
        $smsLog->load('user');
        return response()->json($smsLog);
    }

    /**
     * Expiration des logs SMS (cleanup)
     */
    public function cleanup(Request $request): JsonResponse
    {
        $daysOld = $request->get('days', 90);
        $cutoffDate = now()->subDays($daysOld);

        $deletedCount = SmsLog::where('created_at', '<', $cutoffDate)
            ->delete();

        return response()->json([
            'message' => "Nettoyage effectué",
            'deleted_count' => $deletedCount,
            'cutoff_date' => $cutoffDate->toDateTimeString(),
        ]);
    }

    /**
     * Rapporter un problème SMS
     */
    public function reportIssue(Request $request, SmsLog $smsLog): JsonResponse
    {
        $request->validate([
            'issue_type' => 'required|in:wrong_recipient,invalid_message,technical_error,other',
            'description' => 'nullable|string|max:500',
        ]);

        // Implémenter un système d'alertes pour l'équipe de support
        \Illuminate\Support\Facades\Log::warning('SMS issue reported', [
            'sms_log_id' => $smsLog->id,
            'issue_type' => $request->issue_type,
            'description' => $request->description,
            'reported_by' => Auth::id(),
            'reported_at' => now(),
        ]);

        return response()->json([
            'message' => 'Problème signalé. Notre équipe de support en a pris connaissance.',
        ]);
    }
}
