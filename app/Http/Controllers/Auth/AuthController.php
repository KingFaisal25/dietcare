<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Controllers\ApiResponse;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Contracts\Services\AuthServiceInterface;
use App\Domain\Enums\UserRole;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(
        private AuthServiceInterface $authService,
    ) {}

    public function register(RegisterRequest $request)
    {
        $user = $this->authService->register($request->validated());

        $eloquentUser = \App\Models\User::find($user->id);
        if ($eloquentUser) {
            event(new Registered($eloquentUser));
        }

        return $this->success('Registration successful. Please check your email to verify your account.', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
            ],
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $loginField = filter_var($request->input('login'), FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
        $loginValue = $loginField === 'email'
            ? strtolower($request->input('login'))
            : $request->input('login');

        if (!Auth::attempt([
            $loginField => $loginValue,
            'password' => $request->input('password'),
        ], $request->boolean('remember'))) {
            return $this->error('Email atau password salah.', 401);
        }

        $user = Auth::user();

        if (($user->status ?? 'active') !== 'active') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return $this->error('Akun Anda telah dinonaktifkan.', 401);
        }

        $request->session()->regenerate();

        $role = UserRole::tryFrom($user->getRoleNames()->first() ?? 'patient')
            ?? UserRole::Patient;

        // Get user with nutritionist profile if applicable
        $userWithRelations = $user;
        $avatar = $user->avatar_url;
        $nutritionistProfile = null;
        
        if ($role === UserRole::Nutritionist) {
            $userWithRelations->load('nutritionistProfile');
            if ($userWithRelations->nutritionistProfile && $userWithRelations->nutritionistProfile->photo) {
                $avatar = $userWithRelations->nutritionistProfile->photo;
                $nutritionistProfile = $userWithRelations->nutritionistProfile;
            }
        }

        return $this->success('Login berhasil', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role->value,
                'username' => $user->username,
                'phone' => $user->phone,
                'avatar' => $avatar,
                'nutritionist_profile' => $nutritionistProfile,
            ],
            'redirect' => $role->dashboardPath(),
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return $this->success('Successfully logged out', null);
    }

    public function me(Request $request)
    {
        return $this->success('User data retrieved successfully', new UserResource($request->user()));
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return $this->success($status, null);
        }

        return $this->error($status, 422);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email|exists:users,email',
            'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::defaults()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return $this->success($status, null);
        }

        return $this->error($status, 422);
    }
}
