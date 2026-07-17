<?php

namespace App\Infrastructure\Repositories;

use App\Contracts\Repositories\ConsultationRepositoryInterface;
use App\Domain\Entities\Consultation;
use App\Domain\Enums\ConsultationStatus;
use App\Models\Consultation as ConsultationModel;
use App\Models\NutritionistProgram;
use Illuminate\Support\Collection;

class EloquentConsultationRepository implements ConsultationRepositoryInterface
{
    public function findById(int $id): ?Consultation
    {
        $model = ConsultationModel::find($id);

        return $model ? $this->toEntity($model) : null;
    }

    public function getByProgramId(int $nutritionistProgramId): Collection
    {
        return ConsultationModel::where('nutritionist_program_id', $nutritionistProgramId)
            ->orderBy('scheduled_at', 'desc')
            ->get()
            ->map(fn (ConsultationModel $model) => $this->toEntity($model));
    }

    public function getUpcomingForUser(int $userId, string $role): Collection
    {
        $query = ConsultationModel::query()
            ->whereIn('status', [
                ConsultationStatus::Pending->value,
                ConsultationStatus::Confirmed->value,
            ])
            ->where('scheduled_at', '>=', now())
            ->orderBy('scheduled_at', 'asc');

        // Scope to programs where the user is the patient or the nutritionist
        $query->whereHas('nutritionistProgram', function ($q) use ($userId, $role) {
            if ($role === 'nutritionist') {
                $q->whereHas('order', function ($orderQ) use ($userId) {
                    $orderQ->where('nutritionist_id', $userId);
                });
            } else {
                $q->whereHas('order', function ($orderQ) use ($userId) {
                    $orderQ->where('user_id', $userId);
                });
            }
        });

        return $query->get()
            ->map(fn (ConsultationModel $model) => $this->toEntity($model));
    }

    public function create(array $attributes): Consultation
    {
        $model = ConsultationModel::create($attributes);

        return $this->toEntity($model);
    }

    public function updateStatus(int $id, ConsultationStatus $status): ?Consultation
    {
        $model = ConsultationModel::find($id);

        if (!$model) {
            return null;
        }

        $model->update(['status' => $status->value]);

        return $this->toEntity($model->fresh());
    }

    public function update(int $id, array $attributes): ?Consultation
    {
        $model = ConsultationModel::find($id);

        if (!$model) {
            return null;
        }

        $model->update($attributes);

        return $this->toEntity($model->fresh());
    }

    public function delete(int $id): bool
    {
        $model = ConsultationModel::find($id);

        return $model ? (bool) $model->delete() : false;
    }

    private function toEntity(ConsultationModel $model): Consultation
    {
        return new Consultation(
            id: $model->id,
            nutritionistProgramId: $model->nutritionist_program_id,
            type: $model->type,
            status: ConsultationStatus::from($model->status),
            scheduledAt: $model->scheduled_at
                ? \DateTimeImmutable::createFromMutable($model->scheduled_at->toDateTime())
                : null,
            durationMinutes: $model->duration_minutes,
            notes: $model->notes,
            createdAt: $model->created_at
                ? \DateTimeImmutable::createFromMutable($model->created_at->toDateTime())
                : null,
        );
    }
}
