<?php

namespace App\Domain\Entities;

use App\Domain\Enums\ConsultationStatus;

/**
 * Domain Entity representing a Consultation session.
 *
 * Maps to the Consultation Eloquent model but contains
 * only domain logic without framework dependencies.
 */
class Consultation
{
    public function __construct(
        public readonly int $id,
        public readonly int $nutritionistProgramId,
        public readonly string $type,
        public readonly ConsultationStatus $status,
        public readonly ?\DateTimeImmutable $scheduledAt = null,
        public readonly ?int $durationMinutes = null,
        public readonly ?string $notes = null,
        public readonly ?\DateTimeImmutable $createdAt = null,
    ) {}

    /**
     * Check if the consultation can be cancelled.
     */
    public function isCancellable(): bool
    {
        return $this->status->canTransitionTo(ConsultationStatus::Cancelled);
    }

    /**
     * Check if the consultation is in a terminal state.
     */
    public function isFinished(): bool
    {
        return in_array($this->status, [
            ConsultationStatus::Completed,
            ConsultationStatus::Cancelled,
        ], true);
    }

    /**
     * Check if the consultation is currently active.
     */
    public function isActive(): bool
    {
        return $this->status === ConsultationStatus::InProgress;
    }

    /**
     * Check if the consultation is scheduled for the future.
     */
    public function isUpcoming(): bool
    {
        if ($this->scheduledAt === null) {
            return false;
        }

        return $this->scheduledAt > new \DateTimeImmutable()
            && $this->status === ConsultationStatus::Confirmed;
    }
}
