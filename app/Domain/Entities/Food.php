<?php

namespace App\Domain\Entities;

class Food
{
    public int $id;
    public string $nameId;
    public string $category;
    public float $caloriesPer100g;
    public float $proteinPer100g;
    public float $carbsPer100g;
    public float $fatPer100g;
    public float $fiberPer100g;
    public int $servingSize;
    public string $source;

    public function __construct(
        int $id,
        string $nameId,
        string $category,
        float $caloriesPer100g,
        float $proteinPer100g,
        float $carbsPer100g,
        float $fatPer100g,
        float $fiberPer100g = 0,
        int $servingSize = 100,
        string $source = 'manual'
    ) {
        $this->id = $id;
        $this->nameId = $nameId;
        $this->category = $category;
        $this->caloriesPer100g = $caloriesPer100g;
        $this->proteinPer100g = $proteinPer100g;
        $this->carbsPer100g = $carbsPer100g;
        $this->fatPer100g = $fatPer100g;
        $this->fiberPer100g = $fiberPer100g;
        $this->servingSize = $servingSize;
        $this->source = $source;
    }

    /**
     * Calculate nutrient values for a given gram amount.
     */
    public function calculateForGrams(float $grams): array
    {
        $multiplier = $grams / 100;
        return [
            'calories' => round($this->caloriesPer100g * $multiplier, 2),
            'protein'  => round($this->proteinPer100g * $multiplier, 2),
            'carbs'    => round($this->carbsPer100g * $multiplier, 2),
            'fat'      => round($this->fatPer100g * $multiplier, 2),
            'fiber'    => round($this->fiberPer100g * $multiplier, 2),
        ];
    }
}
