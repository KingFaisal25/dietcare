<?php

namespace App\Infrastructure\Repositories;

use App\Contracts\Repositories\FoodDiaryRepositoryInterface;
use App\Models\FoodDiaryEntry;
use Illuminate\Support\Collection;

class EloquentFoodDiaryRepository implements FoodDiaryRepositoryInterface
{
    /**
     * {@inheritDoc}
     */
    public function getByUserAndDate(int $userId, string $date): Collection
    {
        return FoodDiaryEntry::query()
            ->where('user_id', $userId)
            ->whereDate('eaten_at', $date)
            ->orderByRaw($this->mealOrderCase('meal_type'))
            ->orderBy('created_at')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function getByUserAndDateRange(int $userId, string $startDate, string $endDate): Collection
    {
        return FoodDiaryEntry::query()
            ->where('user_id', $userId)
            ->whereDate('eaten_at', '>=', $startDate)
            ->whereDate('eaten_at', '<=', $endDate)
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function getMealTypesForDate(int $userId, string $date): array
    {
        return FoodDiaryEntry::query()
            ->where('user_id', $userId)
            ->whereDate('eaten_at', $date)
            ->pluck('meal_type')
            ->all();
    }

    /**
     * {@inheritDoc}
     */
    public function create(array $attributes)
    {
        return FoodDiaryEntry::create($attributes);
    }

    /**
     * {@inheritDoc}
     */
    public function findByIdForUser(int $id, int $userId)
    {
        return FoodDiaryEntry::query()
            ->where('user_id', $userId)
            ->findOrFail($id);
    }

    /**
     * {@inheritDoc}
     */
    public function delete(int $id, int $userId): bool
    {
        $entry = $this->findByIdForUser($id, $userId);
        return $entry->delete();
    }

    /**
     * SQL CASE expression for ordering meal types chronologically.
     */
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
