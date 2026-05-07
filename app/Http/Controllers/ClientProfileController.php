<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use App\Models\ClientProfile;
use App\Models\NutritionistProgram;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class ClientProfileController extends Controller
{
    /**
     * Get all client profile data.
     */
    public function show(Request $request)
    {
        $user = $request->user()->load(['clientProfile', 'nutritionistPrograms.program', 'nutritionistPrograms.nutritionist']);
        return response()->json($user);
    }

    /**
     * Update personal data.
     */
    public function update(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'birth_date' => 'nullable|date',
            'city' => 'nullable|string|max:100',
        ]);

        $user->update($request->only(['name', 'phone']));
        
        if ($user->clientProfile) {
            $user->clientProfile->update($request->only(['birth_date', 'city']));
        } else {
            $user->clientProfile()->create($request->only(['birth_date', 'city']));
        }

        return response()->json(['message' => 'Profile updated successfully', 'user' => $user->fresh('clientProfile')]);
    }

    /**
     * Upload profile photo.
     */
    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|max:2048', // 2MB Max
        ]);

        $user = $request->user();

        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            $path = $request->file('photo')->store('avatars', 'public');
            $user->update(['avatar' => $path]);

            return response()->json([
                'message' => 'Photo uploaded successfully',
                'avatar_url' => asset('storage/' . $path)
            ]);
        }

        return response()->json(['message' => 'No photo uploaded'], 400);
    }

    /**
     * Update password.
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|current_password',
            'new_password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $request->user()->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    /**
     * Update notification preferences.
     */
    public function updateNotifications(Request $request)
    {
        $request->validate([
            'notification_settings' => 'required|array',
        ]);

        $request->user()->update([
            'notification_settings' => $request->notification_settings,
        ]);

        return response()->json(['message' => 'Notification preferences updated']);
    }

    /**
     * Update nutrition data (physical data, targets, etc).
     */
    public function updateNutritionData(Request $request, NotificationService $notificationService)
    {
        $user = $request->user();
        $request->validate([
            'height' => 'nullable|numeric',
            'weight' => 'nullable|numeric',
            'medical_conditions' => 'nullable|string',
            'allergies' => 'nullable|string',
            'dietary_restrictions' => 'nullable|string',
            'target_weight' => 'nullable|numeric',
        ]);

        if ($user->clientProfile) {
            $user->clientProfile->update([
                'height_cm' => $request->height,
                'weight_kg' => $request->weight,
                'medical_conditions' => $request->medical_conditions,
                'allergies' => $request->allergies,
                'dietary_restrictions' => $request->dietary_restrictions,
                'target_weight_kg' => $request->target_weight,
            ]);
        }

        // Notify nutritionist if user has an active program
        $activePrograms = NutritionistProgram::where('client_id', $user->id)
            ->where('status', 'active')
            ->get();

        foreach ($activePrograms as $program) {
            $notificationService->send(
                $program->nutritionist_id,
                'nutritionist_message',
                'Update Data Gizi Klien',
                "Klien {$user->name} baru saja memperbarui data gizinya. Silakan periksa profil klien.",
                ['client_id' => $user->id, 'action' => 'view_client']
            );
        }

        return response()->json(['message' => 'Nutrition data updated successfully. Your nutritionist has been notified.']);
    }
}
