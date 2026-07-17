<?php

namespace App\Domain\Enums;

/**
 * Enum representing the three allowed user roles in the system.
 *
 * Used throughout Domain and Application layers for type-safe
 * role checks instead of raw string comparisons.
 */
enum UserRole: string
{
    case Admin = 'admin';
    case Nutritionist = 'nutritionist';
    case Patient = 'patient';

    /**
     * Get the dashboard redirect path for this role.
     */
    public function dashboardPath(): string
    {
        return match ($this) {
            self::Admin => '/admin/dashboard',
            self::Nutritionist => '/nutritionist/dashboard',
            self::Patient => '/dashboard',
        };
    }

    /**
     * Get a human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrator',
            self::Nutritionist => 'Nutritionist',
            self::Patient => 'Patient',
        };
    }

    /**
     * Check if this role has a higher privilege than the given role.
     */
    public function isHigherThan(self $other): bool
    {
        $hierarchy = [
            self::Patient->value => 0,
            self::Nutritionist->value => 1,
            self::Admin->value => 2,
        ];

        return $hierarchy[$this->value] > $hierarchy[$other->value];
    }
}
