<?php

namespace App\Infrastructure\Repositories;

use App\Contracts\Repositories\OrderRepositoryInterface;
use App\Domain\Entities\Order;
use App\Domain\Enums\OrderStatus;
use App\Models\Order as OrderModel;
use Illuminate\Support\Collection;

class EloquentOrderRepository implements OrderRepositoryInterface
{
    public function findById(int $id): ?Order
    {
        $model = OrderModel::find($id);

        return $model ? $this->toEntity($model) : null;
    }

    public function findByOrderCode(string $orderCode): ?Order
    {
        $model = OrderModel::where('order_code', $orderCode)->first();

        return $model ? $this->toEntity($model) : null;
    }

    public function getByUserId(int $userId): Collection
    {
        return OrderModel::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (OrderModel $model) => $this->toEntity($model));
    }

    public function getByStatus(OrderStatus $status): Collection
    {
        return OrderModel::where('status', $status->value)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (OrderModel $model) => $this->toEntity($model));
    }

    public function create(array $attributes): Order
    {
        $model = OrderModel::create($attributes);

        return $this->toEntity($model);
    }

    public function updateStatus(int $id, OrderStatus $status, array $extra = []): ?Order
    {
        $model = OrderModel::find($id);

        if (!$model) {
            return null;
        }

        $model->update(array_merge(['status' => $status->value], $extra));

        return $this->toEntity($model->fresh());
    }

    public function getExpiredPendingOrders(): Collection
    {
        return OrderModel::where('status', OrderStatus::Pending->value)
            ->where('expired_at', '<', now())
            ->get()
            ->map(fn (OrderModel $model) => $this->toEntity($model));
    }

    private function toEntity(OrderModel $model): Order
    {
        return new Order(
            id: $model->id,
            userId: $model->user_id,
            programId: $model->program_id,
            nutritionistId: $model->nutritionist_id,
            orderCode: $model->order_code,
            totalAmount: (float) $model->total_amount,
            discountAmount: (float) ($model->discount_amount ?? 0),
            finalAmount: (float) $model->final_amount,
            status: OrderStatus::from($model->status),
            paymentMethod: $model->payment_method,
            midtransToken: $model->midtrans_token,
            promoCodeId: $model->promo_code_id,
            paidAt: $model->paid_at
                ? \DateTimeImmutable::createFromMutable($model->paid_at->toDateTime())
                : null,
            expiredAt: $model->expired_at
                ? \DateTimeImmutable::createFromMutable($model->expired_at->toDateTime())
                : null,
            createdAt: $model->created_at
                ? \DateTimeImmutable::createFromMutable($model->created_at->toDateTime())
                : null,
        );
    }
}
