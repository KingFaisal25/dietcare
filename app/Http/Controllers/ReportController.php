<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\ApiResponse;
use App\Services\ReportPdfService;

class ReportController extends Controller
{
    use ApiResponse;

    protected $pdfService;

    public function __construct(ReportPdfService $pdfService)
    {
        $this->pdfService = $pdfService;
    }

    /**
     * GET /api/client/report
     * Return report data as JSON
     */
    public function getReport(Request $request)
    {
        $period = $request->query('period', 30);
        $user = $request->user();

        // Di skenario nyata, kita akan query dari DB berdasarkan periode
        // Contoh data dummy untuk memenuhi kebutuhan frontend
        
        $data = [
            'period' => $period,
            'summary' => [
                'total_weight_loss' => 5.5,
                'avg_calories' => 1850,
                'diet_compliance' => 88,
            ],
            'daily_data' => [
                [
                    'date' => '2026-03-20',
                    'weight' => 79.5,
                    'calories' => 1850,
                    'protein' => 120,
                    'carbs' => 150,
                    'fat' => 55,
                    'water' => 2.5,
                    'status' => 'Sesuai'
                ],
                // ... dummy data ...
            ],
            'body_measurements' => [
                'waist' => ['initial' => 90, 'current' => 82, 'diff' => -8],
                'hips' => ['initial' => 105, 'current' => 98, 'diff' => -7],
                'arms' => ['initial' => 32, 'current' => 29, 'diff' => -3],
                'thighs' => ['initial' => 60, 'current' => 55, 'diff' => -5],
            ],
            'notes' => [
                [
                    'date' => '2026-03-20',
                    'nutritionist' => 'Dr. ',
                    'note' => 'Progress sangat bagus. Penurunan berat badan stabil dan lingkar pinggang mengecil signifikan.'
                ]
            ]
        ];

        return $this->success('Report data retrieved successfully.', $data);
    }

    /**
     * GET /api/client/report/pdf
     * Generate and return PDF file
     */
    public function downloadPdf(Request $request)
    {
        $period = $request->query('period', 30);
        $user = $request->user();

        // Dalam prakteknya, kita ambil data asli dari DB
        $reportData = [
            'client_name' => $user->name ?? 'Klien',
            'nutritionist_name' => 'Dr. ',
            'program_date' => now()->subDays($period)->format('d M Y') . ' - ' . now()->format('d M Y'),
            'period' => $period,
            'summary' => [
                'total_weight_loss' => 5.5,
                'avg_calories' => 1850,
                'diet_compliance' => 88,
            ],
            'body_measurements' => [
                'waist' => ['initial' => 90, 'current' => 82, 'diff' => -8],
                'hips' => ['initial' => 105, 'current' => 98, 'diff' => -7],
                'arms' => ['initial' => 32, 'current' => 29, 'diff' => -3],
                'thighs' => ['initial' => 60, 'current' => 55, 'diff' => -5],
            ],
            'daily_data' => [
                [
                    'date' => '2026-03-20',
                    'weight' => 79.5,
                    'calories' => 1850,
                    'protein' => 120,
                    'carbs' => 150,
                    'fat' => 55,
                    'water' => 2.5,
                    'status' => 'Sesuai'
                ],
                [
                    'date' => '2026-03-19',
                    'weight' => 80.0,
                    'calories' => 1900,
                    'protein' => 120,
                    'carbs' => 150,
                    'fat' => 55,
                    'water' => 2.5,
                    'status' => 'Sesuai'
                ],
            ],
        ];

        $pdf = $this->pdfService->generateReport($reportData);

        return $pdf->download('Laporan_Progress_DietCare.pdf');
    }
}
