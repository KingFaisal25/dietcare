<?php

namespace App\Contracts\Services;

interface PaymentServiceInterface
{
    /**
     * Create a payment transaction for an order.
     *
     * @param  int    $orderId
     * @param  float  $amount
     * @param  array  $customerDetails
     * @return array{token: string, redirect_url: string}
     */
    public function createTransaction(int $orderId, float $amount, array $customerDetails): array;

    /**
     * Handle a payment notification/callback from the gateway.
     *
     * @param  array  $payload  Raw notification payload from Midtrans
     * @return array{order_id: int, status: string}
     */
    public function handleNotification(array $payload): array;

    /**
     * Check the status of an existing transaction.
     *
     * @param  string  $orderCode
     * @return array{status: string, transaction_time: ?string}
     */
    public function checkStatus(string $orderCode): array;

    /**
     * Cancel a pending transaction.
     *
     * @param  string  $orderCode
     */
    public function cancelTransaction(string $orderCode): bool;
}
