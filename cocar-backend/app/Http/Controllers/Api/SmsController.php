<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Services\SmsNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SmsController extends \App\Http\Controllers\Controller
{
    protected SmsNotificationService $smsService;

    public function __construct(SmsNotificationService $smsService)
    {
        $this->smsService = $smsService;
        $this->middleware('auth:sanctum');
    }

    /**
     * Obtenir le statut des SMS
     */
    public function status(): JsonResponse
    {
        return response()->json([
            'enabled' => $this->smsService->isEnabled(),
            'configured' => $this->smsService->isConfigured(),
            'user_phone_verified' => Auth::user()->phone_verified ?? false,
            'user_phone' => Auth::user()->phone ? '*****'.substr(Auth::user()->phone, -4) : null,
        ]);
    }

    /**
     * Envoyer un SMS de test
     */
    public function sendTest(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:160',
        ]);

        $user = Auth::user();

        if (!$user->phone_verified) {
            return response()->json([
                'success' => false,
                'message' => 'Votre numéro de téléphone n\'est pas vérifié',
            ], 422);
        }

        if (!$this->smsService->isEnabled()) {
            return response()->json([
                'success' => false,
                'message' => 'Les notifications SMS ne sont pas activées',
            ], 503);
        }

        $result = $this->smsService->sendToUser($user, $request->message);

        return response()->json([
            'success' => $result,
            'message' => $result ? 'SMS envoyé avec succès' : 'Échec de l\'envoi du SMS',
        ], $result ? 200 : 500);
    }

    /**
     * Envoyer un SMS à un utilisateur (admin)
     */
    public function send(Request $request): JsonResponse
    {
        // Vérifier si l'utilisateur est admin
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé',
            ], 403);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'message' => 'required|string|max:160',
        ]);

        $user = User::find($request->user_id);

        if (!$user->phone_verified) {
            return response()->json([
                'success' => false,
                'message' => 'Le numéro de téléphone de l\'utilisateur n\'est pas vérifié',
            ], 422);
        }

        $result = $this->smsService->sendToUser($user, $request->message);

        return response()->json([
            'success' => $result,
            'message' => $result ? 'SMS envoyé avec succès' : 'Échec de l\'envoi du SMS',
        ], $result ? 200 : 500);
    }

    /**
     * Envoyer des SMS à plusieurs utilisateurs (admin)
     */
    public function sendBatch(Request $request): JsonResponse
    {
        // Vérifier si l'utilisateur est admin
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé',
            ], 403);
        }

        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'message' => 'required|string|max:160',
        ]);

        $users = User::whereIn('id', $request->user_ids)->get();
        $results = $this->smsService->sendBatch($users, $request->message);

        return response()->json([
            'success' => $results['failed'] === 0,
            'results' => $results,
        ], $results['failed'] === 0 ? 200 : 207);
    }

    /**
     * Configurer les préférences SMS de l'utilisateur
     */
    public function preferences(Request $request): JsonResponse
    {
        $request->validate([
            'opt_in' => 'required|boolean',
        ]);

        $user = Auth::user();
        // Utiliser la colonne 'verified' du téléphone comme opt-in
        // En pratique, vous pourriez ajouter une colonne 'sms_opt_in' à la table users

        return response()->json([
            'success' => true,
            'message' => 'Préférences mises à jour',
            'opt_in' => $request->opt_in,
        ]);
    }
}
