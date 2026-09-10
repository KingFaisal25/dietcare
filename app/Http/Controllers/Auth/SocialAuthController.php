<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Domain\Enums\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to Google's OAuth consent screen.
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle the callback from Google after user consent.
     *
     * Flow:
     * 1. google_id match   → login existing user
     * 2. email match       → link google_id, login
     * 3. new user          → create with role patient, login
     *
     * After login, redirect to frontend dashboard based on role.
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            Log::error('Google OAuth callback failed', [
                'error' => $e->getMessage(),
            ]);

            return redirect($this->frontendUrl('/login?error=google_auth_failed'));
        }

        // 1. Find by google_id
        $user = User::where('google_id', $googleUser->getId())->first();

        if (!$user) {
            // 2. Find by email → link google_id
            $user = User::where('email', strtolower($googleUser->getEmail()))->first();

            if ($user) {
                $user->update(['google_id' => $googleUser->getId()]);
            } else {
                // 3. Create new user
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => strtolower($googleUser->getEmail()),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'password' => null, // OAuth user — no password
                ]);

                $user->assignRole(UserRole::Patient->value);
            }
        }

        // Check account status
        if (($user->status ?? 'active') !== 'active') {
            return redirect($this->frontendUrl('/login?error=account_deactivated'));
        }

        // Login and regenerate session (Sanctum SPA flow)
        Auth::login($user, true);
        $request->session()->regenerate();

        // Determine role-based redirect
        $role = UserRole::tryFrom($user->getRoleNames()->first() ?? 'patient')
            ?? UserRole::Patient;

        return redirect($this->frontendUrl($role->dashboardPath()));
    }

    /**
     * Build a full frontend URL.
     */
    private function frontendUrl(string $path): string
    {
        $frontendUrl = config('app.frontend_url')
            ?: (explode(',', env('FRONTEND_URL', 'http://localhost:3000'))[0]);

        return rtrim($frontendUrl, '/') . '/' . ltrim($path, '/');
    }
}
