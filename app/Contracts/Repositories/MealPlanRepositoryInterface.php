<?php

namespace App\Contracts\Repositories;

use App\Domain\Entities\MealPlan;
use Illuminate\Support\Collection;

interface MealPlanRepositoryInterface
{
    /**
     * Find a meal plan item by ID.
     */
    public function findById(int $id): ?MealPlan;

    /**
     * Get all meal plans for a nutritionist program.
     */
    public function getByProgramId(int $nutritionistProgramId): Collection;

    /**
     * Get meal plans for a specific day within a program.
     */
    public function getByProgramAndDay(int $nutritionistProgramId, int $dayNumber): Collection;

    /**
     * Create a new meal plan item.
     */
    public function create(array $attributes): MealPlan;

    /**
     * Update an existing meal plan item.
     */
    public function update(int $id, array $attributes): ?MealPlan;

    /**
     * Delete a meal plan item.
     */
    public function delete(int $id): bool;

    /**
     * Delete all meal plans for a specific day in a program.
     */
    public function deleteByProgramAndDay(int $nutritionistProgramId, int $dayNumber): int;
}
