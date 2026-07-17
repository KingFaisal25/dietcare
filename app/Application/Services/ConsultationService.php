<?php

namespace App\Application\Services;

use App\Application\DTOs\CreateConsultationDTO;
use App\Contracts\Repositories\ConsultationRepositoryInterface;
use App\Contracts\Services\NotificationServiceInterface;
use App\Domain\Entities\Consultation;
use App\Domain\Enums\ConsultationStatus;
use Illuminate\Support\Collection;

class ConsultationService
{
    public function __construct(
        private ConsultationRepositoryInterface $consultationRepo,
        private NotificationServiceInterface $notificationService,
    ) {}

    /**
     * Get consultations for a program.
     */
    public function getByProgram(int $nutritionistProgramId): Collection
    {
        return $this->consultationRepo->getByProgramId($nutritionistProgramId);
    }

    /**
     * Get upcoming consultations for a user.
     */
    public function getUpcoming(int $userId, string $role): Collection
    {
        return $this->consultationRepo->getUpcomingForUser($userId, $role);
    }

    /**
     * Schedule a new consultation.
     */
    public function schedule(CreateConsultationDTO $dto): Consultation
    {
        $consultation = $this->consultationRepo->create($dto->toArray());

        return $consultation;
    }

    /**
     * Confirm a consultation.
     */
    public function confirm(int $id): ?Consultation
    {
        $consultation = $this->consultationRepo->findById($id);

        if (!$consultation) {
            return null;
        }

        if (!$consultation->status->canTransitionTo(ConsultationStatus::Confirmed)) {
            throw new \DomainException(
                "Cannot confirm consultation in '{$consultation->status->value}' status."
            );
        }

        return $this->consultationRepo->updateStatus($id, ConsultationStatus::Confirmed);
    }

    /**
     * Start a consultation (mark as in-progress).
     */
    public function start(int $id): ?Consultation
    {
        $consultation = $this->consultationRepo->findById($id);

        if (!$consultation) {
            return null;
        }

        if (!$consultation->status->canTransitionTo(ConsultationStatus::InProgress)) {
            throw new \DomainException(
                "Cannot start consultation in '{$consultation->status->value}' status."
            );
        }

        return $this->consultationRepo->updateStatus($id, ConsultationStatus::InProgress);
    }

    /**
     * Complete a consultation.
     */
    public function complete(int $id, ?string $notes = null): ?Consultation
    {
        $consultation = $this->consultationRepo->findById($id);

        if (!$consultation) {
            return null;
        }

        if (!$consultation->status->canTransitionTo(ConsultationStatus::Completed)) {
            throw new \DomainException(
                "Cannot complete consultation in '{$consultation->status->value}' status."
            );
        }

        if ($notes) {
            $this->consultationRepo->update($id, ['notes' => $notes]);
        }

        return $this->consultationRepo->updateStatus($id, ConsultationStatus::Completed);
    }

    /**
     * Cancel a consultation.
     */
    public function cancel(int $id, ?string $reason = null): ?Consultation
    {
        $consultation = $this->consultationRepo->findById($id);

        if (!$consultation) {
            return null;
        }

        if (!$consultation->isCancellable()) {
            throw new \DomainException(
                "Cannot cancel consultation in '{$consultation->status->value}' status."
            );
        }

        if ($reason) {
            $this->consultationRepo->update($id, ['notes' => $reason]);
        }

        return $this->consultationRepo->updateStatus($id, ConsultationStatus::Cancelled);
    }
}
