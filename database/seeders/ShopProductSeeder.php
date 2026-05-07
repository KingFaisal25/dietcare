<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ShopProduct;
use Illuminate\Support\Str;

class ShopProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name'        => 'Salad Bowl Protein Tinggi',
                'description' => 'Salad segar dengan campuran ayam panggang, telur rebus, alpukat, dan sayuran hijau. Kaya protein dan serat untuk mendukung program diet sehat Anda.',
                'price'       => 45000,
                'calories'    => 320,
                'protein'     => 28,
                'fat'         => 14,
                'carbs'       => 22,
                'category'    => 'salad',
                'is_healthy'  => true,
                'is_nutritionist_recommended' => true,
                'nutritionist_label' => 'Tinggi Protein',
                'stock'       => 50,
            ],
            [
                'name'        => 'Smoothie Hijau Detox',
                'description' => 'Minuman detox dari bayam, selada, apel hijau, jahe, dan lemon. Membantu membersihkan racun dan meningkatkan energi sepanjang hari.',
                'price'       => 35000,
                'calories'    => 145,
                'protein'     => 4,
                'fat'         => 1,
                'carbs'       => 32,
                'category'    => 'minuman',
                'is_healthy'  => true,
                'is_nutritionist_recommended' => true,
                'nutritionist_label' => 'Detox',
                'stock'       => 80,
            ],
            [
                'name'        => 'Nasi Merah Ayam Panggang',
                'description' => 'Paket makan sehat lengkap: nasi merah, dada ayam panggang rendah lemak, tumis brokoli, dan saus herbal. Sempurna untuk makan siang diet.',
                'price'       => 52000,
                'calories'    => 480,
                'protein'     => 36,
                'fat'         => 12,
                'carbs'       => 55,
                'category'    => 'makanan-utama',
                'is_healthy'  => true,
                'is_nutritionist_recommended' => true,
                'nutritionist_label' => 'Seimbang',
                'stock'       => 40,
            ],
            [
                'name'        => 'Granola Bar Oats',
                'description' => 'Camilan sehat dari oat, madu alami, kacang-kacangan, dan buah kering. Snack terbaik untuk menjaga energi tanpa guilt.',
                'price'       => 25000,
                'calories'    => 210,
                'protein'     => 6,
                'fat'         => 8,
                'carbs'       => 30,
                'category'    => 'snack',
                'is_healthy'  => true,
                'is_nutritionist_recommended' => false,
                'nutritionist_label' => null,
                'stock'       => 120,
            ],
            [
                'name'        => 'Smoothie Bowl Acai',
                'description' => 'Smoothie bowl berbahan buah acai, pisang, beri, granola, dan biji chia. Kaya antioksidan dan sumber energi alami yang sempurna untuk sarapan.',
                'price'       => 55000,
                'calories'    => 380,
                'protein'     => 8,
                'fat'         => 10,
                'carbs'       => 68,
                'category'    => 'sarapan',
                'is_healthy'  => true,
                'is_nutritionist_recommended' => true,
                'nutritionist_label' => 'Antioksidan',
                'stock'       => 60,
            ],
            [
                'name'        => 'Wrap Sayuran Whole Wheat',
                'description' => 'Wrap tortilla gandum utuh berisi hummus, sayuran segar, keju rendah lemak, dan ayam kukus. Pilihan makan siang yang cepat dan bergizi.',
                'price'       => 40000,
                'calories'    => 350,
                'protein'     => 22,
                'fat'         => 9,
                'carbs'       => 42,
                'category'    => 'makanan-utama',
                'is_healthy'  => true,
                'is_nutritionist_recommended' => false,
                'nutritionist_label' => null,
                'stock'       => 45,
            ],
            [
                'name'        => 'Yogurt Parfait Berry',
                'description' => 'Yogurt Greek rendah lemak dengan lapisan granola renyah dan topping buah beri segar. Kaya probiotik untuk kesehatan pencernaan Anda.',
                'price'       => 32000,
                'calories'    => 220,
                'protein'     => 15,
                'fat'         => 4,
                'carbs'       => 35,
                'category'    => 'snack',
                'is_healthy'  => true,
                'is_nutritionist_recommended' => true,
                'nutritionist_label' => 'Probiotik',
                'stock'       => 70,
            ],
            [
                'name'        => 'Sup Krim Brokoli',
                'description' => 'Sup krim hangat dari brokoli segar, wortel, dan kaldu ayam tanpa MSG. Rendah kalori, kaya serat dan vitamin. Cocok untuk program penurunan berat badan.',
                'price'       => 38000,
                'calories'    => 180,
                'protein'     => 9,
                'fat'         => 6,
                'carbs'       => 22,
                'category'    => 'sup',
                'is_healthy'  => true,
                'is_nutritionist_recommended' => true,
                'nutritionist_label' => 'Rendah Kalori',
                'stock'       => 35,
            ],
        ];

        foreach ($products as $p) {
            $slug = Str::slug($p['name']);
            $baseSlug = $slug;
            $counter = 1;
            while (ShopProduct::where('slug', $slug)->exists()) {
                $slug = $baseSlug . '-' . $counter++;
            }
            ShopProduct::updateOrCreate(['slug' => $slug], array_merge($p, ['slug' => $slug]));
        }
    }
}
