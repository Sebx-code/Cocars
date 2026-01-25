<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class VerificationController extends Controller
{
    /**
     * Upload des documents de vérification
     */
    public function uploadDocuments(Request $request)
    {
        $validated = $request->validate([
            'id_card' => 'required|image|mimes:jpeg,png,jpg|max:5120', // 5MB
            'driver_license' => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
            'selfie' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);
        
        $user = $request->user();
        
        try {
            // Upload carte d'identité
            if ($request->hasFile('id_card')) {
                // Supprimer l'ancienne si existe
                if ($user->id_card_path) {
                    Storage::disk('public')->delete($user->id_card_path);
                }
                
                $idCardPath = $request->file('id_card')->store('verifications/id_cards', 'public');
                $user->id_card_path = $idCardPath;
            }
            
            // Upload permis de conduire (optionnel)
            if ($request->hasFile('driver_license')) {
                if ($user->driver_license_path) {
                    Storage::disk('public')->delete($user->driver_license_path);
                }
                
                $licensePath = $request->file('driver_license')->store('verifications/licenses', 'public');
                $user->driver_license_path = $licensePath;
            }
            
            // Upload selfie
            if ($request->hasFile('selfie')) {
                if ($user->selfie_path) {
                    Storage::disk('public')->delete($user->selfie_path);
                }
                
                $selfiePath = $request->file('selfie')->store('verifications/selfies', 'public');
                $user->selfie_path = $selfiePath;
            }
            
            // Mettre à jour le statut
            $user->verification_status = 'pending';
            $user->save();
            
            return $this->success([
                'user' => $user,
                'message' => 'Documents envoyés. Votre compte sera vérifié sous 24-48h.',
            ], 'Documents uploadés avec succès');
            
        } catch (\Exception $e) {
            return $this->error('Erreur lors de l\'upload des documents: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Envoyer un code de vérification par SMS
     */
    public function sendPhoneVerification(Request $request)
    {
        $user = $request->user();
        
        if (!$user->phone) {
            return $this->error('Aucun numéro de téléphone enregistré', 400);
        }
        
        if ($user->phone_verified) {
            return $this->error('Téléphone déjà vérifié', 400);
        }
        
        // Générer un code à 6 chiffres
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Stocker le code (hashé) et l'expiration (15 minutes)
        $user->update([
            'phone_verification_code' => Hash::make($code),
            'phone_verification_expires_at' => now()->addMinutes(15),
        ]);
        
        // TODO: Intégrer une API SMS (Twilio, Africa's Talking, etc.)
        // Pour le moment, on retourne le code en développement
        $smsMessage = "Votre code de vérification Cocar est: {$code}";
        
        // En production, envoyer vraiment le SMS
        // SmsService::send($user->phone, $smsMessage);
        
        return $this->success([
            'message' => 'Code de vérification envoyé par SMS',
            // Retourner le code seulement en développement
            'code' => config('app.env') === 'local' ? $code : null,
        ]);
    }
    
    /**
     * Vérifier le code SMS
     */
    public function verifyPhone(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|size:6',
        ]);
        
        $user = $request->user();
        
        if ($user->phone_verified) {
            return $this->error('Téléphone déjà vérifié', 400);
        }
        
        if (!$user->phone_verification_code) {
            return $this->error('Aucun code de vérification en attente', 400);
        }
        
        // Vérifier l'expiration
        if ($user->phone_verification_expires_at < now()) {
            return $this->error('Code expiré. Demandez un nouveau code.', 400);
        }
        
        // Vérifier le code
        if (!Hash::check($validated['code'], $user->phone_verification_code)) {
            return $this->error('Code incorrect', 400);
        }
        
        // Marquer comme vérifié
        $user->update([
            'phone_verified' => true,
            'phone_verification_code' => null,
            'phone_verification_expires_at' => null,
        ]);
        
        return $this->success([
            'user' => $user,
            'message' => 'Téléphone vérifié avec succès',
        ]);
    }
    
    /**
     * Obtenir le statut de vérification
     */
    public function status(Request $request)
    {
        $user = $request->user();
        
        return $this->success([
            'verification_status' => $user->verification_status,
            'is_verified' => $user->is_verified,
            'phone_verified' => $user->phone_verified,
            'has_id_card' => !empty($user->id_card_path),
            'has_driver_license' => !empty($user->driver_license_path),
            'has_selfie' => !empty($user->selfie_path),
            'verified_at' => $user->verified_at,
        ]);
    }
    
    /**
     * [ADMIN] Approuver la vérification
     */
    public function approve(Request $request, User $user)
    {
        if (!$request->user()->isAdmin()) {
            return $this->error('Action non autorisée', 403);
        }
        
        $user->update([
            'verification_status' => 'verified',
            'is_verified' => true,
            'verified_at' => now(),
            'verified_by' => $request->user()->id,
        ]);
        
        // TODO: Envoyer une notification à l'utilisateur
        
        return $this->success($user, 'Utilisateur vérifié');
    }
    
    /**
     * [ADMIN] Rejeter la vérification
     */
    public function reject(Request $request, User $user)
    {
        if (!$request->user()->isAdmin()) {
            return $this->error('Action non autorisée', 403);
        }
        
        $validated = $request->validate([
            'notes' => 'required|string|max:500',
        ]);
        
        $user->update([
            'verification_status' => 'rejected',
            'is_verified' => false,
            'verification_notes' => $validated['notes'],
        ]);
        
        // TODO: Envoyer une notification à l'utilisateur
        
        return $this->success($user, 'Vérification rejetée');
    }
}
