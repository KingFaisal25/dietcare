<?php

namespace App\Contracts\Services;

interface NotificationServiceInterface
{
    /**
     * Send a notification to a specific user.
     *
     * @param  int     $userId
     * @param  string  $type     Notification type identifier
     * @param  string  $title
     * @param  string  $message
     * @param  array   $data     Additional payload data
     */
    public function send(int $userId, string $type, string $title, string $message, array $data = []): void;

    /**
     * Send a notification to multiple users.
     *
     * @param  array<int>  $userIds
     * @param  string      $type
     * @param  string      $title
     * @param  string      $message
     * @param  array       $data
     */
    public function sendToMany(array $userIds, string $type, string $title, string $message, array $data = []): void;

    /**
     * Send a notification to all users with a given role.
     *
     * @param  string  $role   Role name (admin, nutritionist, patient)
     * @param  string  $type
     * @param  string  $title
     * @param  string  $message
     * @param  array   $data
     */
    public function sendToRole(string $role, string $type, string $title, string $message, array $data = []): void;

    /**
     * Mark a notification as read.
     */
    public function markAsRead(int $notificationId): void;

    /**
     * Mark all notifications as read for a user.
     */
    public function markAllAsRead(int $userId): void;

    /**
     * Get the unread notification count for a user.
     */
    public function unreadCount(int $userId): int;
}
