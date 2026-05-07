<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\NutritionistProfile;
use App\Models\NutritionistSchedule;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PublicNutritionistController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $specialization = $request->string('specialization')->trim()->value();
        $availableOnly = $request->boolean('available');

        $query = User::role('nutritionist')
            ->with([
                'nutritionistProfile',
                'nutritionistSchedules' => fn ($query) => $query->where('is_active', true),
            ])
            ->withCount('nutritionistPrograms')
            ->whereHas('nutritionistProfile');

        if ($specialization) {
            $query->whereHas('nutritionistProfile', function ($profileQuery) use ($specialization) {
                $profileQuery->whereJsonContains('specializations', $specialization);
            });
        }

        if ($availableOnly) {
            $query->whereHas('nutritionistSchedules', function ($scheduleQuery) {
                $scheduleQuery->where('is_active', true);
            });
        }

        $nutritionists = $query
            ->get()
            ->map(function ($user) {
                $profile = $user->nutritionistProfile;
                $activeClients = (int) $user->nutritionist_programs_count;
                $isAvailable = $user->nutritionistSchedules->isNotEmpty();

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'slug' => $profile->slug,
                    'title' => $profile->title,
                    'photo' => $profile->photo,
                    'specializations' => $profile->specializations,
                    'years_experience' => $profile->years_experience,
                    'rating' => (float) ($profile->avg_rating ?? 0),
                    'review_count' => (int) ($profile->total_reviews ?? 0),
                    'active_clients' => $activeClients,
                    'is_available' => $isAvailable,
                    'is_online' => $isAvailable,
                ];
            })
            ->values();

        return $this->success('Daftar ahli gizi berhasil diambil.', [
            'items' => $nutritionists,
            'total' => $nutritionists->count(),
            'filters' => [
                'specialization' => $specialization ?: null,
                'available' => $availableOnly,
            ],
        ]);
    }

    public function show($slug)
    {
        $profile = NutritionistProfile::where('slug', $slug)
            ->with('user')
            ->firstOrFail();

        $user = $profile->user;

        // Dummy stats
        $rating = 4.9;
        $reviewCount = rand(50, 200);
        $totalClients = rand(100, 500);
        $successRate = rand(85, 98);
        $activeClients = rand(5, 20);
        $maxClients = 30;

        $reviews = [
            [
                'id' => 1,
                'client_name' => 'A.N',
                'rating' => 5,
                'text' => 'Sangat membantu dan sabar dalam menjelaskan pola makan yang baik.',
                'date' => Carbon::now()->subDays(2)->format('d M Y'),
            ],
            [
                'id' => 2,
                'client_name' => 'B.S',
                'rating' => 5,
                'text' => 'Diet plan-nya mudah diikuti dan tidak menyiksa.',
                'date' => Carbon::now()->subDays(5)->format('d M Y'),
            ],
        ];

        return $this->success('Detail ahli gizi berhasil diambil.', [
            'id' => $user->id,
            'name' => $user->name,
            'title' => $profile->title,
            'photo' => $profile->photo,
            'str_number' => $profile->str_number,
            'bio' => $profile->bio,
            'city' => $profile->city,
            'specializations' => $profile->specializations,
            'education' => $profile->education,
            'certifications' => $profile->certifications,
            'years_experience' => $profile->years_experience,
            'rating' => $rating,
            'review_count' => $reviewCount,
            'total_clients' => $totalClients,
            'success_rate' => $successRate,
            'is_available' => $activeClients < $maxClients,
            'reviews' => $reviews,
        ]);
    }

    public function schedule($id)
    {
        $schedules = NutritionistSchedule::where('user_id', $id)
            ->where('is_active', true)
            ->get();

        return $this->success('Jadwal ahli gizi berhasil diambil.', $schedules);
    }
}
