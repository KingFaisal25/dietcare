<?php

namespace App\Infrastructure\Services;

use App\Contracts\Services\PaymentServiceInterface;
use Illuminate\Support\Facades\Log;
use Midtrans\Config as MidtransConfig;
use Midtrans\Snap as MidtransSnap;
use Midtrans\Transaction as MidtransTransaction;

class MidtransPaymentService implements PaymentServiceInterface
{
    public function __construct()
    {
        try {
            MidtransConfig::$serverKey = config('payment.midtrans.server_key');
            MidtransConfig::$isProduction = config('payment.midtrans.is_production');
            MidtransConfig::$isSanitized = true;
            MidtransConfig::$is3ds = true;
        } catch (\Exception $e) {
            Log::error('Midtrans Configuration Error: ' . $e->getMessage());
        }
    }

    /**
     * {@inheritDoc}
     */
    public function createTransaction(int $orderId, float $amount, array $customerDetails): array
    {
        // Fetch order code since Midtrans expects a unique order ID string
        $order = \App\Models\Order::findOrFail($orderId);
        $orderCode = $order->order_code;

        $payload = [
            'transaction_details' => [
                'order_id' => $orderCode,
                'gross_amount' => (int) $amount,
            ],
            'customer_details' => [
                'first_name' => $customerDetails['name'] ?? '',
                'email' => $customerDetails['email'] ?? '',
                'phone' => $customerDetails['phone'] ?? '',
            ],
            'enabled_payments' => [
                'credit_card', 'cimb_clicks',
                'bca_klikbca', 'bca_klikpay', 'bri_epay', 'echannel', 'permata_va',
                'bca_va', 'bni_va', 'bri_va', 'other_va', 'gopay', 'indomaret',
                'danamon_online', 'akulaku', 'shopeepay',
            ],
        ];

        try {
            $transaction = MidtransSnap::createTransaction($payload);
            return [
                'token' => $transaction->token,
                'redirect_url' => $transaction->redirect_url,
            ];
        } catch (\Exception $e) {
            Log::error('Midtrans Create Transaction Error: ' . $e->getMessage());
            throw new \RuntimeException('Gagal memproses transaksi ke payment gateway. ' . $e->getMessage());
        }
    }

    /**
     * {@inheritDoc}
     */
    public function handleNotification(array $payload): array
    {
        $serverKey = config('payment.midtrans.server_key');
        $orderId = $payload['order_id'] ?? '';
        $statusCode = $payload['status_code'] ?? '';
        $grossAmount = $payload['gross_amount'] ?? '';
        $signatureKey = $payload['signature_key'] ?? '';

        // Validate Midtrans signature
        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        if ($signatureKey !== $expectedSignature) {
            Log::warning('Payment webhook: invalid signature for order ' . $orderId);
            throw new \InvalidArgumentException('Invalid signature');
        }

        return [
            'order_id' => $orderId,
            'status' => $payload['transaction_status'] ?? '',
        ];
    }

    /**
     * {@inheritDoc}
     */
    public function checkStatus(string $orderCode): array
    {
        try {
            $status = MidtransTransaction::status($orderCode);
            return [
                'status' => $status->transaction_status,
                'transaction_time' => $status->transaction_time ?? null,
            ];
        } catch (\Exception $e) {
            Log::error('Midtrans Check Status Error: ' . $e->getMessage());
            throw new \RuntimeException('Gagal mengambil status transaksi dari payment gateway.');
        }
    }

    /**
     * {@inheritDoc}
     */
    public function cancelTransaction(string $orderCode): bool
    {
        try {
            MidtransTransaction::cancel($orderCode);
            return true;
        } catch (\Exception $e) {
            Log::error('Midtrans Cancel Transaction Error: ' . $e->getMessage());
            return false;
        }
    }
}
