<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FoodDiaryEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DiaryController extends Controller
{
    /**
     * Get diary entries for a specific date.
     */
    public function index(Request $request)
    {
        $date = $request->get('date', Carbon::today()->toDateString());
        $user = Auth::user();

        $entries = FoodDiaryEntry::where('user_id', $user->id)
            ->whereDate('eaten_at', $date)
            ->get();

        // Summary calculations
        $summary = [
            'calories' => $entries->sum('calories'),
            'protein' => $entries->sum('protein'),
            'carbs' => $entries->sum('carbs'),
            'fat' => $entries->sum('fat'),
            'fiber' => $entries->sum('fiber'),
        ];

        // Get targets from user profile
        $profile = $user->clientProfile;
        $targets = [
            'calories' => (int) ($profile->calorie_target ?? 1800),
            'protein' => 90,
            'carbs' => 225,
            'fat' => 50,
        ];

        $remaining = [
            'calories' => max(0, $targets['calories'] - $summary['calories']),
            'protein' => max(0, $targets['protein'] - $summary['protein']),
            'carbs' => max(0, $targets['carbs'] - $summary['carbs']),
            'fat' => max(0, $targets['fat'] - $summary['fat']),
        ];

        $completion_pct = ($targets['calories'] > 0) ? min(100, ($summary['calories'] / $targets['calories']) * 100) : 0;

        $groupedEntries = [
            'breakfast' => $entries->where('meal_type', 'breakfast')->values(),
            'morning_snack' => $entries->where('meal_type', 'morning_snack')->values(),
            'lunch' => $entries->where('meal_type', 'lunch')->values(),
            'afternoon_snack' => $entries->where('meal_type', 'afternoon_snack')->values(),
            'dinner' => $entries->where('meal_type', 'dinner')->values(),
            'other' => $entries->where('meal_type', 'other')->values(),
        ];

        return response()->json([
            'date' => $date,
            'target' => $targets,
            'consumed' => $summary,
            'remaining' => $remaining,
            'completion_pct' => round($completion_pct, 1),
            'entries' => $groupedEntries,
        ]);
    }

    /**
     * Store a new diary entry.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'food_id' => 'nullable|exists:foods,id',
            'food_name_snapshot' => 'required|string',
            'meal_type' => 'required|in:breakfast,morning_snack,lunch,afternoon_snack,dinner,other',
            'quantity_gram' => 'required|numeric',
            'calories' => 'required|numeric',
            'protein' => 'required|numeric',
            'carbs' => 'required|numeric',
            'fat' => 'required|numeric',
            'fiber' => 'nullable|numeric',
            'eaten_at' => 'required|date',
            'source' => 'required|in:manual,barcode,ai_photo,meal_plan',
            'note' => 'nullable|string',
        ]);

        $entry = FoodDiaryEntry::create(array_merge($validated, [
            'user_id' => Auth::id(),
        ]));

        return response()->json(['message' => 'Entry added', 'entry' => $entry], 201);
    }

    /**
     * Update a diary entry.
     */
    public function update(Request $request, $id)
    {
        $entry = FoodDiaryEntry::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'quantity_gram' => 'numeric',
            'calories' => 'numeric',
            'protein' => 'numeric',
            'carbs' => 'numeric',
            'fat' => 'numeric',
            'meal_type' => 'in:breakfast,morning_snack,lunch,afternoon_snack,dinner,other',
            'note' => 'nullable|string',
        ]);

        $entry->update($validated);

        return response()->json(['message' => 'Entry updated', 'entry' => $entry]);
    }

    /**
     * Delete a diary entry.
     */
    public function destroy($id)
    {
        $entry = FoodDiaryEntry::where('user_id', Auth::id())->findOrFail($id);
        $entry->delete();

        return response()->json(['message' => 'Entry deleted']);
    }

    /**
     * Get weekly summary for charts.
     */
    public function weeklySummary(Request $request)
    {
        $weekStart = $request->get('week_start', Carbon::now()->startOfWeek()->toDateString());
        $weekEnd = Carbon::parse($weekStart)->addDays(6)->toDateString();
        $user = Auth::user();

        $entries = FoodDiaryEntry::where('user_id', $user->id)
            ->whereBetween('eaten_at', [$weekStart, $weekEnd])
            ->get();

        $days = [];
        for ($i = 0; $i < 7; $i++) {
            $date = Carbon::parse($weekStart)->addDays($i)->toDateString();
            $dayEntries = $entries->where('eaten_at', $date);
            
            $days[] = [
                'date' => $date,
                'day_name' => Carbon::parse($date)->format('D'),
                'calories' => $dayEntries->sum('calories'),
                'target_calories' => (int) ($user->clientProfile->calorie_target ?? 1800),
                'is_completed' => $dayEntries->sum('calories') >= ($user->clientProfile->calorie_target ?? 1800),
            ];
        }

        return response()->json([
            'week_range' => "{$weekStart} - {$weekEnd}",
            'data' => $days,
            'best_day' => collect($days)->sortByDesc('calories')->first()['day_name'] ?? '-',
        ]);
    }

    /**
     * Calculate current streak.
     */
    public function streak()
    {
        $user = Auth::user();
        $streak = 0;
        $date = Carbon::today();

        $maxDays = 365;
        while ($streak < $maxDays) {
            $exists = FoodDiaryEntry::where('user_id', $user->id)
                ->whereDate('eaten_at', $date->toDateString())
                ->exists();

            if (!$exists && $date->isToday()) {
                // Check yesterday if no entry today yet
                $date->subDay();
                continue;
            }

            if ($exists) {
                $streak++;
                $date->subDay();
            } else {
                break;
            }
        }

        return response()->json(['streak' => $streak]);
    }
}
