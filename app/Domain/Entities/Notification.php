<?php

namespace App\Domain\Entities;

/**
 * Domain Entity representing a user Notification.
 *
 * Maps to the Notification Eloquent model but contains
 * only domain logic without framework dependencies.
 */
class Notification
{
    public function __construct(
        public readonly int $id,
        public readonly int $userId,
        public readonly string $type,
        public readonly string $title,
        public readonly string $message,
        public readonly array $data = [],
        public readonly bool $isRead = false,
        public readonly ?\DateTimeImmutable $readAt = null,
        public readonly ?\DateTimeImmutable $createdAt = null,
    ) {}

    /**
     * Check if the notification has been read.
     */
    public function isRead(): bool
    {
        return $this->isRead;
    }

    /**
     * Check if the notification is unread.
     */
    public function isUnread(): bool
    {
        return !$this->isRead;
    }

    /**
     * Check if the notification belongs to a given user.
     */
    public function belongsTo(int $userId): bool
    {
        return $this->userId === $userId;
    }
}
