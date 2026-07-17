<?php

namespace App\Contracts\Repositories;

use App\Domain\Entities\Consultation;
use App\Domain\Enums\ConsultationStatus;
use Illuminate\Support\Collection;

interface ConsultationRepositoryInterface
{
    /**
     * Find a consultation by ID.
     */
    public function findById(int $id): ?Consultation;

    /**
     * Get consultations for a nutritionist program.
     */
    public function getByProgramId(int $nutritionistProgramId): Collection;

    /**
     * Get upcoming consultations for a user (as patient or nutritionist).
     */
    public function getUpcomingForUser(int $userId, string $role): Collection;

    /**
     * Create a new consultation.
     */
    public function create(array $attributes): Consultation;

    /**
     * Update consultation status.
     */
    public function updateStatus(int $id, ConsultationStatus $status): ?Consultation;

    /**
     * Update consultation details.
     */
    public function update(int $id, array $attributes): ?Consultation;

    /**
     * Delete a consultation.
     */
    public function delete(int $id): bool;
}
