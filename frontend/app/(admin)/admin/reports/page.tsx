'use client';

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { FiDownload, FiTrendingUp, FiShoppingBag, FiUsers, FiRefreshCw, FiLoader } from 'react-icons/fi';
import api from '@/lib/api';
import { toast } from 'sonner';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, Filler, ArcElement
);

const formatRupiah = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

interface DashboardStats {
  revenue_this_month: number;
  growth_percent: number;
  active_clients: number;
  today_transactions: { count: number; amount: number };
  active_nutritionists: number;
}

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [period, setPeriod] = useState('monthly');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, revenueRes, txRes] = await Promise.allSettled([
        api.get('/admin/dashboard/stats'),
        api.get(`/admin/dashboard/revenue-chart?period=${period}`),
        api.get('/admin/dashboard/recent-transactions'),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (revenueRes.status === 'fulfilled') {
        const cd = revenueRes.value.data;
        setRevenueData({
          labels: cd.labels || [],
          datasets: [{
            label: 'Pendapatan (Rp)',
            data: cd.data || [],
            borderColor: '#16a34a',
            backgroundColor: 'rgba(22,163,74,0.07)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 5,
            pointBackgroundColor: '#fff',
            pointBorderWidth: 2,
            pointBorderColor: '#16a34a',
          }],
        });
      }
      if (txRes.status === 'fulfilled') setTransactions(txRes.value.data || []);
    } catch {
      toast.error('Gagal memuat laporan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [period]);

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#0f172a',
        bodyColor: '#64748b',
        padding: 12,
        borderColor: '#f1f5f9',
        borderWidth: 1,
        callbacks: {
          label: (ctx: any) => ' ' + formatRupiah(ctx.parsed.y),
        },
      },
    },
    scales: {
      y: {
        grid: { color: '#f1f5f9' },
        ticks: {
          color: '#94a3b8',
          font: { size: 10 },
          callback: (v: any) => `${(v / 1_000_000).toFixed(0)}M`,
        },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10 } },
        border: { display: false },
      },
    },
  };

  // Status distribution for orders
  const paid = transactions.filter(t => t.status === 'paid').length;
  const pending = transactions.filter(t => t.status === 'pending').length;
  const cancelled = transactions.filter(t => t.status === 'cancelled').length;
  const statusChartData = {
    labels: ['Lunas', 'Menunggu', 'Dibatalkan'],
    datasets: [{
      data: [paid, pending, cancelled],
      backgroundColor: ['#16a34a', '#f59e0b', '#ef4444'],
      borderWidth: 0,
    }],
  };

  const totalRevenue = transactions
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + (t.final_amount || 0), 0);

  const handleExport = async () => {
    try {
      const res = await api.get('/admin/orders/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Laporan berhasil diunduh');
    } catch {
      toast.error('Gagal mengunduh laporan. Coba dari halaman Pesanan.');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 leading-tight">Laporan Keuangan & Analitik</h1>
          <p className="text-sm text-neutral-500 mt-1 font-medium">Data performa bisnis DietCare secara menyeluruh</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="h-10 px-4 rounded-xl border border-neutral-200 bg-white font-bold text-sm text-neutral-700 flex items-center gap-2 hover:bg-neutral-50 transition-all"
          >
            <FiRefreshCw className={`w-4 h-4 text-neutral-400 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="h-10 px-4 rounded-xl bg-brand-500 text-white font-bold text-sm flex items-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
          >
            <FiDownload className="w-4 h-4" /> Unduh Laporan
          </button>
        </div>
      </div>

      {isLoading && !stats ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <FiLoader className="w-10 h-10 text-brand-500 animate-spin" />
          <p className="text-neutral-400 font-bold">Memuat laporan...</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: 'Pendapatan Bulan Ini',
                value: formatRupiah(stats?.revenue_this_month || 0),
                sub: `${(stats?.growth_percent || 0) >= 0 ? '+' : ''}${stats?.growth_percent || 0}% vs bulan lalu`,
                icon: <FiTrendingUp className="w-6 h-6" />,
                bg: 'bg-emerald-50',
                color: 'text-emerald-600',
              },
              {
                label: 'Klien Aktif',
                value: String(stats?.active_clients || 0),
                sub: 'Sedang dalam program',
                icon: <FiUsers className="w-6 h-6" />,
                bg: 'bg-blue-50',
                color: 'text-blue-600',
              },
              {
                label: 'Transaksi Hari Ini',
                value: String(stats?.today_transactions?.count || 0),
                sub: formatRupiah(stats?.today_transactions?.amount || 0),
                icon: <FiShoppingBag className="w-6 h-6" />,
                bg: 'bg-amber-50',
                color: 'text-amber-600',
              },
              {
                label: 'Ahli Gizi Aktif',
                value: String(stats?.active_nutritionists || 0),
                sub: 'Sedang melayani klien',
                icon: <FiUsers className="w-6 h-6" />,
                bg: 'bg-purple-50',
                color: 'text-purple-600',
              },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-7 hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-5">
                  <div className={`p-3 rounded-2xl ${s.bg} ${s.color} group-hover:scale-110 transition-transform`}>
                    {s.icon}
                  </div>
                </div>
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-3xl font-black text-neutral-900">{s.value}</p>
                <p className="text-xs text-neutral-400 font-medium mt-2">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Line Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-100 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-neutral-900">Grafik Pendapatan</h3>
                <div className="flex bg-neutral-50 p-1 rounded-xl border border-neutral-100">
                  {['daily', 'weekly', 'monthly'].map(p => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                        period === p ? 'bg-white text-brand-600 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'
                      }`}
                    >
                      {p === 'daily' ? 'Harian' : p === 'weekly' ? 'Mingguan' : 'Bulanan'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[280px]">
                {revenueData ? (
                  <Line data={revenueData} options={chartOpts} />
                ) : (
                  <div className="flex h-full items-center justify-center text-neutral-300 font-black uppercase text-[10px]">
                    Memuat grafik...
                  </div>
                )}
              </div>
            </div>

            {/* Status Doughnut */}
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-8 flex flex-col">
              <h3 className="text-lg font-black text-neutral-900 mb-6">Status Transaksi</h3>
              <div className="flex-1 flex items-center justify-center">
                {(paid + pending + cancelled) > 0 ? (
                  <div className="h-[200px] w-[200px]">
                    <Doughnut
                      data={statusChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '70%',
                        plugins: { legend: { display: false } },
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-neutral-300 text-sm font-bold">Belum ada data</p>
                )}
              </div>
              <div className="space-y-3 mt-4">
                {[
                  { label: 'Lunas', count: paid, color: 'bg-emerald-500' },
                  { label: 'Menunggu', count: pending, color: 'bg-amber-500' },
                  { label: 'Dibatalkan', count: cancelled, color: 'bg-red-500' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-xs font-bold text-neutral-600">{item.label}</span>
                    </div>
                    <span className="text-xs font-black text-neutral-900">{item.count} transaksi</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-neutral-50 flex items-center justify-between">
              <h3 className="text-lg font-black text-neutral-900">Riwayat Transaksi</h3>
              <span className="text-xs font-black text-neutral-400 uppercase tracking-widest">10 Terbaru</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-neutral-50 text-neutral-400 text-[10px] uppercase font-black tracking-widest border-b border-neutral-100">
                  <tr>
                    {['Kode', 'Klien', 'Program', 'Total', 'Status', 'Tanggal'].map(h => (
                      <th key={h} className="px-8 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 text-sm">
                  {transactions.length > 0 ? transactions.slice(0, 10).map((t: any) => (
                    <tr key={t.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-8 py-4 font-black text-neutral-900 font-mono text-xs">{t.order_code || `#${t.id}`}</td>
                      <td className="px-8 py-4 font-bold text-neutral-900">{t.user?.name}</td>
                      <td className="px-8 py-4 text-neutral-500">{t.program?.name}</td>
                      <td className="px-8 py-4 font-black text-brand-600">{formatRupiah(t.final_amount)}</td>
                      <td className="px-8 py-4">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                          t.status === 'paid' ? 'bg-emerald-50 text-emerald-600'
                          : t.status === 'pending' ? 'bg-amber-50 text-amber-600'
                          : 'bg-red-50 text-red-600'
                        }`}>{t.status}</span>
                      </td>
                      <td className="px-8 py-4 text-neutral-400 text-xs font-bold">
                        {new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-neutral-400 font-bold italic">
                        Belum ada transaksi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalRevenue > 0 && (
              <div className="px-8 py-5 border-t border-neutral-100 bg-neutral-50/30 flex justify-between items-center">
                <span className="text-sm font-black text-neutral-500 uppercase tracking-widest">Total Pendapatan (Transaksi Lunas)</span>
                <span className="text-lg font-black text-emerald-600">{formatRupiah(totalRevenue)}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
