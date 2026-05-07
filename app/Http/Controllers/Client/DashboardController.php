<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\NutritionistProgram;
use App\Models\FoodDiaryEntry;
use App\Models\WeightLog;
use App\Models\Consultation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $user = Auth::user();
        $profile = $user->clientProfile;

        // Get active program
        $activeProgram = NutritionistProgram::with('program', 'nutritionist')
            ->where('client_id', $user->id)
            ->where('status', 'active')
            ->latest()
            ->first();

        $programName = $activeProgram ? $activeProgram->program->name : 'No Active Program';
        $startDate = $activeProgram ? $activeProgram->start_date : null;
        $totalDays = $activeProgram ? $activeProgram->program->duration_days : 30;
        $currentDay = $startDate ? (int) $startDate->diffInDays(now()) + 1 : 1;
        $remainingDays = $totalDays - $currentDay;

        // Weight stats
        $currentWeight = $profile->weight_kg ?? 0;
        $initialWeight = WeightLog::where('client_id', $user->id)
            ->orderBy('date', 'asc')
            ->value('weight_kg') ?? $currentWeight;
        $weightChange = $currentWeight - $initialWeight;

        // Calories & Macros
        $todayDiary = FoodDiaryEntry::where('user_id', $user->id)
            ->whereDate('eaten_at', Carbon::today())
            ->get();
        
        $caloriesConsumed = $todayDiary->sum('calories');
        $caloriesTarget = $profile->calorie_target ?? 2000;

        $macros = [
            'carbs' => [
                'consumed' => (float) $todayDiary->sum('carbs'),
                'target' => $caloriesTarget * 0.5 / 4, // 50% carbs approx
            ],
            'protein' => [
                'consumed' => (float) $todayDiary->sum('protein'),
                'target' => $caloriesTarget * 0.2 / 4, // 20% protein approx
            ],
            'fat' => [
                'consumed' => (float) $todayDiary->sum('fat'),
                'target' => $caloriesTarget * 0.3 / 9, // 30% fat approx
            ],
        ];

        // Next Consultation
        $nextConsultation = Consultation::with('nutritionist')
            ->where('client_id', $user->id)
            ->where('scheduled_at', '>', now())
            ->orderBy('scheduled_at', 'asc')
            ->first();

        $consultationData = null;
        if ($nextConsultation) {
            $isSoon = $nextConsultation->scheduled_at->diffInMinutes(now()) < 30;
            $consultationData = [
                'nutritionistName' => $nextConsultation->nutritionist->name,
                'nutritionistPhoto' => $nextConsultation->nutritionist->avatar_url,
                'date' => $nextConsultation->scheduled_at->toDateString(),
                'time' => $nextConsultation->scheduled_at->format('H:i'),
                'isSoon' => $isSoon,
            ];
        }

        // Streak
        $streakDays = $this->calculateStreak($user->id);

        return $this->success('Dashboard data retrieved successfully.', [
            'user' => [
                'name' => $user->name,
                'programName' => $programName,
                'currentDay' => min($currentDay, $totalDays),
                'totalDays' => $totalDays,
            ],
            'stats' => [
                'currentWeight' => (float) $currentWeight,
                'weightChange' => round((float) $weightChange, 1),
                'caloriesConsumed' => (int) $caloriesConsumed,
                'caloriesTarget' => (int) $caloriesTarget,
                'remainingDays' => max(0, $remainingDays),
                'streakDays' => $streakDays,
            ],
            'macros' => [
                'carbs' => [
                    'consumed' => round($macros['carbs']['consumed'], 1),
                    'target' => round($macros['carbs']['target'], 1),
                ],
                'protein' => [
                    'consumed' => round($macros['protein']['consumed'], 1),
                    'target' => round($macros['protein']['target'], 1),
                ],
                'fat' => [
                    'consumed' => round($macros['fat']['consumed'], 1),
                    'target' => round($macros['fat']['target'], 1),
                ],
            ],
            'nextConsultation' => $consultationData,
            'weeklyTarget' => [
                'targetWeightLoss' => 0.5, // Default
                'currentWeightLoss' => 0.2, // Placeholder
            ],
        ]);
    }

    private function calculateStreak($userId)
    {
        $dates = FoodDiaryEntry::where('user_id', $userId)
            ->where('eaten_at', '<=', Carbon::today())
            ->orderBy('eaten_at', 'desc')
            ->pluck('eaten_at')
            ->unique()
            ->values();

        if ($dates->isEmpty()) return 0;

        $streak = 0;
        $currentDate = Carbon::today();

        // If no entry today, check yesterday
        if (!$dates->contains($currentDate->toDateString())) {
            $currentDate->subDay();
        }

        foreach ($dates as $date) {
            $logDate = Carbon::parse($date);
            if ($logDate->isSameDay($currentDate)) {
                $streak++;
                $currentDate->subDay();
            } else {
                break;
            }
        }

        return $streak;
    }
}
