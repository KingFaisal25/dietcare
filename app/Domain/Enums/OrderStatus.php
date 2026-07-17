<?php

namespace App\Domain\Enums;

/**
 * Enum representing the lifecycle statuses of an Order.
 *
 * Flow: Pending → Paid | Cancelled | Expired
 */
enum OrderStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Cancelled = 'cancelled';
    case Expired = 'expired';

    /**
     * Whether this status represents a terminal (final) state.
     */
    public function isTerminal(): bool
    {
        return match ($this) {
            self::Paid, self::Cancelled, self::Expired => true,
            default => false,
        };
    }

    /**
     * Allowed transitions from the current status.
     *
     * @return self[]
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Pending => [self::Paid, self::Cancelled, self::Expired],
            self::Paid => [],
            self::Cancelled => [],
            self::Expired => [],
        };
    }

    /**
     * Check if transitioning to the given status is valid.
     */
    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitions(), true);
    }

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Menunggu Pembayaran',
            self::Paid => 'Sudah Dibayar',
            self::Cancelled => 'Dibatalkan',
            self::Expired => 'Kadaluarsa',
        };
    }
}
