<?php

namespace App\Contracts\Repositories;

use App\Domain\Entities\Order;
use App\Domain\Enums\OrderStatus;
use Illuminate\Support\Collection;

interface OrderRepositoryInterface
{
    /**
     * Find an order by ID.
     */
    public function findById(int $id): ?Order;

    /**
     * Find an order by order code.
     */
    public function findByOrderCode(string $orderCode): ?Order;

    /**
     * Get orders for a user.
     */
    public function getByUserId(int $userId): Collection;

    /**
     * Get orders by status.
     */
    public function getByStatus(OrderStatus $status): Collection;

    /**
     * Create a new order.
     */
    public function create(array $attributes): Order;

    /**
     * Update order status.
     */
    public function updateStatus(int $id, OrderStatus $status, array $extra = []): ?Order;

    /**
     * Get expired pending orders (past their expired_at).
     */
    public function getExpiredPendingOrders(): Collection;
}
