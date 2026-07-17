<?php

namespace App\Contracts\Repositories;

use App\Domain\Entities\Profile;

interface ProfileRepositoryInterface
{
    /**
     * Find a profile by its ID.
     */
    public function findById(int $id): ?Profile;

    /**
     * Find a profile by user ID.
     */
    public function findByUserId(int $userId): ?Profile;

    /**
     * Create or update a profile.
     */
    public function save(int $userId, array $attributes): Profile;

    /**
     * Delete a profile.
     */
    public function delete(int $id): void;
}
