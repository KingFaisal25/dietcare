<?php

namespace App\Application\DTOs;

/**
 * Data Transfer Object for creating a meal plan entry.
 */
readonly class CreateMealPlanDTO
{
    public function __construct(
        public int $nutritionistProgramId,
        public int $dayNumber,
        public string $mealType,
        public string $menuName,
        public array $ingredients = [],
        public float $calories = 0,
        public float $proteinG = 0,
        public float $carbG = 0,
        public float $fatG = 0,
        public ?string $notes = null,
    ) {}

    /**
     * Create from validated request data.
     */
    public static function fromArray(array $data): self
    {
        return new self(
            nutritionistProgramId: $data['nutritionist_program_id'],
            dayNumber: $data['day_number'],
            mealType: $data['meal_type'],
            menuName: $data['menu_name'],
            ingredients: $data['ingredients'] ?? [],
            calories: (float) ($data['calories'] ?? 0),
            proteinG: (float) ($data['protein_g'] ?? 0),
            carbG: (float) ($data['carb_g'] ?? 0),
            fatG: (float) ($data['fat_g'] ?? 0),
            notes: $data['notes'] ?? null,
        );
    }

    /**
     * Convert to array for Eloquent mass assignment.
     */
    public function toArray(): array
    {
        return [
            'nutritionist_program_id' => $this->nutritionistProgramId,
            'day_number' => $this->dayNumber,
            'meal_type' => $this->mealType,
            'menu_name' => $this->menuName,
            'ingredients' => $this->ingredients,
            'calories' => $this->calories,
            'protein_g' => $this->proteinG,
            'carb_g' => $this->carbG,
            'fat_g' => $this->fatG,
            'notes' => $this->notes,
        ];
    }
}
