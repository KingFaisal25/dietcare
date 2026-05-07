<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MealPlanGeneration;
use App\Jobs\GenerateMealPlanJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Auth;

class MealPlanController extends Controller
{
    public function generate(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'calorie_target' => 'required|integer',
            'diet_type' => 'required|string',
            'allergies' => 'array',
            'food_preferences' => 'array',
            'duration_days' => 'required|in:7,14,30',
            'budget' => 'required|in:ekonomi,menengah,premium',
        ]);

        // Rate limiting logic
        $key = 'meal-plan-generation:' . $user->id;
        $maxAttempts = $user->is_paid ? 5 : 1; // Assuming is_paid attribute or similar
        $decaySeconds = 7 * 24 * 60 * 60; // 1 week

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            return response()->json([
                'message' => 'Anda telah mencapai batas pembuatan meal plan minggu ini.',
                'retry_after' => RateLimiter::availableIn($key),
            ], 429);
        }

        RateLimiter::hit($key, $decaySeconds);

        $generation = MealPlanGeneration::create([
            'user_id' => $user->id,
            'params' => $request->all(),
            'status' => 'pending',
        ]);

        GenerateMealPlanJob::dispatch($generation);

        return response()->json([
            'message' => 'Meal plan sedang diproses.',
            'generation_id' => $generation->id,
        ]);
    }

    public function status($id)
    {
        $generation = MealPlanGeneration::where('user_id', Auth::id())->findOrFail($id);

        return response()->json([
            'status' => $generation->status,
            'error_message' => $generation->error_message,
        ]);
    }

    public function show($id)
    {
        $generation = MealPlanGeneration::where('user_id', Auth::id())->findOrFail($id);

        if ($generation->status !== 'done') {
            return response()->json(['message' => 'Meal plan belum selesai.'], 400);
        }

        return response()->json($generation->result);
    }

    public function history()
    {
        $history = MealPlanGeneration::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($history);
    }
}
