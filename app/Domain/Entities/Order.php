<?php

namespace App\Domain\Entities;

use App\Domain\Enums\OrderStatus;

/**
 * Domain Entity representing an Order/Payment transaction.
 *
 * Mirrors the Order Eloquent model's fields but keeps
 * business logic framework-agnostic.
 */
class Order
{
    public function __construct(
        public readonly int $id,
        public readonly int $userId,
        public readonly int $programId,
        public readonly ?int $nutritionistId,
        public readonly string $orderCode,
        public readonly float $totalAmount,
        public readonly float $discountAmount,
        public readonly float $finalAmount,
        public readonly OrderStatus $status,
        public readonly ?string $paymentMethod = null,
        public readonly ?string $midtransToken = null,
        public readonly ?int $promoCodeId = null,
        public readonly ?\DateTimeImmutable $paidAt = null,
        public readonly ?\DateTimeImmutable $expiredAt = null,
        public readonly ?\DateTimeImmutable $createdAt = null,
    ) {}

    /**
     * Check if the order is still awaiting payment.
     */
    public function isPending(): bool
    {
        return $this->status === OrderStatus::Pending;
    }

    /**
     * Check if payment has been received.
     */
    public function isPaid(): bool
    {
        return $this->status === OrderStatus::Paid;
    }

    /**
     * Check if the order has expired past the payment deadline.
     */
    public function isExpired(): bool
    {
        if ($this->status === OrderStatus::Expired) {
            return true;
        }

        // Check if pending order has passed its expiry time
        if ($this->isPending() && $this->expiredAt !== null) {
            return $this->expiredAt < new \DateTimeImmutable();
        }

        return false;
    }

    /**
     * Check if the order is in a terminal state (no further transitions).
     */
    public function isTerminal(): bool
    {
        return in_array($this->status, [
            OrderStatus::Paid,
            OrderStatus::Cancelled,
            OrderStatus::Expired,
        ], true);
    }

    /**
     * Check if a discount was applied.
     */
    public function hasDiscount(): bool
    {
        return $this->discountAmount > 0;
    }

    /**
     * Calculate the discount percentage.
     */
    public function discountPercentage(): float
    {
        if ($this->totalAmount <= 0) {
            return 0;
        }

        return round(($this->discountAmount / $this->totalAmount) * 100, 2);
    }
}
