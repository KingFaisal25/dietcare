<?php

namespace App\Domain\Entities;

class FoodDiaryEntry
{
    public int $id;
    public int $userId;
    public int $foodId;
    public string $mealType;
    public int $quantityGram;
    public string $foodNameSnapshot;
    public float $calories;
    public float $protein;
    public float $carbs;
    public float $fat;
    public string $eatenAt; // ISO8601 string
    public string $source;
    public \DateTime $createdAt;

    public function __construct(
        int $id,
        int $userId,
        int $foodId,
        string $mealType,
        int $quantityGram,
        string $foodNameSnapshot,
        float $calories,
        float $protein,
        float $carbs,
        float $fat,
        string $eatenAt,
        string $source = 'manual',
        \DateTime $createdAt = null
    ) {
        $this->id = $id;
        $this->userId = $userId;
        $this->foodId = $foodId;
        $this->mealType = $mealType;
        $this->quantityGram = $quantityGram;
        $this->foodNameSnapshot = $foodNameSnapshot;
        $this->calories = $calories;
        $this->protein = $protein;
        $this->carbs = $carbs;
        $this->fat = $fat;
        $this->eatenAt = $eatenAt;
        $this->source = $source;
        $this->createdAt = $createdAt ?? new \DateTime();
    }
}
