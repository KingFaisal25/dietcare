<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Program;
use App\Models\User;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function create(Request $request)
    {
        $request->validate([
            'program_id' => 'required|exists:programs,id',
            'nutritionist_id' => 'nullable|exists:users,id',
            'promo_code' => 'nullable|string',
        ]);

        $program = Program::findOrFail($request->program_id);
        $nutritionist = $request->nutritionist_id ? User::findOrFail($request->nutritionist_id) : null;

        $order = $this->paymentService->createTransaction($program, $nutritionist, $request->promo_code);

        return response()->json([
            'message' => 'Order created successfully',
            'order' => $order,
        ]);
    }

    public function callback(Request $request)
    {
        $serverKey = config('payment.midtrans.server_key');
        $orderId = $request->input('order_id');
        $statusCode = $request->input('status_code');
        $grossAmount = $request->input('gross_amount');
        $signatureKey = $request->input('signature_key');

        // Validate Midtrans signature
        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        if ($signatureKey !== $expectedSignature) {
            Log::warning('Payment webhook: invalid signature for order ' . $orderId);
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $order = Order::where('order_code', $orderId)->first();

        if (!$order) {
            Log::warning('Payment webhook: order not found - ' . $orderId);
            return response()->json(['message' => 'Order not found'], 404);
        }

        $transactionStatus = $request->input('transaction_status');
        $fraudStatus = $request->input('fraud_status');

        Log::info("Payment webhook: order={$orderId} status={$transactionStatus} fraud={$fraudStatus}");

        if ($transactionStatus === 'capture' || $transactionStatus === 'settlement') {
            if ($fraudStatus === 'accept' || $fraudStatus === null) {
                $order->update(['status' => 'paid', 'paid_at' => now()]);
            }
        } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
            $order->update(['status' => 'cancelled']);
        } elseif ($transactionStatus === 'pending') {
            $order->update(['status' => 'pending']);
        }

        return response()->json(['message' => 'Webhook processed']);
    }
}
