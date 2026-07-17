<?php

namespace App\Application\Services;

use App\Contracts\Repositories\ProfileRepositoryInterface;
use App\Domain\Entities\Profile;

class ProfileService
{
    public function __construct(
        private ProfileRepositoryInterface $profileRepo,
    ) {}

    /**
     * Get the profile for a user, or null if not created yet.
     */
    public function getByUserId(int $userId): ?Profile
    {
        return $this->profileRepo->findByUserId($userId);
    }

    /**
     * Create or update a user's profile.
     */
    public function upsert(int $userId, array $data): Profile
    {
        return $this->profileRepo->save($userId, $data);
    }

    /**
     * Calculate BMI from the given height and weight, and persist it.
     */
    public function updateBmi(int $userId, float $heightCm, float $weightKg): Profile
    {
        $heightM = $heightCm / 100;
        $bmi = round($weightKg / ($heightM * $heightM), 2);

        return $this->profileRepo->save($userId, [
            'height_cm' => $heightCm,
            'weight_kg' => $weightKg,
            'bmi' => $bmi,
        ]);
    }

    /**
     * Delete a user's profile.
     */
    public function delete(int $profileId): void
    {
        $this->profileRepo->delete($profileId);
    }
}
