<?php

namespace App\Http\Controllers;

use App\Models\Food;
use App\Models\FoodDiaryEntry;
use App\Models\MealPlan;
use App\Models\NutritionistProgram;
use App\Services\NutritionCalculator;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ClientNutritionController extends Controller
{
    use ApiResponse;

    public function __construct(private NutritionCalculator $calculator)
    {
    }

    public function mealPlan(Request $request)
    {
        $validated = $request->validate([
            'day' => 'nullable|integer|min:1|max:10',
        ]);

        $user = $request->user();
        $day = $validated['day'] ?? 1;
        $nutritionistProgram = $this->getActiveProgram($user->id);

        if (!$nutritionistProgram) {
            return $this->success('Meal plan berhasil diambil.', [
                'day' => $day,
                'has_meal_plan' => false,
                'plan_date' => null,
                'meals' => [],
                'totals' => $this->emptyTotals(),
                'nutritionist_note' => null,
            ]);
        }

        $planDate = $nutritionistProgram->start_date->copy()->addDays($day - 1);

        $meals = MealPlan::query()
            ->where('nutritionist_program_id', $nutritionistProgram->id)
            ->where('day_number', $day)
            ->orderByRaw($this->mealOrderCase('meal_type'))
            ->get();

        if ($meals->isEmpty()) {
            return $this->success('Meal plan berhasil diambil.', [
                'day' => $day,
                'has_meal_plan' => false,
                'plan_date' => $planDate->toISOString(),
                'meals' => [],
                'totals' => $this->emptyTotals(),
                'nutritionist_note' => null,
            ]);
        }

        $diaryMealTypes = FoodDiaryEntry::query()
            ->where('user_id', $user->id)
            ->whereDate('eaten_at', $planDate->toDateTimeString())
            ->pluck('meal_type')
            ->all();

        $today = Carbon::today();

        $mappedMeals = $meals->map(function (MealPlan $meal) use ($diaryMealTypes, $planDate, $today) {
            $status = in_array($meal->meal_type, $diaryMealTypes, true)
                ? 'selesai'
                : ($planDate->lt($today) ? 'skip' : 'belum');

            return [
                'id' => $meal->id,
                'meal_type' => $meal->meal_type,
                'meal_type_label' => $this->mealTypeLabel($meal->meal_type),
                'menu_name' => $meal->menu_name,
                'ingredients' => collect($meal->ingredients ?? [])->map(function ($ingredient) {
                    if (is_string($ingredient)) {
                        return [
                            'name' => $ingredient,
                            'quantity_gram' => null,
                        ];
                    }

                    return [
                        'name' => $ingredient['name'] ?? '-',
                        'quantity_gram' => $ingredient['quantity_gram'] ?? null,
                    ];
                })->values(),
                'calories' => (float) ($meal->calories ?? 0),
                'protein' => (float) ($meal->protein_g ?? 0),
                'carbs' => (float) ($meal->carb_g ?? 0),
                'fat' => (float) ($meal->fat_g ?? 0),
                'status' => $status,
            ];
        })->values();

        return $this->success('Meal plan berhasil diambil.', [
            'day' => $day,
            'has_meal_plan' => true,
            'plan_date' => $planDate->toISOString(),
            'meals' => $mappedMeals,
            'totals' => [
                'calories' => round((float) $meals->sum('calories'), 2),
                'protein' => round((float) $meals->sum('protein_g'), 2),
                'carbs' => round((float) $meals->sum('carb_g'), 2),
                'fat' => round((float) $meals->sum('fat_g'), 2),
            ],
            'nutritionist_note' => $meals->pluck('notes')->filter()->implode("\n"),
        ]);
    }

    public function foodDiary(Request $request)
    {
        $validated = $request->validate([
            'eaten_at' => 'nullable|date',
        ]);

        $user = $request->user();
        $dateObj = Carbon::parse($validated['eaten_at'] ?? now());

        $entries = FoodDiaryEntry::query()
            ->where('user_id', $user->id)
            ->whereDate('eaten_at', $dateObj->toDateTimeString())
            ->orderByRaw($this->mealOrderCase('meal_type'))
            ->orderBy('created_at')
            ->get();

        $profile = $user->clientProfile;
        $macroTargets = $profile
            ? $this->calculator->calculateMacros(
                (float) $profile->calorie_target,
                $profile->target_type,
                $profile->medical_conditions ?? []
            )
            : [
                'protein_g' => 0,
                'carb_g' => 0,
                'fat_g' => 0,
            ];

        $groupedEntries = collect($this->mealTypeOptions())
            ->mapWithKeys(function ($label, $mealType) use ($entries) {
                return [
                    $mealType => [
                        'label' => $label,
                        'items' => $entries
                            ->where('meal_type', $mealType)
                            ->values()
                            ->map(fn (FoodDiaryEntry $entry) => [
                                'id' => $entry->id,
                                'food_name_snapshot' => $entry->food_name_snapshot,
                                'quantity_gram' => $entry->quantity_gram,
                                'calories' => (float) ($entry->calories ?? 0),
                                'protein' => (float) ($entry->protein ?? 0),
                                'carbs' => (float) ($entry->carbs ?? 0),
                                'fat' => (float) ($entry->fat ?? 0),
                                'created_at' => $entry->created_at?->toISOString(),
                            ]),
                    ],
                ];
            });

        return $this->success('Food diary berhasil diambil.', [
            'eaten_at' => $dateObj->toISOString(),
            'grouped_entries' => $groupedEntries,
            'totals' => [
                'calories' => round((float) $entries->sum('calories'), 2),
                'protein' => round((float) $entries->sum('protein'), 2),
                'carbs' => round((float) $entries->sum('carbs'), 2),
                'fat' => round((float) $entries->sum('fat'), 2),
            ],
            'targets' => [
                'calories' => (int) ($profile->calorie_target ?? 0),
                'protein' => (int) ($macroTargets['protein_g'] ?? 0),
                'carbs' => (int) ($macroTargets['carb_g'] ?? 0),
                'fat' => (int) ($macroTargets['fat_g'] ?? 0),
            ],
        ]);
    }

    public function storeFoodDiary(Request $request)
    {
        $validated = $request->validate([
            'food_id' => 'required|integer',
            'meal_type' => 'required|in:breakfast,snack_morning,lunch,snack_afternoon,dinner',
            'quantity_gram' => 'required|numeric|min:1',
            'eaten_at' => 'nullable|date',
        ]);

        $food = Food::find($validated['food_id']);
        if (!$food) {
            return $this->error('Data makanan tidak valid atau tidak ditemukan.', 404);
        }
        $multiplier = ((float) $validated['quantity_gram']) / 100;

        $entry = FoodDiaryEntry::create([
            'user_id' => $request->user()->id,
            'food_id' => $food->id,
            'eaten_at' => Carbon::parse($validated['eaten_at'] ?? now())->toDateTimeString(),
            'meal_type' => $validated['meal_type'],
            'food_name_snapshot' => $food->name_id ?? $food->name,
            'quantity_gram' => (int) round((float) $validated['quantity_gram']),
            'calories' => round((float) ($food->calories_per_100g ?? 0) * $multiplier, 2),
            'protein' => round((float) ($food->protein_per_100g ?? 0) * $multiplier, 2),
            'carbs' => round((float) ($food->carbs_per_100g ?? 0) * $multiplier, 2),
            'fat' => round((float) ($food->fat_per_100g ?? 0) * $multiplier, 2),
            'source' => 'manual',
        ]);

        return $this->success('Food diary berhasil ditambahkan.', [
            'entry' => [
                'id' => $entry->id,
                'eaten_at' => Carbon::parse($entry->eaten_at)->toISOString(),
                'meal_type' => $entry->meal_type,
                'meal_type_label' => $this->mealTypeLabel($entry->meal_type),
                'food_name_snapshot' => $entry->food_name_snapshot,
                'quantity_gram' => $entry->quantity_gram,
                'calories' => (float) $entry->calories,
                'protein' => (float) $entry->protein,
                'carbs' => (float) $entry->carbs,
                'fat' => (float) $entry->fat,
            ],
        ], 201);
    }

    public function deleteFoodDiary(Request $request, int $id)
    {
        $entry = FoodDiaryEntry::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        $entry->delete();

        return $this->success('Food diary berhasil dihapus.', [
            'id' => $id,
        ]);
    }

    public function diarySummary(Request $request)
    {
        $validated = $request->validate([
            'days' => 'nullable|integer|min:1|max:30',
        ]);

        $user = $request->user();
        $days = $validated['days'] ?? 7;
        $startDate = Carbon::today()->subDays($days - 1);
        $profile = $user->clientProfile;

        $entries = FoodDiaryEntry::query()
            ->where('user_id', $user->id)
            ->whereDate('eaten_at', '>=', $startDate->toDateTimeString())
            ->get()
            ->groupBy(fn (FoodDiaryEntry $entry) => Carbon::parse($entry->eaten_at)->startOfDay()->toISOString());

        $labels = [];
        $calories = [];
        $targets = [];

        for ($offset = 0; $offset < $days; $offset++) {
            $date = $startDate->copy()->addDays($offset)->startOfDay()->toISOString();
            $labels[] = Carbon::parse($date)->translatedFormat('d M');
            $calories[] = round((float) ($entries->get($date)?->sum('calories') ?? 0), 2);
            $targets[] = (int) ($profile->calorie_target ?? 0);
        }

        return $this->success('Ringkasan food diary berhasil diambil.', [
            'days' => $days,
            'labels' => $labels,
            'calories' => $calories,
            'targets' => $targets,
        ]);
    }

    private function getActiveProgram(int $clientId): ?NutritionistProgram
    {
        return NutritionistProgram::query()
            ->where('client_id', $clientId)
            ->whereIn('status', ['active', 'pending'])
            ->orderByDesc('start_date')
            ->first();
    }

    private function mealTypeOptions(): array
    {
        return [
            'breakfast' => 'Sarapan',
            'snack_morning' => 'Snack Pagi',
            'lunch' => 'Makan Siang',
            'snack_afternoon' => 'Snack Sore',
            'dinner' => 'Makan Malam',
        ];
    }

    private function mealTypeLabel(string $mealType): string
    {
        return $this->mealTypeOptions()[$mealType] ?? $mealType;
    }

    private function mealOrderCase(string $column): string
    {
        return "CASE {$column}
            WHEN 'breakfast' THEN 1
            WHEN 'snack_morning' THEN 2
            WHEN 'lunch' THEN 3
            WHEN 'snack_afternoon' THEN 4
            WHEN 'dinner' THEN 5
            ELSE 6 END";
    }

    private function emptyTotals(): array
    {
        return [
            'calories' => 0,
            'protein' => 0,
            'carbs' => 0,
            'fat' => 0,
        ];
    }
}
