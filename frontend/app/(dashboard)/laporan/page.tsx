"use client";

import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { Download, Calendar, Activity, Utensils, Award, FileText } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function LaporanPage() {
  const [period, setPeriod] = useState("30");

  const handleExportPDF = () => {
    // Ideally this will use the backend API:
    // window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/client/report/pdf?period=${period}`, '_blank');
    alert(`Mendownload PDF untuk periode ${period} hari... (Koneksi ke backend diperlukan)`);
  };

  // Mock data for summary cards
  const summary = {
    totalWeightLoss: 5.5,
    avgCalories: 1850,
    dietCompliance: 88,
  };

  // Mock data for Weight Chart
  const weightChartData = {
    labels: Array.from({ length: 10 }, (_, i) => `Tgl ${i + 1}`),
    datasets: [
      {
        label: "Berat Aktual (kg)",
        data: [85, 84.5, 84, 83.2, 82.5, 82, 81.5, 80.8, 80, 79.5],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  // Mock data for Calorie Chart
  const targetCalorie = 2000;
  const calories = [1900, 2100, 1850, 1950, 2200, 1800, 2050, 1900, 1850, 1950];
  const calorieChartData = {
    labels: Array.from({ length: 10 }, (_, i) => `Tgl ${i + 1}`),
    datasets: [
      {
        label: "Kalori Harian (kcal)",
        data: calories,
        backgroundColor: calories.map(cal => cal > targetCalorie ? "rgba(239, 68, 68, 0.8)" : "rgba(34, 197, 94, 0.8)"),
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
    },
  };

  // Mock daily table data
  const dailyData = Array.from({ length: 5 }, (_, i) => ({
    date: `2026-03-${20 - i}`,
    weight: 79.5 + (i * 0.5),
    calories: 1850 + (i * 50),
    protein: 120,
    carbs: 150,
    fat: 55,
    water: 2.5,
    status: i % 3 === 0 ? "Sesuai" : "Kurang Tepat",
  }));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Lengkap</h1>
          <p className="text-gray-500">Ringkasan perjalanan diet dan konsultasi Anda</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
            <Calendar size={18} className="text-gray-500" />
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-gray-700 font-medium cursor-pointer"
            >
              <option value="7">7 Hari Terakhir</option>
              <option value="30">30 Hari Terakhir</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <button
            onClick={handleExportPDF}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <Download size={18} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
            <Activity size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Penurunan BB</p>
            <p className="text-3xl font-bold text-gray-900">{summary.totalWeightLoss} <span className="text-lg font-normal text-gray-500">kg</span></p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
            <Utensils size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Rata-rata Kalori/Hari</p>
            <p className="text-3xl font-bold text-gray-900">{summary.avgCalories} <span className="text-lg font-normal text-gray-500">kcal</span></p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-100 text-green-600 rounded-full">
            <Award size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Kepatuhan Diet</p>
            <p className="text-3xl font-bold text-gray-900">{summary.dietCompliance}%</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Grafik Berat Badan</h2>
          <div className="h-[300px] w-full">
            <Line data={weightChartData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Grafik Kalori Harian</h2>
          <div className="h-[300px] w-full">
            <Bar data={calorieChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Daily Full Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Catatan Harian Lengkap</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-4 font-medium">Tanggal</th>
                <th className="p-4 font-medium">Berat (kg)</th>
                <th className="p-4 font-medium">Kalori (kcal)</th>
                <th className="p-4 font-medium">Protein (g)</th>
                <th className="p-4 font-medium">Karbo (g)</th>
                <th className="p-4 font-medium">Lemak (g)</th>
                <th className="p-4 font-medium">Air (L)</th>
                <th className="p-4 font-medium">Status Meal Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dailyData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-4 text-gray-900 font-medium">{row.date}</td>
                  <td className="p-4 text-gray-600">{row.weight}</td>
                  <td className={`p-4 font-medium ${row.calories > targetCalorie ? 'text-red-600' : 'text-green-600'}`}>
                    {row.calories}
                  </td>
                  <td className="p-4 text-gray-600">{row.protein}</td>
                  <td className="p-4 text-gray-600">{row.carbs}</td>
                  <td className="p-4 text-gray-600">{row.fat}</td>
                  <td className="p-4 text-gray-600">{row.water}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                      row.status === 'Sesuai' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Body Measurements & Notes Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Body Measurements */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Perubahan Ukuran Tubuh</h2>
          </div>
          <div className="p-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-500 text-sm border-b border-gray-200">
                  <th className="pb-3 font-medium">Bagian Tubuh</th>
                  <th className="pb-3 font-medium">Awal (cm)</th>
                  <th className="pb-3 font-medium">Sekarang (cm)</th>
                  <th className="pb-3 font-medium">Selisih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-4 text-gray-900">Lingkar Pinggang</td>
                  <td className="py-4 text-gray-600">90</td>
                  <td className="py-4 text-gray-600">82</td>
                  <td className="py-4 text-green-600 font-medium">-8 cm</td>
                </tr>
                <tr>
                  <td className="py-4 text-gray-900">Lingkar Pinggul</td>
                  <td className="py-4 text-gray-600">105</td>
                  <td className="py-4 text-gray-600">98</td>
                  <td className="py-4 text-green-600 font-medium">-7 cm</td>
                </tr>
                <tr>
                  <td className="py-4 text-gray-900">Lingkar Lengan</td>
                  <td className="py-4 text-gray-600">32</td>
                  <td className="py-4 text-gray-600">29</td>
                  <td className="py-4 text-green-600 font-medium">-3 cm</td>
                </tr>
                <tr>
                  <td className="py-4 text-gray-900">Lingkar Paha</td>
                  <td className="py-4 text-gray-600">60</td>
                  <td className="py-4 text-gray-600">55</td>
                  <td className="py-4 text-green-600 font-medium">-5 cm</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes & History */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-gray-200 flex items-center gap-2">
            <FileText size={20} className="text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Catatan Ahli Gizi & Riwayat</h2>
          </div>
          <div className="p-6 flex-1 space-y-6">
            <div className="relative pl-6 border-l-2 border-green-200 space-y-6">
              <div className="relative">
                <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-green-500 border-4 border-white"></div>
                <p className="text-sm text-gray-500 mb-1">20 Mar 2026 - Konsultasi Minggu 2</p>
                <div className="bg-green-50 rounded-lg p-4 text-sm text-gray-800 border border-green-100">
                  <p className="font-semibold mb-1 text-green-800">Ahli Gizi: Dr. </p>
                  &ldquo;Progress sangat bagus. Penurunan berat badan stabil dan lingkar pinggang mengecil signifikan. Teruskan konsumsi protein tinggi, namun perhatikan asupan natrium agar tidak menahan cairan (water retention).&rdquo;
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-gray-300 border-4 border-white"></div>
                <p className="text-sm text-gray-500 mb-1">05 Mar 2026 - Konsultasi Awal</p>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 border border-gray-100">
                  <p className="font-semibold mb-1 text-gray-700">Ahli Gizi: Dr. </p>
                  &ldquo;Memulai program defisit kalori (1800 kcal). Fokus pada pengurangan karbohidrat sederhana dan perbanyak serat dari sayuran hijau. Target penurunan 1kg per minggu.&rdquo;
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
