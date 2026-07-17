<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogContentSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::role('admin')->first();
        $nutritionist = User::role('nutritionist')->first();
        $authorId = $nutritionist?->id ?? $admin?->id ?? User::query()->value('id');

        if (!$authorId) {
            $this->command?->warn('BlogContentSeeder dilewati: belum ada user untuk author.');
            return;
        }

        $articles = [
            ['title' => 'Cara Memulai Diet Sehat Tanpa Merasa Tersiksa', 'category' => 'Diet & Penurunan BB', 'intro' => 'Diet yang bertahan lama dimulai dari perubahan kecil yang realistis, bukan larangan makan yang ekstrem.', 'tips' => ['Tetapkan satu kebiasaan utama selama tujuh hari.', 'Isi setengah piring dengan sayur dan buah.', 'Siapkan camilan sederhana agar tidak mudah lapar.', 'Evaluasi energi dan rasa lapar, bukan hanya angka timbangan.']],
            ['title' => 'Mengenal Kalori dan Mengapa Kebutuhan Setiap Orang Berbeda', 'category' => 'Gizi & Nutrisi', 'intro' => 'Kalori adalah satuan energi, sedangkan kebutuhan kalori dipengaruhi usia, ukuran tubuh, aktivitas, dan tujuan.', 'tips' => ['Gunakan angka sebagai panduan, bukan aturan kaku.', 'Perhatikan kualitas makanan selain jumlah kalori.', 'Sesuaikan porsi dengan tingkat aktivitas harian.', 'Pantau perubahan selama beberapa minggu sebelum mengambil kesimpulan.']],
            ['title' => 'Panduan Porsi Makan Seimbang dengan Metode Isi Piringku', 'category' => 'Pola Makan', 'intro' => 'Metode isi piring membantu menyusun menu seimbang tanpa perlu menimbang semua makanan.', 'tips' => ['Isi setengah piring dengan sayur dan buah.', 'Sediakan sumber protein pada setiap makan utama.', 'Pilih karbohidrat secukupnya sesuai aktivitas.', 'Gunakan air putih sebagai minuman utama.']],
            ['title' => 'Protein Harian: Sumber, Porsi, dan Waktu Konsumsi', 'category' => 'Gizi & Nutrisi', 'intro' => 'Protein membantu pemeliharaan otot, rasa kenyang, dan pemulihan tubuh.', 'tips' => ['Variasikan telur, ikan, ayam, tempe, tahu, dan kacang-kacangan.', 'Tambahkan protein pada sarapan.', 'Sebarkan asupan protein di beberapa waktu makan.', 'Pilih cara masak yang tidak menambah banyak minyak.']],
            ['title' => 'Karbohidrat Tidak Harus Dihindari Saat Diet', 'category' => 'Diet & Penurunan BB', 'intro' => 'Karbohidrat merupakan sumber energi penting dan dapat menjadi bagian dari pola makan untuk menurunkan berat badan.', 'tips' => ['Pilih nasi, kentang, ubi, oat, atau jagung sesuai kebutuhan.', 'Padukan karbohidrat dengan protein dan sayur.', 'Atur porsi, bukan menghapus seluruh kelompok makanan.', 'Utamakan makanan minim proses.']],
            ['title' => 'Lemak Sehat dan Cara Memasukkannya ke Menu Harian', 'category' => 'Gizi & Nutrisi', 'intro' => 'Tubuh tetap membutuhkan lemak untuk fungsi hormon, sel, dan penyerapan vitamin tertentu.', 'tips' => ['Pilih ikan, alpukat, kacang, dan biji-bijian.', 'Gunakan minyak secukupnya saat memasak.', 'Batasi gorengan yang dikonsumsi terlalu sering.', 'Perhatikan porsi karena lemak padat energi.']],
            ['title' => 'Berapa Banyak Air yang Perlu Diminum Setiap Hari?', 'category' => 'Hidrasi', 'intro' => 'Kebutuhan cairan dipengaruhi cuaca, aktivitas, makanan, dan kondisi tubuh.', 'tips' => ['Bawa botol minum agar lebih mudah memantau asupan.', 'Minum secara berkala, jangan menunggu sangat haus.', 'Tambah cairan saat berkeringat lebih banyak.', 'Perhatikan warna urine sebagai salah satu petunjuk hidrasi.']],
            ['title' => 'Ide Sarapan Sehat yang Praktis untuk Hari Sibuk', 'category' => 'Resep Sehat', 'intro' => 'Sarapan tidak harus rumit. Kombinasi karbohidrat, protein, dan serat dapat dibuat dalam waktu singkat.', 'tips' => ['Coba oat dengan buah dan telur di sisi lain.', 'Gunakan roti gandum dengan telur atau tempe.', 'Siapkan bahan sejak malam sebelumnya.', 'Hindari sarapan yang hanya berisi minuman manis.']],
            ['title' => 'Camilan Sehat untuk Membantu Mengontrol Rasa Lapar', 'category' => 'Pola Makan', 'intro' => 'Camilan yang tepat dapat membantu menjaga energi dan mencegah makan berlebihan pada waktu berikutnya.', 'tips' => ['Pilih buah, yogurt, kacang, atau telur rebus.', 'Gabungkan protein dan serat agar lebih mengenyangkan.', 'Siapkan porsi kecil sebelum mulai makan.', 'Bedakan lapar fisik dengan keinginan makan karena bosan.']],
            ['title' => 'Cara Membaca Label Gizi pada Kemasan Makanan', 'category' => 'Edukasi Gizi', 'intro' => 'Label gizi membantu membandingkan produk dan memahami kandungan per sajian.', 'tips' => ['Periksa ukuran sajian terlebih dahulu.', 'Bandingkan gula, natrium, lemak jenuh, dan protein.', 'Jangan hanya terpaku pada klaim bagian depan kemasan.', 'Pilih produk dengan daftar bahan yang lebih sederhana.']],
            ['title' => 'Tidur dan Berat Badan: Hubungan yang Sering Diabaikan', 'category' => 'Gaya Hidup Sehat', 'intro' => 'Tidur yang cukup mendukung pengaturan energi, mood, dan konsistensi kebiasaan makan.', 'tips' => ['Buat jam tidur dan bangun yang relatif konsisten.', 'Kurangi layar menjelang waktu tidur.', 'Hindari kafein terlalu dekat dengan jam tidur.', 'Jadikan kamar lebih gelap, tenang, dan nyaman.']],
            ['title' => 'Olahraga Ringan untuk Pemula yang Ingin Lebih Aktif', 'category' => 'Aktivitas Fisik', 'intro' => 'Aktivitas ringan yang dilakukan konsisten sering lebih mudah dipertahankan daripada latihan berat yang jarang dilakukan.', 'tips' => ['Mulai dengan jalan kaki 10–20 menit.', 'Tambahkan peregangan sederhana.', 'Gunakan tangga jika tubuh terasa siap.', 'Naikkan durasi secara bertahap sesuai kemampuan.']],
            ['title' => 'Meal Prep Sederhana untuk Menghemat Waktu dan Biaya', 'category' => 'Diet Hemat', 'intro' => 'Meal prep membantu membuat pilihan makan lebih terencana saat jadwal sedang padat.', 'tips' => ['Buat daftar menu tiga hari.', 'Masak satu sumber protein dan dua jenis sayur.', 'Simpan makanan dalam porsi siap makan.', 'Gunakan bahan lokal yang sedang mudah ditemukan.']],
            ['title' => 'Diet Hemat: Makan Bergizi dengan Bujet Terbatas', 'category' => 'Diet Hemat', 'intro' => 'Pola makan sehat tetap bisa dilakukan dengan memilih bahan sederhana dan mengatur belanja.', 'tips' => ['Prioritaskan telur, tempe, tahu, sayur, dan buah musiman.', 'Bandingkan harga per porsi, bukan hanya harga kemasan.', 'Kurangi minuman manis dan makanan ultra-proses.', 'Masak lebih banyak di rumah jika memungkinkan.']],
            ['title' => 'Cara Menetapkan Target Berat Badan yang Realistis', 'category' => 'Diet & Penurunan BB', 'intro' => 'Target yang realistis membantu menjaga motivasi dan mengurangi dorongan melakukan diet ekstrem.', 'tips' => ['Fokus pada kebiasaan yang dapat diulang.', 'Gunakan rentang target, bukan angka tunggal.', 'Pantau lingkar pinggang, energi, dan kebugaran.', 'Konsultasikan target khusus dengan tenaga kesehatan.']],
            ['title' => 'Mengapa Berat Badan Bisa Naik Turun dari Hari ke Hari?', 'category' => 'Edukasi Gizi', 'intro' => 'Perubahan angka timbangan harian dapat dipengaruhi cairan, garam, isi pencernaan, dan siklus tubuh.', 'tips' => ['Timbang pada waktu dan kondisi yang konsisten.', 'Lihat tren mingguan, bukan satu angka.', 'Tetap makan dan minum secara teratur.', 'Jangan mengambil keputusan ekstrem karena perubahan satu hari.']],
            ['title' => 'Mitos Diet yang Sering Membuat Pemula Bingung', 'category' => 'Edukasi Gizi', 'intro' => 'Banyak aturan diet populer terdengar sederhana, tetapi belum tentu sesuai untuk semua orang.', 'tips' => ['Tidak ada satu menu yang cocok untuk semua orang.', 'Makan malam tidak otomatis menyebabkan kenaikan berat badan.', 'Karbohidrat tidak harus dihapus total.', 'Hasil sehat membutuhkan waktu dan konsistensi.']],
            ['title' => 'Panduan Memilih Minuman yang Lebih Ramah untuk Diet', 'category' => 'Pola Makan', 'intro' => 'Minuman sering menyumbang kalori tanpa membuat kenyang sehingga layak diperhatikan saat mengatur pola makan.', 'tips' => ['Utamakan air putih.', 'Batasi gula tambahan dalam kopi dan teh.', 'Periksa ukuran minuman kemasan.', 'Pilih buah utuh dibanding jus manis.']],
            ['title' => 'Serat untuk Pencernaan dan Rasa Kenyang Lebih Lama', 'category' => 'Gizi & Nutrisi', 'intro' => 'Serat dari sayur, buah, kacang, dan biji-bijian mendukung pencernaan dan membantu pola makan lebih seimbang.', 'tips' => ['Tambah sayur secara bertahap.', 'Pilih buah utuh dengan kulit yang bisa dimakan.', 'Coba nasi merah, oat, atau ubi.', 'Naikkan asupan air saat menambah serat.']],
            ['title' => 'Menu Sehat Setelah Olahraga untuk Pemulihan Tubuh', 'category' => 'Aktivitas Fisik', 'intro' => 'Makan setelah olahraga dapat membantu memenuhi kembali energi dan mendukung pemulihan otot.', 'tips' => ['Gabungkan protein dan karbohidrat.', 'Minum cukup setelah berkeringat.', 'Pilih makanan yang mudah dicerna.', 'Sesuaikan porsi dengan durasi dan intensitas olahraga.']],
            ['title' => 'Cara Menjaga Pola Makan Saat Makan di Luar Rumah', 'category' => 'Gaya Hidup Sehat', 'intro' => 'Makan di luar tetap bisa menjadi bagian dari pola makan seimbang dengan sedikit perencanaan.', 'tips' => ['Lihat pilihan menu sebelum memesan.', 'Tambahkan sayur atau protein.', 'Pilih minuman tanpa gula tambahan.', 'Nikmati makanan tanpa rasa bersalah dan kembali ke rutinitas berikutnya.']],
            ['title' => 'Kapan Sebaiknya Berkonsultasi dengan Ahli Gizi?', 'category' => 'Konsultasi Gizi', 'intro' => 'Bantuan profesional bermanfaat ketika kamu membutuhkan panduan yang lebih personal atau memiliki kondisi kesehatan tertentu.', 'tips' => ['Bawa catatan pola makan dan keluhan.', 'Sampaikan tujuan secara jujur.', 'Tanyakan alasan di balik setiap rekomendasi.', 'Jangan mengubah obat atau terapi tanpa arahan tenaga kesehatan.']],
            ['title' => 'Pola Makan Seimbang untuk Menjaga Energi Sepanjang Hari', 'category' => 'Gaya Hidup Sehat', 'intro' => 'Energi yang stabil lebih mudah dicapai dengan jadwal makan, komposisi menu, dan tidur yang cukup.', 'tips' => ['Jangan melewatkan makan hingga sangat lapar.', 'Sertakan protein dan serat.', 'Pilih karbohidrat sesuai aktivitas.', 'Berikan jeda untuk minum dan bergerak.']],
        ];

        foreach ($articles as $index => $article) {
            $slug = Str::slug($article['title']);
            $content = $article['intro'] . "\n\n## Langkah yang bisa dicoba\n\n" . collect($article['tips'])->map(fn ($tip, $i) => ($i + 1) . '. ' . $tip)->implode("\n\n") . "\n\n## Catatan penting\n\nKebutuhan setiap orang dapat berbeda. Gunakan informasi ini sebagai edukasi umum dan pertimbangkan konsultasi dengan ahli gizi atau tenaga kesehatan untuk kondisi yang lebih spesifik.";
            $date = now()->subDays(count($articles) - $index);

            BlogPost::updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $article['title'],
                    'content' => $content,
                    'category' => $article['category'],
                    'author_id' => $authorId,
                    'status' => 'published',
                    'published_at' => $date,
                ]
            );
        }

        $this->command?->info('Blog content seeded: ' . count($articles) . ' artikel.');
    }
}
