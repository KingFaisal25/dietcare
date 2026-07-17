<?php

namespace App\Domain\Entities;

/**
 * Domain Entity representing a Patient/Client Profile.
 *
 * Contains health metrics, dietary preferences, and fitness goals.
 * No Eloquent dependency — mapped from ClientProfile model.
 */
class Profile
{
    public function __construct(
        public readonly int $id,
        public readonly int $userId,
        public readonly ?float $heightCm = null,
        public readonly ?float $weightKg = null,
        public readonly ?int $age = null,
        public readonly ?string $birthDate = null,
        public readonly ?string $city = null,
        public readonly ?string $gender = null,
        public readonly ?string $activityLevel = null,
        public readonly array $medicalConditions = [],
        public readonly array $allergies = [],
        public readonly array $dietaryPreferences = [],
        public readonly ?string $dietaryRestrictions = null,
        public readonly ?string $targetType = null,
        public readonly ?float $targetWeightKg = null,
        public readonly ?float $bmi = null,
        public readonly ?float $bmr = null,
        public readonly ?float $tdee = null,
        public readonly ?int $calorieTarget = null,
    ) {}

    /**
     * Determine BMI category based on WHO classification.
     */
    public function bmiCategory(): ?string
    {
        if ($this->bmi === null) {
            return null;
        }

        return match (true) {
            $this->bmi < 18.5 => 'underweight',
            $this->bmi < 25.0 => 'normal',
            $this->bmi < 30.0 => 'overweight',
            default => 'obese',
        };
    }

    /**
     * Check if the profile has enough data to calculate nutrition targets.
     */
    public function hasCompleteHealthData(): bool
    {
        return $this->heightCm !== null
            && $this->weightKg !== null
            && $this->age !== null
            && $this->gender !== null
            && $this->activityLevel !== null;
    }

    /**
     * Check if the profile has any food allergies.
     */
    public function hasAllergies(): bool
    {
        return !empty($this->allergies);
    }
}
