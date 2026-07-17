<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Program;
use App\Models\User;
use App\Models\PromoCode;
use Illuminate\Support\Facades\Auth;
use Midtrans\Config as MidtransConfig;
use Midtrans\Snap as MidtransSnap;

use App\Exceptions\PaymentException;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    public function __construct()
    {
        // Set up Midtrans configuration
        try {
            MidtransConfig::$serverKey = config('payment.midtrans.server_key');
            MidtransConfig::$isProduction = config('payment.midtrans.is_production');
            MidtransConfig::$isSanitized = true;
            MidtransConfig::$is3ds = true;
        } catch (\Exception $e) {
            Log::error('Midtrans Configuration Error: ' . $e->getMessage());
            throw new PaymentException('Gagal menginisialisasi layanan pembayaran.');
        }
    }

    public function createTransaction(Program $program, ?User $nutritionist = null, ?string $promoCodeStr = null): Order
    {
        $user = Auth::user();
        Log::info('Creating transaction for user: ' . $user->id . ' for program: ' . $program->id);
        
        // Auto-assign nutritionist if not provided
        if (!$nutritionist) {
            $nutritionist = User::role('nutritionist')
                ->withCount(['nutritionistPrograms' => function ($query) {
                    $query->where('status', 'active');
                }])
                ->orderBy('nutritionist_programs_count', 'asc')
                ->first();
                
            if (!$nutritionist) {
                Log::warning('No nutritionists available for auto-assignment.');
                throw new PaymentException("Tidak ada ahli gizi yang tersedia saat ini.");
            }
        }
        
        $totalAmount = $program->price;
        $discountAmount = 0;
        $finalAmount = $totalAmount;
        $promoCodeId = null;

        if ($promoCodeStr) {
            $promo = PromoCode::where('code', strtoupper($promoCodeStr))->first();
            if ($promo && $promo->isValid()) {
                $discountAmount = $promo->getDiscountAmount($totalAmount);
                if ($discountAmount > 0) {
                    $finalAmount = $totalAmount - $discountAmount;
                    $promoCodeId = $promo->id;
                    Log::info('Promo code applied: ' . $promoCodeStr . ' Discount: ' . $discountAmount);
                }
            } else {
                Log::warning('Invalid promo code attempt: ' . $promoCodeStr);
            }
        }

        try {
            // Create a new order
            $order = Order::create([
                'user_id' => $user->id,
                'program_id' => $program->id,
                'nutritionist_id' => $nutritionist->id,
                'promo_code_id' => $promoCodeId,
                'order_code' => Order::generateOrderCode(),
                'total_amount' => $totalAmount,
                'discount_amount' => $discountAmount,
                'final_amount' => $finalAmount,
                'status' => 'pending',
                'expired_at' => now()->addDay(),
            ]);

            // Prepare Midtrans transaction details
            $midtransPayload = $this->createMidtransPayload($order, $user, $program, $nutritionist, $discountAmount);

            // Get Snap token from Midtrans
            $snapToken = MidtransSnap::getSnapToken($midtransPayload);

            // Save Snap token to the order
            $order->update(['midtrans_token' => $snapToken]);

            Log::info('Transaction created successfully: ' . $order->order_code);
            return $order;
        } catch (\Exception $e) {
            Log::error('Transaction Creation Error: ' . $e->getMessage());
            throw new PaymentException('Gagal memproses transaksi. Silakan coba lagi.');
        }
    }

    private function createMidtransPayload(Order $order, User $user, Program $program, User $nutritionist, float $discountAmount = 0): array
    {
        $itemDetails = [
            [
                'id' => $program->id,
                'price' => $program->price,
                'quantity' => 1,
                'name' => 'Konsultasi Gizi: ' . $program->name,
                'brand' => 'DietCare',
                'category' => 'Nutritionist Consultation',
                'merchant_name' => 'DietCare',
            ],
        ];

        if ($discountAmount > 0) {
            $itemDetails[] = [
                'id' => 'DISCOUNT',
                'price' => -$discountAmount,
                'quantity' => 1,
                'name' => 'Diskon Promo',
            ];
        }

        return [
            'transaction_details' => [
                'order_id' => $order->order_code,
                'gross_amount' => $order->final_amount,
            ],
            'item_details' => $itemDetails,
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'enabled_payments' => [
                'credit_card', 'cimb_clicks',
                'bca_klikbca', 'bca_klikpay', 'bri_epay', 'echannel', 'permata_va',
                'bca_va', 'bni_va', 'bri_va', 'other_va', 'gopay', 'indomaret',
                'danamon_online', 'akulaku', 'shopeepay',
            ],
            'callbacks' => [
                'finish' => route('payment.callback'),
            ],
        ];
    }
}
