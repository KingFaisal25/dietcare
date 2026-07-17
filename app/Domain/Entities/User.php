<?php

namespace App\Domain\Entities;

use App\Domain\Enums\UserRole;

/**
 * Domain Entity representing a User.
 *
 * This class is a plain PHP object without any Laravel Eloquent
 * dependencies. It contains only the business‑relevant attributes
 * and logic required by the application layer.
 */
class User
{
    public function __construct(
        public readonly int $id,
        public readonly string $name,
        public readonly string $email,
        public readonly UserRole $role,
        public readonly ?string $username = null,
        public readonly ?string $phone = null,
        public readonly ?string $avatar = null,
        public readonly ?\DateTimeImmutable $emailVerifiedAt = null,
        public readonly ?string $status = 'active',
    ) {}

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isNutritionist(): bool
    {
        return $this->role === UserRole::Nutritionist;
    }

    public function isPatient(): bool
    {
        return $this->role === UserRole::Patient;
    }

    public function isEmailVerified(): bool
    {
        return $this->emailVerifiedAt !== null;
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Get the dashboard path for this user's role.
     */
    public function dashboardPath(): string
    {
        return $this->role->dashboardPath();
    }
}
