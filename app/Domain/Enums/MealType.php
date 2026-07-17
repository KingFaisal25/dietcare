<?php

namespace App\Domain\Enums;

/**
 * Enum representing meal types for food diary entries and meal plans.
 */
enum MealType: string
{
    case Breakfast = 'breakfast';
    case Lunch = 'lunch';
    case Dinner = 'dinner';
    case Snack = 'snack';

    public function label(): string
    {
        return match ($this) {
            self::Breakfast => 'Sarapan',
            self::Lunch => 'Makan Siang',
            self::Dinner => 'Makan Malam',
            self::Snack => 'Camilan',
        };
    }

    /**
     * Get the recommended calorie percentage for this meal type.
     */
    public function caloriePercentage(): float
    {
        return match ($this) {
            self::Breakfast => 0.25,
            self::Lunch => 0.35,
            self::Dinner => 0.30,
            self::Snack => 0.10,
        };
    }

    /**
     * Get the sort order for display purposes.
     */
    public function sortOrder(): int
    {
        return match ($this) {
            self::Breakfast => 1,
            self::Lunch => 2,
            self::Dinner => 3,
            self::Snack => 4,
        };
    }
}
