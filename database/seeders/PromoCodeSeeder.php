<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PromoCode;
use Carbon\Carbon;

class PromoCodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ([
            [
                'code' => 'WELCOME20',
                'name' => 'Welcome Promo 20%',
                'description' => 'Diskon 20% untuk semua program',
                'discount_type' => 'percent',
                'discount_value' => 20,
                'min_purchase' => 0,
                'max_uses' => 10,
                'valid_until' => Carbon::now()->addMonths(6),
            ],
            [
                'code' => 'NEWMEMBER',
                'name' => 'New Member Discount',
                'description' => 'Potongan Rp 100.000 untuk minimal pembelian Rp 500.000',
                'discount_type' => 'fixed',
                'discount_value' => 100000,
                'min_purchase' => 500000,
                'valid_until' => Carbon::now()->addMonth(),
            ],
            [
                'code' => 'REFERRAL50',
                'name' => 'Referral 50%',
                'description' => 'Diskon 50% hingga Rp 200.000',
                'discount_type' => 'percent',
                'discount_value' => 50,
                'max_discount' => 200000,
                'valid_until' => Carbon::now()->addMonths(3),
            ],
        ] as $promoCode) {
            PromoCode::updateOrCreate(
                ['code' => $promoCode['code']],
                $promoCode
            );
        }
    }
}
