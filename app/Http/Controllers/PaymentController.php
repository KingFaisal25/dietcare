<?php

namespace App\Http\Controllers;

use App\Application\Services\OrderService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        private OrderService $orderService
    ) {}

    public function create(Request $request)
    {
        $request->validate([
            'program_id' => 'required|exists:programs,id',
            'nutritionist_id' => 'nullable|exists:users,id',
            'promo_code' => 'nullable|string',
        ]);

        $user = $request->user();
        $customerDetails = [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
        ];

        try {
            $result = $this->orderService->createOrder(
                $user->id,
                (int) $request->program_id,
                $request->nutritionist_id ? (int) $request->nutritionist_id : null,
                $request->promo_code,
                $customerDetails
            );
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }

        return response()->json([
            'message' => 'Order created successfully',
            'order' => $result['order'],
            'token' => $result['payment_token'],
            'redirect_url' => $result['redirect_url'],
        ]);
    }

    public function callback(Request $request)
    {
        $order = $this->orderService->handlePaymentNotification($request->all());

        if (!$order) {
            return response()->json(['message' => 'Order not found or invalid signature'], 400);
        }

        return response()->json(['message' => 'Webhook processed']);
    }
}

