<?php

namespace App\Observers;

use App\Models\Order;
use App\Models\NutritionistProgram;
use App\Models\PromoCodeUsage;
use App\Mail\OrderConfirmationMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;

class OrderObserver
{
    /**
     * Handle the Order "updated" event.
     *
     * @param  \App\Models\Order  $order
     * @return void
     */
    public function updated(Order $order)
    {
        // Check if the order status was changed to 'paid'
        if ($order->isDirty('status') && $order->status === 'paid') {
            DB::transaction(function () use ($order) {
                // Create a new NutritionistProgram
                NutritionistProgram::create([
                    'order_id' => $order->id,
                    'client_id' => $order->user_id,
                    'nutritionist_id' => $order->nutritionist_id,
                    'program_id' => $order->program_id,
                    'start_date' => now(),
                    'end_date' => now()->addDays($order->program->duration_days),
                    'status' => 'active',
                    'remaining_consultations' => $order->program->max_consultations,
                ]);

                // Record PromoCodeUsage if order has promo code
                if ($order->promo_code_id && $order->discount_amount > 0) {
                    PromoCodeUsage::create([
                        'promo_code_id' => $order->promo_code_id,
                        'order_id' => $order->id,
                        'user_id' => $order->user_id,
                        'discount_amount' => $order->discount_amount,
                        'used_at' => now(),
                    ]);

                    $order->promoCode()->increment('used_count');
                }
            });

            // Send order confirmation email
            Mail::to($order->user->email)->send(new OrderConfirmationMail($order));
        }
    }
}
