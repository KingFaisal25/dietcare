"use client";

import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Plus, Target, TrendingDown, Clock, Activity } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ProgressPage() {
  const [showForm, setShowForm] = useState(false);

  // Mock data for stat cards
  const stats = {
    initialWeight: 85,
    currentWeight: 79.5,
    targetWeight: 70,
    totalChange: -5.5,
    estimatedWeeks: 12,
  };

  // Mock data for chart
  const chartData = {
    labels: Array.from({ length: 30 }, (_, i) => `Hari ${i + 1}`),
    datasets: [
      {
        label: "Berat Aktual (kg)",
        data: Array.from({ length: 20 }, (_, i) => 85 - i * 0.25 - Math.random() * 0.5), // Mock progress up to day 20
        borderColor: "rgb(59, 130, 246)", // Blue
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Target Berat (kg)",
        data: Array.from({ length: 30 }, (_, i) => 85 - ((85 - 70) / 90) * i), // Linear target
        borderColor: "rgb(239, 68, 68)", // Red
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
      }
    },
    scales: {
      y: {
        min: 65,
        max: 90,
      }
    }
  };

  // Mock data for weekly table
  const weeklyData = [
    { week: 1, start: 85, end: 83.5, change: -1.5, compliance: 90, status: "Sangat Baik" },
    { week: 2, start: 83.5, end: 82.2, change: -1.3, compliance: 85, status: "Baik" },
    { week: 3, start: 82.2, end: 80.5, change: -1.7, compliance: 95, status: "Sangat Baik" },
    { week: 4, start: 80.5, end: 79.5, change: -1.0, compliance: 75, status: "Cukup" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress Tracker</h1>
          <p className="text-gray-500">Pantau perkembangan berat badan dan ukuran tubuhmu</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          <span>Input Data Hari Ini</span>
        </button>
      </div>

      {/* Input Form Section */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-semibold mb-4">Input Data Harian</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Berat Badan (kg) *</label>
                <input type="number" step="0.1" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="Contoh: 75.5" required />
              </div>
              
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">Ukuran Tubuh (Opsional, cm)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Lingkar Pinggang</label>
                    <input type="number" step="0.1" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Lingkar Pinggul</label>
                    <input type="number" step="0.1" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Lingkar Lengan</label>
                    <input type="number" step="0.1" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Lingkar Paha</label>
                    <input type="number" step="0.1" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Batal</button>
              <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">Simpan Data</button>
            </div>
          </form>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Berat Awal</p>
            <p className="text-2xl font-bold text-gray-900">{stats.initialWeight} <span className="text-sm font-normal text-gray-500">kg</span></p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Berat Sekarang</p>
            <p className="text-2xl font-bold text-gray-900">{stats.currentWeight} <span className="text-sm font-normal text-gray-500">kg</span></p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <Target size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Penurunan</p>
            <p className="text-2xl font-bold text-gray-900">{Math.abs(stats.totalChange)} <span className="text-sm font-normal text-gray-500">kg</span></p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Estimasi Capai Target</p>
            <p className="text-2xl font-bold text-gray-900">{stats.estimatedWeeks} <span className="text-sm font-normal text-gray-500">minggu</span></p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Grafik Berat Badan (30 Hari Terakhir)</h2>
        <div className="h-[400px] w-full">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Weekly Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Rekap Mingguan</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-4 font-medium">Minggu Ke-</th>
                <th className="p-4 font-medium">Berat Awal (kg)</th>
                <th className="p-4 font-medium">Berat Akhir (kg)</th>
                <th className="p-4 font-medium">Perubahan (kg)</th>
                <th className="p-4 font-medium">Kepatuhan Diet</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {weeklyData.map((row) => (
                <tr key={row.week} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-900 font-medium">Minggu {row.week}</td>
                  <td className="p-4 text-gray-600">{row.start}</td>
                  <td className="p-4 text-gray-600">{row.end}</td>
                  <td className="p-4">
                    <span className="text-green-600 font-medium">{row.change}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                        <div 
                          className={`h-2 rounded-full ${row.compliance >= 90 ? 'bg-green-500' : row.compliance >= 80 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                          style={{ width: `${row.compliance}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{row.compliance}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                      row.status === 'Sangat Baik' ? 'bg-green-100 text-green-700' :
                      row.status === 'Baik' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
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
    </div>
  );
}
