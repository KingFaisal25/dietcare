<?php

namespace App\Contracts\Repositories;

use App\Domain\Entities\Notification;
use Illuminate\Support\Collection;

interface NotificationRepositoryInterface
{
    /**
     * Find a notification by ID.
     */
    public function findById(int $id): ?Notification;

    /**
     * Get notifications for a user.
     */
    public function getByUserId(int $userId, int $limit = 50): Collection;

    /**
     * Get unread notifications for a user.
     */
    public function getUnreadByUserId(int $userId): Collection;

    /**
     * Count unread notifications for a user.
     */
    public function countUnread(int $userId): int;

    /**
     * Create a new notification.
     */
    public function create(array $attributes): Notification;

    /**
     * Mark a notification as read.
     */
    public function markAsRead(int $id): ?Notification;

    /**
     * Mark all notifications as read for a user.
     */
    public function markAllAsRead(int $userId): int;

    /**
     * Delete a notification.
     */
    public function delete(int $id): bool;
}
