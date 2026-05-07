<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Controllers\ApiResponse;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\Registered;

class AuthController extends Controller
{
    use ApiResponse;

    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $user->assignRole('client');
        
        event(new Registered($user));

        return $this->success('Registration successful. Please check your email to verify your account.', new UserResource($user), 201);
    }

    public function login(LoginRequest $request)
    {
        $loginType = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        if (!Auth::attempt([$loginType => $request->login, 'password' => $request->password])) {
            return $this->error('Kredensial yang Anda masukkan salah.', 401);
        }

        $user = Auth::user();

        if (!$user->hasVerifiedEmail()) {
            return $this->error('Silakan verifikasi email Anda terlebih dahulu.', 403);
        }

        // Check if account is deactivated
        if (isset($user->status) && $user->status === 'inactive') {
            return $this->error('Akun Anda telah dinonaktifkan. Hubungi admin untuk informasi lebih lanjut.', 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success('Login berhasil', [
            'user' => new UserResource($user),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();
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
