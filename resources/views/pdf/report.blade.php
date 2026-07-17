<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Progress Diet</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #16a34a; /* Tailwind Green 600 */
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #16a34a;
            margin: 0;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0 0;
            color: #666;
            font-size: 14px;
        }
        .info-section {
            margin-bottom: 20px;
            width: 100%;
        }
        .info-table {
            width: 100%;
            border: none;
        }
        .info-table td {
            padding: 5px;
            font-size: 14px;
        }
        .info-label {
            font-weight: bold;
            width: 150px;
        }
        .summary-cards {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: separate;
            border-spacing: 10px 0;
        }
        .summary-card {
            background-color: #f0fdf4; /* Tailwind Green 50 */
            border: 1px solid #bbf7d0; /* Tailwind Green 200 */
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            width: 33.33%;
        }
        .summary-card h3 {
            margin: 0;
            font-size: 12px;
            color: #166534; /* Tailwind Green 800 */
            text-transform: uppercase;
        }
        .summary-card p {
            margin: 5px 0 0;
            font-size: 20px;
            font-weight: bold;
            color: #15803d; /* Tailwind Green 700 */
        }
        .section-title {
            color: #16a34a;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
            font-size: 16px;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 12px;
        }
        .data-table th, .data-table td {
            border: 1px solid #e5e7eb;
            padding: 8px;
            text-align: left;
        }
        .data-table th {
            background-color: #16a34a;
            color: white;
            font-weight: bold;
        }
        .data-table tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
        }
        .signature-section {
            margin-top: 50px;
            width: 100%;
        }
        .signature-box {
            float: right;
            width: 250px;
            text-align: center;
        }
        .signature-line {
            border-top: 1px solid #333;
            margin-top: 60px;
            padding-top: 5px;
            font-weight: bold;
        }
        .clearfix::after {
            content: "";
            clear: both;
            display: table;
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>DietCare</h1>
        <p>Laporan Progress Diet Klien</p>
    </div>

    <div class="info-section">
        <table class="info-table">
            <tr>
                <td class="info-label">Nama Klien:</td>
                <td>{{ $client_name }}</td>
                <td class="info-label">Periode Laporan:</td>
                <td>{{ $period }} Hari</td>
            </tr>
            <tr>
                <td class="info-label">Ahli Gizi:</td>
                <td>{{ $nutritionist_name }}</td>
                <td class="info-label">Tanggal Program:</td>
                <td>{{ $program_date }}</td>
            </tr>
        </table>
    </div>

    <table class="summary-cards">
        <tr>
            <td class="summary-card">
                <h3>Total Penurunan</h3>
                <p>{{ $summary['total_weight_loss'] }} kg</p>
            </td>
            <td class="summary-card">
                <h3>Rata-rata Kalori</h3>
                <p>{{ $summary['avg_calories'] }} kcal</p>
            </td>
            <td class="summary-card">
                <h3>Kepatuhan Diet</h3>
                <p>{{ $summary['diet_compliance'] }}%</p>
            </td>
        </tr>
    </table>

    <h2 class="section-title">Perubahan Ukuran Tubuh</h2>
    <table class="data-table">
        <thead>
            <tr>
                <th>Bagian Tubuh</th>
                <th class="text-center">Awal (cm)</th>
                <th class="text-center">Sekarang (cm)</th>
                <th class="text-center">Selisih</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Lingkar Pinggang</td>
                <td class="text-center">{{ $body_measurements['waist']['initial'] }}</td>
                <td class="text-center">{{ $body_measurements['waist']['current'] }}</td>
                <td class="text-center">{{ $body_measurements['waist']['diff'] }} cm</td>
            </tr>
            <tr>
                <td>Lingkar Pinggul</td>
                <td class="text-center">{{ $body_measurements['hips']['initial'] }}</td>
                <td class="text-center">{{ $body_measurements['hips']['current'] }}</td>
                <td class="text-center">{{ $body_measurements['hips']['diff'] }} cm</td>
            </tr>
            <tr>
                <td>Lingkar Lengan</td>
                <td class="text-center">{{ $body_measurements['arms']['initial'] }}</td>
                <td class="text-center">{{ $body_measurements['arms']['current'] }}</td>
                <td class="text-center">{{ $body_measurements['arms']['diff'] }} cm</td>
            </tr>
            <tr>
                <td>Lingkar Paha</td>
                <td class="text-center">{{ $body_measurements['thighs']['initial'] }}</td>
                <td class="text-center">{{ $body_measurements['thighs']['current'] }}</td>
                <td class="text-center">{{ $body_measurements['thighs']['diff'] }} cm</td>
            </tr>
        </tbody>
    </table>

    <h2 class="section-title">Catatan Harian Lengkap</h2>
    <table class="data-table">
        <thead>
            <tr>
                <th>Tanggal</th>
                <th class="text-center">Berat (kg)</th>
                <th class="text-center">Kalori (kcal)</th>
                <th class="text-center">Protein (g)</th>
                <th class="text-center">Karbo (g)</th>
                <th class="text-center">Lemak (g)</th>
                <th class="text-center">Air (L)</th>
                <th class="text-center">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($daily_data as $data)
            <tr>
                <td>{{ $data['date'] }}</td>
                <td class="text-center">{{ $data['weight'] }}</td>
                <td class="text-center">{{ $data['calories'] }}</td>
                <td class="text-center">{{ $data['protein'] }}</td>
                <td class="text-center">{{ $data['carbs'] }}</td>
                <td class="text-center">{{ $data['fat'] }}</td>
                <td class="text-center">{{ $data['water'] }}</td>
                <td class="text-center">{{ $data['status'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="signature-section clearfix">
        <div class="signature-box">
            <p>Jakarta, {{ now()->format('d F Y') }}</p>
            <br><br><br>
            <div class="signature-line">{{ $nutritionist_name }}</div>
            <p style="margin-top: 5px; font-size: 12px; color: #666;">Ahli Gizi</p>
        </div>
    </div>

</body>
</html>
