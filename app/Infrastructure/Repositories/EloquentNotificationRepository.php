<?php

namespace App\Infrastructure\Repositories;

use App\Contracts\Repositories\NotificationRepositoryInterface;
use App\Domain\Entities\Notification;
use App\Models\Notification as NotificationModel;
use Illuminate\Support\Collection;

class EloquentNotificationRepository implements NotificationRepositoryInterface
{
    public function findById(int $id): ?Notification
    {
        $model = NotificationModel::find($id);

        return $model ? $this->toEntity($model) : null;
    }

    public function getByUserId(int $userId, int $limit = 50): Collection
    {
        return NotificationModel::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn (NotificationModel $model) => $this->toEntity($model));
    }

    public function getUnreadByUserId(int $userId): Collection
    {
        return NotificationModel::where('user_id', $userId)
            ->where('is_read', false)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (NotificationModel $model) => $this->toEntity($model));
    }

    public function countUnread(int $userId): int
    {
        return NotificationModel::where('user_id', $userId)
            ->where('is_read', false)
            ->count();
    }

    public function create(array $attributes): Notification
    {
        $model = NotificationModel::create($attributes);

        return $this->toEntity($model);
    }

    public function markAsRead(int $id): ?Notification
    {
        $model = NotificationModel::find($id);

        if (!$model) {
            return null;
        }

        $model->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return $this->toEntity($model->fresh());
    }

    public function markAllAsRead(int $userId): int
    {
        return NotificationModel::where('user_id', $userId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    public function delete(int $id): bool
    {
        $model = NotificationModel::find($id);

        return $model ? (bool) $model->delete() : false;
    }

    private function toEntity(NotificationModel $model): Notification
    {
        return new Notification(
            id: $model->id,
            userId: $model->user_id,
            type: $model->type,
            title: $model->title,
            message: $model->message,
            data: $model->data ?? [],
            isRead: (bool) $model->is_read,
            readAt: $model->read_at
                ? \DateTimeImmutable::createFromMutable($model->read_at->toDateTime())
                : null,
            createdAt: $model->created_at
                ? \DateTimeImmutable::createFromMutable($model->created_at->toDateTime())
                : null,
        );
    }
}
