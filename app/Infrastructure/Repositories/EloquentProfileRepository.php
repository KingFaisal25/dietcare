<?php

namespace App\Infrastructure\Repositories;

use App\Contracts\Repositories\ProfileRepositoryInterface;
use App\Domain\Entities\Profile;
use App\Models\ClientProfile;

class EloquentProfileRepository implements ProfileRepositoryInterface
{
    public function findById(int $id): ?Profile
    {
        $model = ClientProfile::find($id);

        return $model ? $this->toEntity($model) : null;
    }

    public function findByUserId(int $userId): ?Profile
    {
        $model = ClientProfile::where('user_id', $userId)->first();

        return $model ? $this->toEntity($model) : null;
    }

    public function save(int $userId, array $attributes): Profile
    {
        $model = ClientProfile::updateOrCreate(
            ['user_id' => $userId],
            $attributes
        );

        return $this->toEntity($model);
    }

    public function delete(int $id): void
    {
        ClientProfile::destroy($id);
    }

    private function toEntity(ClientProfile $model): Profile
    {
        return new Profile(
            id: $model->id,
            userId: $model->user_id,
            heightCm: $model->height_cm ? (float) $model->height_cm : null,
            weightKg: $model->weight_kg ? (float) $model->weight_kg : null,
            age: $model->age,
            birthDate: $model->birth_date?->toDateString(),
            city: $model->city,
            gender: $model->gender,
            activityLevel: $model->activity_level,
            medicalConditions: $model->medical_conditions ?? [],
            allergies: $model->allergies ?? [],
            dietaryPreferences: $model->dietary_preferences ?? [],
            dietaryRestrictions: $model->dietary_restrictions,
            targetType: $model->target_type,
            targetWeightKg: $model->target_weight_kg ? (float) $model->target_weight_kg : null,
            bmi: $model->bmi ? (float) $model->bmi : null,
            bmr: $model->bmr ? (float) $model->bmr : null,
            tdee: $model->tdee ? (float) $model->tdee : null,
            calorieTarget: $model->calorie_target ? (int) $model->calorie_target : null,
        );
    }
}
