<?php

namespace App\Infrastructure\Repositories;

use App\Contracts\Repositories\MealPlanRepositoryInterface;
use App\Domain\Entities\MealPlan;
use App\Domain\Enums\MealType;
use App\Models\MealPlan as MealPlanModel;
use Illuminate\Support\Collection;

class EloquentMealPlanRepository implements MealPlanRepositoryInterface
{
    public function findById(int $id): ?MealPlan
    {
        $model = MealPlanModel::find($id);

        return $model ? $this->toEntity($model) : null;
    }

    public function getByProgramId(int $nutritionistProgramId): Collection
    {
        return MealPlanModel::where('nutritionist_program_id', $nutritionistProgramId)
            ->orderBy('day_number')
            ->orderByRaw($this->mealOrderCase('meal_type'))
            ->get()
            ->map(fn (MealPlanModel $model) => $this->toEntity($model));
    }

    public function getByProgramAndDay(int $nutritionistProgramId, int $dayNumber): Collection
    {
        return MealPlanModel::where('nutritionist_program_id', $nutritionistProgramId)
            ->where('day_number', $dayNumber)
            ->orderByRaw($this->mealOrderCase('meal_type'))
            ->get()
            ->map(fn (MealPlanModel $model) => $this->toEntity($model));
    }

    public function create(array $attributes): MealPlan
    {
        $model = MealPlanModel::create($attributes);

        return $this->toEntity($model);
    }

    public function update(int $id, array $attributes): ?MealPlan
    {
        $model = MealPlanModel::find($id);

        if (!$model) {
            return null;
        }

        $model->update($attributes);

        return $this->toEntity($model->fresh());
    }

    public function delete(int $id): bool
    {
        $model = MealPlanModel::find($id);

        return $model ? (bool) $model->delete() : false;
    }

    public function deleteByProgramAndDay(int $nutritionistProgramId, int $dayNumber): int
    {
        return MealPlanModel::where('nutritionist_program_id', $nutritionistProgramId)
            ->where('day_number', $dayNumber)
            ->delete();
    }

    private function toEntity(MealPlanModel $model): MealPlan
    {
        return new MealPlan(
            id: $model->id,
            nutritionistProgramId: $model->nutritionist_program_id,
            dayNumber: $model->day_number,
            mealType: MealType::from($model->meal_type),
            menuName: $model->menu_name,
            ingredients: $model->ingredients ?? [],
            calories: (float) ($model->calories ?? 0),
            proteinG: (float) ($model->protein_g ?? 0),
            carbG: (float) ($model->carb_g ?? 0),
            fatG: (float) ($model->fat_g ?? 0),
            notes: $model->notes,
        );
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
}
