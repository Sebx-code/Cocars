<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Inscription d'un nouvel utilisateur
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'role' => 'user',
        ]);

        // Générer access token et refresh token
        $accessToken = $user->createToken('auth_token', ['*'], now()->addMinutes(config('sanctum.expiration')))->plainTextToken;
        $refreshToken = Str::random(64);
        
        // Stocker le refresh token
        $user->update([
            'refresh_token' => Hash::make($refreshToken),
            'refresh_token_expires_at' => now()->addMinutes(config('sanctum.refresh_token_expiration')),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Inscription réussie',
            'data' => [
                'user' => $user,
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken,
                'token_type' => 'Bearer',
                'expires_in' => config('sanctum.expiration') * 60, // en secondes
            ],
        ], 201)->cookie('refresh_token', $refreshToken, config('sanctum.refresh_token_expiration'), '/', null, true, true, false, 'strict');
    }

    /**
     * Connexion d'un utilisateur
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($validated)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        $user = User::where('email', $validated['email'])->firstOrFail();
        
        // Ne plus révoquer tous les tokens (permettre multi-devices)
        // $user->tokens()->delete();
        
        // Générer access token et refresh token
        $accessToken = $user->createToken('auth_token', ['*'], now()->addMinutes(config('sanctum.expiration')))->plainTextToken;
        $refreshToken = Str::random(64);
        
        // Stocker le refresh token
        $user->update([
            'refresh_token' => Hash::make($refreshToken),
            'refresh_token_expires_at' => now()->addMinutes(config('sanctum.refresh_token_expiration')),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Connexion réussie',
            'data' => [
                'user' => $user,
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken,
                'token_type' => 'Bearer',
                'expires_in' => config('sanctum.expiration') * 60, // en secondes
            ],
        ])->cookie('refresh_token', $refreshToken, config('sanctum.refresh_token_expiration'), '/', null, true, true, false, 'strict');
    }

    /**
     * Déconnexion de l'utilisateur
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        
        // Supprimer le token actuel
        $user->currentAccessToken()->delete();
        
        // Invalider le refresh token
        $user->update([
            'refresh_token' => null,
            'refresh_token_expires_at' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Déconnexion réussie',
            'data' => null,
        ])->cookie('refresh_token', '', -1); // Supprimer le cookie
    }
    
    /**
     * Rafraîchir le token d'accès avec un refresh token
     */
    public function refresh(Request $request)
    {
        $refreshToken = $request->input('refresh_token') ?? $request->cookie('refresh_token');
        
        if (!$refreshToken) {
            return response()->json([
                'success' => false,
                'message' => 'Refresh token manquant',
            ], 401);
        }
        
        // Trouver l'utilisateur avec un refresh token valide
        $user = User::whereNotNull('refresh_token')
            ->where('refresh_token_expires_at', '>', now())
            ->get()
            ->first(function ($user) use ($refreshToken) {
                return Hash::check($refreshToken, $user->refresh_token);
            });
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Refresh token invalide ou expiré',
            ], 401);
        }
        
        // Générer un nouveau access token
        $newAccessToken = $user->createToken('auth_token', ['*'], now()->addMinutes(config('sanctum.expiration')))->plainTextToken;
        
        // Optionnel : Générer un nouveau refresh token (rotation)
        $newRefreshToken = Str::random(64);
        $user->update([
            'refresh_token' => Hash::make($newRefreshToken),
            'refresh_token_expires_at' => now()->addMinutes(config('sanctum.refresh_token_expiration')),
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Token rafraîchi',
            'data' => [
                'access_token' => $newAccessToken,
                'refresh_token' => $newRefreshToken,
                'token_type' => 'Bearer',
                'expires_in' => config('sanctum.expiration') * 60,
            ],
        ])->cookie('refresh_token', $newRefreshToken, config('sanctum.refresh_token_expiration'), '/', null, true, true, false, 'strict');
    }

    /**
     * Obtenir l'utilisateur connecté
     */
    public function user(Request $request)
    {
        $user = $request->user()->load(['userVehicles', 'vehicles']);
        
        return $this->success($user);
    }

    /**
     * Mettre à jour le profil
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string|max:500',
            'avatar' => 'nullable|string',
        ]);

        $user->update($validated);

        return $this->success($user, 'Profil mis à jour');
    }

    /**
     * Changer le mot de passe
     */
    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return $this->success(null, 'Mot de passe modifié avec succès');
    }
}
