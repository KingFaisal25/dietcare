<?php

namespace App\Application\Services;

use App\Contracts\Repositories\NotificationRepositoryInterface;
use App\Contracts\Services\NotificationServiceInterface;
use App\Models\User;
use Illuminate\Support\Collection;

class NotificationService implements NotificationServiceInterface
{
    public function __construct(
        private NotificationRepositoryInterface $notificationRepo,
    ) {}

    /**
     * @inheritDoc
     */
    public function send(int $userId, string $type, string $title, string $message, array $data = []): void
    {
        $this->notificationRepo->create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'is_read' => false,
        ]);
    }

    /**
     * @inheritDoc
     */
    public function sendToMany(array $userIds, string $type, string $title, string $message, array $data = []): void
    {
        foreach ($userIds as $userId) {
            $this->send($userId, $type, $title, $message, $data);
        }
    }

    /**
     * @inheritDoc
     */
    public function sendToRole(string $role, string $type, string $title, string $message, array $data = []): void
    {
        $userIds = User::role($role)->pluck('id')->all();

        $this->sendToMany($userIds, $type, $title, $message, $data);
    }

    /**
     * @inheritDoc
     */
    public function markAsRead(int $notificationId): void
    {
        $this->notificationRepo->markAsRead($notificationId);
    }

    /**
     * @inheritDoc
     */
    public function markAllAsRead(int $userId): void
    {
        $this->notificationRepo->markAllAsRead($userId);
    }

    /**
     * @inheritDoc
     */
    public function unreadCount(int $userId): int
    {
        return $this->notificationRepo->countUnread($userId);
    }

    /**
     * Get notifications for a user.
     */
    public function getForUser(int $userId, int $limit = 50): Collection
    {
        return $this->notificationRepo->getByUserId($userId, $limit);
    }

    /**
     * Get unread notifications for a user.
     */
    public function getUnreadForUser(int $userId): Collection
    {
        return $this->notificationRepo->getUnreadByUserId($userId);
    }
}
