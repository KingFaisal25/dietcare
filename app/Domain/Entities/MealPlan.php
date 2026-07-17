<?php

namespace App\Domain\Entities;

use App\Domain\Enums\MealType;

/**
 * Domain Entity representing a Meal Plan item.
 *
 * Maps to the MealPlan Eloquent model but contains
 * only domain logic without framework dependencies.
 */
class MealPlan
{
    public function __construct(
        public readonly int $id,
        public readonly int $nutritionistProgramId,
        public readonly int $dayNumber,
        public readonly MealType $mealType,
        public readonly string $menuName,
        public readonly array $ingredients = [],
        public readonly float $calories = 0,
        public readonly float $proteinG = 0,
        public readonly float $carbG = 0,
        public readonly float $fatG = 0,
        public readonly ?string $notes = null,
    ) {}

    /**
     * Calculate the total macronutrient grams.
     */
    public function totalMacrosGrams(): float
    {
        return $this->proteinG + $this->carbG + $this->fatG;
    }

    /**
     * Check if the meal has nutritional data filled in.
     */
    public function hasNutritionalData(): bool
    {
        return $this->calories > 0;
    }

    /**
     * Get the meal type label (Indonesian).
     */
    public function mealTypeLabel(): string
    {
        return $this->mealType->label();
    }
}

