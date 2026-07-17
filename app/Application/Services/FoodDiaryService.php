<?php

namespace App\Application\Services;

use App\Contracts\Repositories\FoodDiaryRepositoryInterface;
use App\Contracts\Repositories\FoodRepositoryInterface;
use App\Contracts\Repositories\ProgramRepositoryInterface;
use App\Services\NutritionCalculator;
use Carbon\Carbon;

class FoodDiaryService
{
    public function __construct(
        private FoodDiaryRepositoryInterface $diaryRepo,
        private FoodRepositoryInterface $foodRepo,
        private ProgramRepositoryInterface $programRepo,
        private NutritionCalculator $calculator
    ) {}

    /**
     * Get the meal plan for a specific day within the client's active program.
     */
    public function getMealPlan(int $userId, int $day = 1): array
    {
        $program = $this->programRepo->getActiveClientProgram($userId);

        if (!$program) {
            return [
                'day' => $day,
                'has_meal_plan' => false,
                'plan_date' => null,
                'meals' => [],
                'totals' => $this->emptyTotals(),
                'nutritionist_note' => null,
            ];
        }

        $planDate = $program->start_date->copy()->addDays($day - 1);

        $meals = \App\Models\MealPlan::query()
            ->where('nutritionist_program_id', $program->id)
            ->where('day_number', $day)
            ->orderByRaw($this->mealOrderCase('meal_type'))
            ->get();

        if ($meals->isEmpty()) {
            return [
                'day' => $day,
                'has_meal_plan' => false,
                'plan_date' => $planDate->toISOString(),
                'meals' => [],
                'totals' => $this->emptyTotals(),
                'nutritionist_note' => null,
            ];
        }

        $diaryMealTypes = $this->diaryRepo->getMealTypesForDate(
            $userId,
            $planDate->toDateTimeString()
        );

        $today = Carbon::today();

        $mappedMeals = $meals->map(function (\App\Models\MealPlan $meal) use ($diaryMealTypes, $planDate, $today) {
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
                        return ['name' => $ingredient, 'quantity_gram' => null];
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

        return [
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
        ];
    }

    /**
     * Get food diary grouped by meal type for a given date.
     */
    public function getFoodDiary(int $userId, ?string $eatenAt = null, $clientProfile = null): array
    {
        $dateObj = Carbon::parse($eatenAt ?? now());
        $entries = $this->diaryRepo->getByUserAndDate($userId, $dateObj->toDateTimeString());

        $macroTargets = $clientProfile
            ? $this->calculator->calculateMacros(
                (float) $clientProfile->calorie_target,
                $clientProfile->target_type,
                $clientProfile->medical_conditions ?? []
            )
            : ['protein_g' => 0, 'carb_g' => 0, 'fat_g' => 0];

        $groupedEntries = collect($this->mealTypeOptions())
            ->mapWithKeys(function ($label, $mealType) use ($entries) {
                return [
                    $mealType => [
                        'label' => $label,
                        'items' => $entries
                            ->where('meal_type', $mealType)
                            ->values()
                            ->map(fn ($entry) => [
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

        return [
            'eaten_at' => $dateObj->toISOString(),
            'grouped_entries' => $groupedEntries,
            'totals' => [
                'calories' => round((float) $entries->sum('calories'), 2),
                'protein' => round((float) $entries->sum('protein'), 2),
                'carbs' => round((float) $entries->sum('carbs'), 2),
                'fat' => round((float) $entries->sum('fat'), 2),
            ],
            'targets' => [
                'calories' => (int) ($clientProfile->calorie_target ?? 0),
                'protein' => (int) ($macroTargets['protein_g'] ?? 0),
                'carbs' => (int) ($macroTargets['carb_g'] ?? 0),
                'fat' => (int) ($macroTargets['fat_g'] ?? 0),
            ],
        ];
    }

    /**
     * Store a new food diary entry with nutrient calculations.
     */
    public function storeFoodDiary(int $userId, array $validated): array
    {
        $food = $this->foodRepo->findById($validated['food_id']);
        if (!$food) {
            return ['success' => false, 'message' => 'Data makanan tidak valid atau tidak ditemukan.'];
        }

        $multiplier = ((float) $validated['quantity_gram']) / 100;

        $entry = $this->diaryRepo->create([
            'user_id' => $userId,
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

        return [
            'success' => true,
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
        ];
    }

    /**
     * Delete a food diary entry.
     */
    public function deleteFoodDiary(int $userId, int $entryId): bool
    {
        return $this->diaryRepo->delete($entryId, $userId);
    }

    /**
     * Get diary summary chart data for N days.
     */
    public function getDiarySummary(int $userId, int $days = 7, $clientProfile = null): array
    {
        $startDate = Carbon::today()->subDays($days - 1);
        $endDate = Carbon::today();

        $entries = $this->diaryRepo->getByUserAndDateRange(
            $userId,
            $startDate->toDateTimeString(),
            $endDate->toDateTimeString()
        );

        $groupedByDate = $entries->groupBy(
            fn ($entry) => Carbon::parse($entry->eaten_at)->startOfDay()->toISOString()
        );

        $labels = [];
        $calories = [];
        $targets = [];

        for ($offset = 0; $offset < $days; $offset++) {
            $date = $startDate->copy()->addDays($offset)->startOfDay()->toISOString();
            $labels[] = Carbon::parse($date)->translatedFormat('d M');
            $calories[] = round((float) ($groupedByDate->get($date)?->sum('calories') ?? 0), 2);
            $targets[] = (int) ($clientProfile->calorie_target ?? 0);
        }

        return [
            'days' => $days,
            'labels' => $labels,
            'calories' => $calories,
            'targets' => $targets,
        ];
    }

    // ─── Private Helpers ─────────────────────────────────────────────

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
        return ['calories' => 0, 'protein' => 0, 'carbs' => 0, 'fat' => 0];
    }
}
