<?php

namespace App\Application\DTOs;

/**
 * Data Transfer Object for creating/scheduling a consultation.
 */
readonly class CreateConsultationDTO
{
    public function __construct(
        public int $nutritionistProgramId,
        public string $type,
        public string $scheduledAt,
        public ?int $durationMinutes = 30,
        public ?string $notes = null,
    ) {}

    /**
     * Create from validated request data.
     */
    public static function fromArray(array $data): self
    {
        return new self(
            nutritionistProgramId: $data['nutritionist_program_id'],
            type: $data['type'],
            scheduledAt: $data['scheduled_at'],
            durationMinutes: $data['duration_minutes'] ?? 30,
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
            'type' => $this->type,
            'scheduled_at' => $this->scheduledAt,
            'duration_minutes' => $this->durationMinutes,
            'notes' => $this->notes,
            'status' => 'pending',
        ];
    }
}
