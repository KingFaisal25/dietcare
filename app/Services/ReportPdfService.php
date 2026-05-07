<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;

class ReportPdfService
{
    /**
     * Generate PDF report using DomPDF
     * 
     * @param array $data Data for the report
     * @return \Barryvdh\DomPDF\PDF
     */
    public function generateReport(array $data)
    {
        // Load view 'pdf.report' and pass data
        $pdf = Pdf::loadView('pdf.report', $data);

        // Optional: set paper size and orientation
        $pdf->setPaper('A4', 'portrait');

        return $pdf;
    }
}
