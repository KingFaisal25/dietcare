<?php

namespace App\Application\Services;

use App\Application\DTOs\CreateMealPlanDTO;
use App\Contracts\Repositories\MealPlanRepositoryInterface;
use App\Domain\Entities\MealPlan;
use Illuminate\Support\Collection;

class MealPlanService
{
    public function __construct(
        private MealPlanRepositoryInterface $mealPlanRepo,
    ) {}

    /**
     * Get all meal plans for a nutritionist program.
     */
    public function getByProgram(int $nutritionistProgramId): Collection
    {
        return $this->mealPlanRepo->getByProgramId($nutritionistProgramId);
    }

    /**
     * Get meal plans for a specific day within a program.
     */
    public function getByProgramAndDay(int $nutritionistProgramId, int $dayNumber): Collection
    {
        return $this->mealPlanRepo->getByProgramAndDay($nutritionistProgramId, $dayNumber);
    }

    /**
     * Create a new meal plan entry from a DTO.
     */
    public function create(CreateMealPlanDTO $dto): MealPlan
    {
        return $this->mealPlanRepo->create($dto->toArray());
    }

    /**
     * Bulk create meal plans for a day.
     *
     * @param  array<CreateMealPlanDTO>  $dtos
     * @return Collection<MealPlan>
     */
    public function bulkCreateForDay(array $dtos): Collection
    {
        $created = collect();

        foreach ($dtos as $dto) {
            $created->push($this->mealPlanRepo->create($dto->toArray()));
        }

        return $created;
    }

    /**
     * Replace all meal plans for a specific day (delete + recreate).
     *
     * @param  int                       $nutritionistProgramId
     * @param  int                       $dayNumber
     * @param  array<CreateMealPlanDTO>  $dtos
     * @return Collection<MealPlan>
     */
    public function replaceForDay(int $nutritionistProgramId, int $dayNumber, array $dtos): Collection
    {
        $this->mealPlanRepo->deleteByProgramAndDay($nutritionistProgramId, $dayNumber);

        return $this->bulkCreateForDay($dtos);
    }

    /**
     * Update an existing meal plan entry.
     */
    public function update(int $id, array $attributes): ?MealPlan
    {
        return $this->mealPlanRepo->update($id, $attributes);
    }

    /**
     * Delete a meal plan entry.
     */
    public function delete(int $id): bool
    {
        return $this->mealPlanRepo->delete($id);
    }

    /**
     * Store and update a meal plan for a client.
     */
    public function storeMealPlanForClient(int $nutritionistId, array $validated): array
    {
        $program = \App\Models\NutritionistProgram::query()
            ->where('nutritionist_id', $nutritionistId)
            ->where('client_id', $validated['client_id'])
            ->where('status', 'active')
            ->latest('start_date')
            ->first();

        if (! $program) {
            throw new \DomainException('Program aktif untuk klien tidak ditemukan.', 404);
        }

        $preparedMeals = $this->prepareMeals($validated['meals']);

        \Illuminate\Support\Facades\DB::transaction(function () use ($program, $validated, $preparedMeals) {
            \App\Models\MealPlan::query()
                ->where('nutritionist_program_id', $program->id)
                ->where('day_number', $validated['day_number'])
                ->delete();

            foreach ($preparedMeals as $index => $meal) {
                $noteSegments = [];

                if ($index === 0 && ! empty($validated['special_note'])) {
                    $noteSegments[] = $validated['special_note'];
                }

                if (! empty($meal['notes'])) {
                    $noteSegments[] = $meal['notes'];
                }

                \App\Models\MealPlan::create([
                    'nutritionist_program_id' => $program->id,
                    'day_number' => $validated['day_number'],
                    'meal_type' => $meal['meal_type'],
                    'menu_name' => $meal['menu_name'],
                    'ingredients' => $meal['ingredients'],
                    'calories' => $meal['calories'],
                    'protein_g' => $meal['protein'],
                    'carb_g' => $meal['carbs'],
                    'fat_g' => $meal['fat'],
                    'notes' => empty($noteSegments) ? null : implode("\n\n", $noteSegments),
                ]);
            }

            \App\Models\ClientMessage::create([
                'nutritionist_program_id' => $program->id,
                'sender_role' => 'nutritionist',
                'message' => 'Meal plan hari ' . $validated['day_number'] . ' telah diperbarui dan siap ditinjau klien.',
                'read_at' => null,
            ]);
        });

        return [
            'client_id' => (int) $validated['client_id'],
            'day_number' => (int) $validated['day_number'],
            'totals' => $this->sumPreparedMeals($preparedMeals),
            'notification_sent' => true,
        ];
    }

    /**
     * Get templates for a nutritionist.
     */
    public function getTemplates(int $nutritionistId): Collection
    {
        return \App\Models\MealPlanTemplate::query()
            ->where('nutritionist_id', $nutritionistId)
            ->latest()
            ->get();
    }

    /**
     * Store a new meal plan template.
     */
    public function storeTemplate(int $nutritionistId, array $validated): \App\Models\MealPlanTemplate
    {
        $preparedMeals = $this->prepareMeals($validated['meals']);

        return \App\Models\MealPlanTemplate::create([
            'nutritionist_id' => $nutritionistId,
            'name' => $validated['name'],
            'day_number' => $validated['day_number'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'meals' => $preparedMeals,
            'totals' => $this->sumPreparedMeals($preparedMeals),
        ]);
    }

    // ─── Private Helpers ─────────────────────────────────────────────

    private function prepareMeals(array $meals): array
    {
        $foodIds = collect($meals)
            ->flatMap(fn (array $meal) => collect($meal['items'] ?? [])->pluck('food_id'))
            ->unique()
            ->values();

        $foods = \App\Models\FoodDatabase::query()
            ->whereIn('id', $foodIds)
            ->get()
            ->keyBy('id');

        return collect($meals)
            ->map(function (array $meal) use ($foods) {
                $ingredients = collect($meal['items'])->map(function (array $item) use ($foods) {
                    $food = $foods->get($item['food_id']);
                    $quantity = (float) $item['quantity_gram'];
                    $multiplier = $quantity / 100;

                    return [
                        'food_id' => $food->id,
                        'name' => $food->name,
                        'quantity_gram' => round($quantity, 2),
                        'calories' => round((float) $food->calories_per_100g * $multiplier, 2),
                        'protein' => round((float) $food->protein_g * $multiplier, 2),
                        'carbs' => round((float) $food->carb_g * $multiplier, 2),
                        'fat' => round((float) $food->fat_g * $multiplier, 2),
                    ];
                })->values();

                return [
                    'meal_type' => $meal['meal_type'],
                    'menu_name' => $meal['menu_name'] ?: $ingredients->pluck('name')->implode(', '),
                    'ingredients' => $ingredients->all(),
                    'calories' => round((float) $ingredients->sum('calories'), 2),
                    'protein' => round((float) $ingredients->sum('protein'), 2),
                    'carbs' => round((float) $ingredients->sum('carbs'), 2),
                    'fat' => round((float) $ingredients->sum('fat'), 2),
                    'notes' => $meal['notes'] ?? null,
                ];
            })
            ->sortBy(fn (array $meal) => $this->mealOrderNumber($meal['meal_type']))
            ->values()
            ->all();
    }

    private function sumPreparedMeals(array $meals): array
    {
        return [
            'calories' => round((float) collect($meals)->sum('calories'), 2),
            'protein' => round((float) collect($meals)->sum('protein'), 2),
            'carbs' => round((float) collect($meals)->sum('carbs'), 2),
            'fat' => round((float) collect($meals)->sum('fat'), 2),
        ];
    }

    private function mealOrderNumber(string $mealType): int
    {
        return [
            'breakfast' => 1,
            'snack_morning' => 2,
            'lunch' => 3,
            'snack_afternoon' => 4,
            'dinner' => 5,
        ][$mealType] ?? 99;
    }
}

