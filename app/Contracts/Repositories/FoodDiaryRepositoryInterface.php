<?php

namespace App\Contracts\Repositories;

use Illuminate\Support\Collection;

interface FoodDiaryRepositoryInterface
{
    /**
     * Get diary entries for a user on a specific date.
     */
    public function getByUserAndDate(int $userId, string $date): Collection;

    /**
     * Get diary entries for a user within a date range.
     */
    public function getByUserAndDateRange(int $userId, string $startDate, string $endDate): Collection;

    /**
     * Get distinct meal types logged by a user on a specific date.
     */
    public function getMealTypesForDate(int $userId, string $date): array;

    /**
     * Create a new food diary entry.
     */
    public function create(array $attributes);

    /**
     * Find an entry by ID scoped to a user.
     */
    public function findByIdForUser(int $id, int $userId);

    /**
     * Delete an entry.
     */
    public function delete(int $id, int $userId): bool;
}
