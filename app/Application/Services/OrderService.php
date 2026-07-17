<?php

namespace App\Application\Services;

use App\Contracts\Repositories\OrderRepositoryInterface;
use App\Contracts\Services\PaymentServiceInterface;
use App\Domain\Entities\Order;
use App\Domain\Enums\OrderStatus;
use App\Models\Order as OrderModel;
use Illuminate\Support\Collection;

class OrderService
{
    public function __construct(
        private OrderRepositoryInterface $orderRepo,
        private PaymentServiceInterface $paymentService,
    ) {}

    /**
     * Get orders for a user.
     */
    public function getByUser(int $userId): Collection
    {
        return $this->orderRepo->getByUserId($userId);
    }

    /**
     * Find an order by code.
     */
    public function findByCode(string $orderCode): ?Order
    {
        return $this->orderRepo->findByOrderCode($orderCode);
    }

    /**
     * Create a new order and initiate the payment.
     */
    public function createOrder(int $userId, int $programId, ?int $nutritionistId, ?string $promoCodeStr, array $customerDetails): array
    {
        $program = \App\Models\Program::findOrFail($programId);

        if (!$nutritionistId) {
            $nutritionist = \App\Models\User::role('nutritionist')
                ->withCount(['nutritionistPrograms' => function ($query) {
                    $query->where('status', 'active');
                }])
                ->orderBy('nutritionist_programs_count', 'asc')
                ->first();

            if (!$nutritionist) {
                throw new \DomainException("Tidak ada ahli gizi yang tersedia saat ini.");
            }
            $nutritionistId = $nutritionist->id;
        }

        $totalAmount = (float) $program->price;
        $discountAmount = 0.0;
        $finalAmount = $totalAmount;
        $promoCodeId = null;

        if ($promoCodeStr) {
            $promo = \App\Models\PromoCode::where('code', strtoupper($promoCodeStr))->first();
            if ($promo && $promo->isValid()) {
                $discountAmount = (float) $promo->getDiscountAmount($totalAmount);
                if ($discountAmount > 0) {
                    $finalAmount = $totalAmount - $discountAmount;
                    $promoCodeId = $promo->id;
                }
            }
        }

        $order = $this->orderRepo->create([
            'user_id' => $userId,
            'program_id' => $programId,
            'nutritionist_id' => $nutritionistId,
            'promo_code_id' => $promoCodeId,
            'order_code' => OrderModel::generateOrderCode(),
            'total_amount' => $totalAmount,
            'discount_amount' => $discountAmount,
            'final_amount' => $finalAmount,
            'status' => OrderStatus::Pending->value,
            'expired_at' => now()->addHours(24),
        ]);

        $payment = $this->paymentService->createTransaction(
            $order->id,
            $order->finalAmount,
            $customerDetails
        );

        // Store the Midtrans token
        $updatedOrder = $this->orderRepo->updateStatus($order->id, OrderStatus::Pending, [
            'midtrans_token' => $payment['token'],
        ]);

        return [
            'order' => $updatedOrder ?: $order,
            'payment_token' => $payment['token'],
            'redirect_url' => $payment['redirect_url'],
        ];
    }

    /**
     * Handle payment notification from Midtrans.
     */
    public function handlePaymentNotification(array $payload): ?Order
    {
        $result = $this->paymentService->handleNotification($payload);

        $order = $this->orderRepo->findByOrderCode($result['order_id'] ?? '');

        if (!$order) {
            return null;
        }

        $newStatus = match ($result['status'] ?? '') {
            'settlement', 'capture' => OrderStatus::Paid,
            'cancel', 'deny' => OrderStatus::Cancelled,
            'expire' => OrderStatus::Expired,
            default => null,
        };

        if ($newStatus === null) {
            return $order;
        }

        $extra = [];
        if ($newStatus === OrderStatus::Paid) {
            $extra['paid_at'] = now();
        }

        return $this->orderRepo->updateStatus($order->id, $newStatus, $extra);
    }

    /**
     * Mark expired pending orders.
     */
    public function expireOverdueOrders(): int
    {
        $expired = $this->orderRepo->getExpiredPendingOrders();
        $count = 0;

        foreach ($expired as $order) {
            $this->orderRepo->updateStatus($order->id, OrderStatus::Expired);
            $count++;
        }

        return $count;
    }
}
