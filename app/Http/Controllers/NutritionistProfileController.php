<?php

namespace App\Http\Controllers;

use App\Models\NutritionistProfile;
use App\Models\NutritionistSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class NutritionistProfileController extends Controller
{
    public function getProfile()
    {
        $user = Auth::user();
        $profile = NutritionistProfile::firstOrCreate(
            ['user_id' => $user->id],
            ['slug' => Str::slug($user->name)]
        );

        $schedules = NutritionistSchedule::where('user_id', $user->id)->get();

        return response()->json([
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'profile' => $profile,
            'schedules' => $schedules,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string',
            'title' => 'nullable|string',
            'str_number' => 'required|string',
            'bio' => 'nullable|string|max:500',
            'city' => 'nullable|string',
            'years_experience' => 'nullable|integer',
            'specializations' => 'nullable|array',
            'education' => 'nullable|array',
            'certifications' => 'nullable|array',
            'notif_new_message' => 'boolean',
            'notif_new_consultation' => 'boolean',
            'notif_reminder' => 'boolean',
        ]);

        $user->update([
            'name' => $request->name,
            'phone' => $request->phone,
        ]);

        $profile = NutritionistProfile::firstOrCreate(['user_id' => $user->id]);
        
        $profile->update([
            'title' => $request->title,
            'str_number' => $request->str_number,
            'bio' => $request->bio,
            'city' => $request->city,
            'years_experience' => $request->years_experience,
            'specializations' => $request->specializations,
            'education' => $request->education,
            'certifications' => $request->certifications,
            'notif_new_message' => $request->notif_new_message ?? true,
            'notif_new_consultation' => $request->notif_new_consultation ?? true,
            'notif_reminder' => $request->notif_reminder ?? true,
        ]);

        return response()->json(['message' => 'Profil berhasil diperbarui']);
    }

    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|max:2048', // max 2MB
        ]);

        $user = Auth::user();
        $profile = NutritionistProfile::firstOrCreate(['user_id' => $user->id]);

        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($profile->photo) {
                $oldPath = str_replace(url('storage/'), '', $profile->photo);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('photo')->store('nutritionist_photos', 'public');
            $profile->update(['photo' => url('storage/' . $path)]);

            return response()->json([
                'message' => 'Foto berhasil diunggah',
                'photo_url' => $profile->photo
            ]);
        }

        return response()->json(['message' => 'Tidak ada file foto'], 400);
    }

    public function updateSchedule(Request $request)
    {
        $request->validate([
            'schedules' => 'required|array',
            'schedules.*.day_of_week' => 'required|string',
            'schedules.*.is_active' => 'required|boolean',
            'schedules.*.start_time' => 'nullable|date_format:H:i',
            'schedules.*.end_time' => 'nullable|date_format:H:i',
        ]);

        $userId = Auth::id();

        foreach ($request->schedules as $sched) {
            NutritionistSchedule::updateOrCreate(
                ['user_id' => $userId, 'day_of_week' => $sched['day_of_week']],
                [
                    'is_active' => $sched['is_active'],
                    'start_time' => $sched['start_time'] ?? null,
                    'end_time' => $sched['end_time'] ?? null,
                ]
            );
        }

        return response()->json(['message' => 'Jadwal berhasil diperbarui']);
    }
}
