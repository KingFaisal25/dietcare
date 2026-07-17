<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use App\Models\Order;
use App\Models\NutritionistProgram;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $admin       = User::role('admin')->first();
        $nutritionist = User::role('nutritionist')->first();
        $patient     = User::role('patient')->first();
        $programs    = DB::table('programs')->get();

        // ── 1. Blog Posts ────────────────────────────────────────────────
        $blogs = [
            [
                'title'        => '5 Tips Diet Sehat yang Efektif untuk Pemula',
                'slug'         => '5-tips-diet-sehat-pemula-' . \Illuminate\Support\Str::random(5),
                'content'      => "Diet sehat bukan tentang mengurangi makan secara drastis, melainkan tentang memilih makanan yang tepat dan bergizi.\n\n**1. Perbanyak Konsumsi Sayuran dan Buah**\nSayuran dan buah kaya akan serat, vitamin, dan mineral yang dibutuhkan tubuh.\n\n**2. Kurangi Makanan Olahan**\nHindari makanan tinggi gula tambahan, garam berlebih, dan lemak jenuh.\n\n**3. Minum Air yang Cukup**\nMinimal 8 gelas air putih per hari untuk menjaga metabolisme.\n\n**4. Olahraga Teratur**\nCombine diet sehat dengan aktivitas fisik minimal 30 menit per hari.\n\n**5. Konsultasikan dengan Ahli Gizi**\nSetiap orang memiliki kebutuhan nutrisi yang berbeda. Konsultasikan program diet Anda.",
                'category'     => 'Diet & Penurunan BB',
                'status'       => 'published',
                'author_id'    => $admin?->id ?? 1,
                'published_at' => now()->subDays(5),
                'created_at'   => now()->subDays(5),
                'updated_at'   => now()->subDays(5),
            ],
            [
                'title'        => 'Mengenal Makronutrien: Protein, Karbohidrat, dan Lemak',
                'slug'         => 'mengenal-makronutrien-' . \Illuminate\Support\Str::random(5),
                'content'      => "Makronutrien adalah zat gizi yang dibutuhkan tubuh dalam jumlah besar. Ada tiga jenis utama makronutrien:\n\n**Protein**\nProtein berperan dalam membangun dan memperbaiki jaringan tubuh. Sumber: daging, ikan, telur, kacang-kacangan.\n\n**Karbohidrat**\nKarbohidrat adalah sumber energi utama tubuh. Pilih karbohidrat kompleks seperti beras merah, oat, dan ubi.\n\n**Lemak**\nLemak sehat penting untuk fungsi hormon dan penyerapan vitamin. Sumber: alpukat, minyak zaitun, ikan salmon.",
                'category'     => 'Gizi & Nutrisi',
                'status'       => 'published',
                'author_id'    => $nutritionist?->id ?? 1,
                'published_at' => now()->subDays(10),
                'created_at'   => now()->subDays(10),
                'updated_at'   => now()->subDays(10),
            ],
            [
                'title'        => 'Panduan Gizi untuk Ibu Hamil Trimester Pertama',
                'slug'         => 'gizi-ibu-hamil-trimester-1-' . \Illuminate\Support\Str::random(5),
                'content'      => "Trimester pertama kehamilan adalah periode kritis perkembangan janin. Nutrisi yang tepat sangat penting.\n\n**Asam Folat**\nKonsumsi 400-800 mcg asam folat per hari untuk mencegah cacat saraf janin.\n\n**Zat Besi**\nZat besi penting untuk mencegah anemia. Konsumsi bayam, daging merah, dan kacang-kacangan.\n\n**Kalsium**\nKalsium mendukung perkembangan tulang bayi. Sumber: susu, yogurt, ikan teri.\n\nKonsultasikan dengan dokter atau ahli gizi untuk program nutrisi yang tepat.",
                'category'     => 'Kesehatan Ibu Hamil',
                'status'       => 'published',
                'author_id'    => $nutritionist?->id ?? 1,
                'published_at' => now()->subDays(15),
                'created_at'   => now()->subDays(15),
                'updated_at'   => now()->subDays(15),
            ],
            [
                'title'        => 'Draft: Resep Smoothie Protein Tinggi untuk Pemulihan Otot',
                'slug'         => 'resep-smoothie-protein-draft-' . \Illuminate\Support\Str::random(5),
                'content'      => "Smoothie protein adalah cara mudah dan lezat untuk memenuhi kebutuhan protein harian Anda...\n\n[Draft - sedang disusun]",
                'category'     => 'Resep Sehat',
                'status'       => 'draft',
                'author_id'    => $admin?->id ?? 1,
                'published_at' => null,
                'created_at'   => now()->subDays(2),
                'updated_at'   => now()->subDays(2),
            ],
        ];

        foreach ($blogs as $blog) {
            BlogPost::updateOrInsert(
                ['slug' => $blog['slug']],
                $blog
            );
        }

        $this->command?->info('Blog posts seeded: ' . count($blogs));

        // ── 2. Orders ────────────────────────────────────────────────────
        if ($patient && $programs->count() > 0) {
            $program = $programs->first();

            $orders = [
                [
                    'user_id'         => $patient->id,
                    'program_id'      => $program->id,
                    'order_code'      => 'DCS-' . Carbon::now()->format('Ymd') . '-DEMO1',
                    'total_amount'    => $program->price,
                    'discount_amount' => 0,
                    'final_amount'    => $program->price,
                    'status'          => 'paid',
                    'payment_method'  => 'midtrans',
                    'paid_at'         => now()->subDays(3),
                    'created_at'      => now()->subDays(3),
                    'updated_at'      => now()->subDays(3),
                ],
                [
                    'user_id'         => $patient->id,
                    'program_id'      => $programs->skip(1)->first()?->id ?? $program->id,
                    'order_code'      => 'DCS-' . Carbon::now()->format('Ymd') . '-DEMO2',
                    'total_amount'    => 750000,
                    'discount_amount' => 75000,
                    'final_amount'    => 675000,
                    'status'          => 'pending',
                    'payment_method'  => null,
                    'paid_at'         => null,
                    'created_at'      => now()->subDays(1),
                    'updated_at'      => now()->subDays(1),
                ],
            ];

            foreach ($orders as $orderData) {
                Order::updateOrInsert(
                    ['order_code' => $orderData['order_code']],
                    $orderData
                );
            }

            $this->command?->info('Orders seeded: ' . count($orders));

            // ── 3. Nutritionist Program (assign patient to nutritionist) ──
            if ($nutritionist) {
                $paidOrder = Order::where('order_code', 'DCS-' . Carbon::now()->format('Ymd') . '-DEMO1')->first();
                if ($paidOrder) {
                    NutritionistProgram::updateOrInsert(
                        ['order_id' => $paidOrder->id],
                        [
                            'client_id'               => $patient->id,
                            'nutritionist_id'         => $nutritionist->id,
                            'program_id'              => $program->id,
                            'status'                  => 'active',
                            'start_date'              => now()->subDays(3)->toDateString(),
                            'end_date'                => now()->addDays(27)->toDateString(),
                            'remaining_consultations' => 2,
                            'created_at'              => now()->subDays(3),
                            'updated_at'              => now()->subDays(3),
                        ]
                    );
                    $this->command?->info('NutritionistProgram seeded.');
                }
            }
        }

        $this->command?->info('Demo data seeding completed!');
    }
}
