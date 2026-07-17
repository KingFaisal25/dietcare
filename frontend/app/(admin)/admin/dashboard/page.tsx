'use client';

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import {
  FiTrendingUp, FiUsers, FiShoppingBag, FiActivity,
  FiAlertCircle, FiLoader, FiRefreshCw, FiMoreVertical, FiCheckCircle, FiChevronRight, FiCreditCard
} from 'react-icons/fi';
import { toast } from 'sonner';
import { Scene3DBackground } from '@/components/ui/Scene3DBackground';
import { TiltCard } from '@/components/ui/TiltCard';
import { Button } from '@/components/ui/Button';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

interface DashboardStats {
  revenue_this_month: number;
  growth_percent: number;
  active_clients: number;
  today_transactions: { count: number; amount: number };
  active_nutritionists: number;
}

const formatRupiah = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

export default function AdminDashboard() {
  const [revenuePeriod, setRevenuePeriod] = useState('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    revenue_this_month: 0, growth_percent: 0, active_clients: 0,
    today_transactions: { count: 0, amount: 0 }, active_nutritionists: 0,
  });
  const [revenueChartData, setRevenueChartData] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [adminAlerts, setAdminAlerts] = useState<any[]>([]);
  const [workloadData, setWorkloadData] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setIsLoading(true); setError(null);
    try {
      const results = await Promise.allSettled([
        api.get('/admin/dashboard/stats'),
        api.get(`/admin/dashboard/revenue-chart?period=${revenuePeriod}`),
        api.get('/admin/dashboard/recent-transactions'),
        api.get('/admin/dashboard/alerts'),
        api.get('/admin/dashboard/workload'),
      ]);
      if (results[0].status === 'fulfilled') setStats(results[0].value.data);
      if (results[1].status === 'fulfilled') {
        const cd = results[1].value.data;
        setRevenueChartData({
          labels: cd.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Revenue', data: cd.data || [0, 0, 0, 0, 0, 0],
            borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.05)',
            fill: true, tension: 0.4, borderWidth: 3, pointRadius: 4, pointBackgroundColor: '#fff', pointBorderWidth: 2
          }],
        });
      }
      if (results[2].status === 'fulfilled') setRecentTransactions(results[2].value.data || []);
      if (results[3].status === 'fulfilled') setAdminAlerts(results[3].value.data?.meal_plan_delay || []);
      if (results[4].status === 'fulfilled') setWorkloadData(results[4].value.data || []);
      if (results.every(r => r.status === 'rejected')) throw new Error('Semua API gagal');
    } catch (err: any) {
      setError(err.message); toast.error('Gagal memuat dashboard');
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchDashboardData(); }, [revenuePeriod]);

  const clientData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { label: 'Body Goals', data: [40, 50, 45, 60, 70, 85], backgroundColor: '#16a34a', borderRadius: 8 },
      { label: 'Body for Baby', data: [20, 25, 30, 35, 40, 45], backgroundColor: '#3b82f6', borderRadius: 8 },
      { label: 'Clinicare', data: [15, 20, 18, 22, 25, 30], backgroundColor: '#ef4444', borderRadius: 8 },
    ],
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#fff', titleColor: '#0f172a', bodyColor: '#64748b', padding: 12, borderColor: '#f1f5f9', borderWidth: 1, titleFont: { size: 12, weight: 'bold' as const }, bodyFont: { size: 12 }, displayColors: true, boxPadding: 6 },
    },
    scales: {
      y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 10 } }, border: { display: false } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10, weight: 'bold' as const } }, border: { display: false } },
    },
  };

  if (isLoading && !stats.revenue_this_month) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  const STAT_CARDS = [
    { label: 'Revenue Bulan Ini', value: formatRupiah(stats.revenue_this_month),
      sub: `${stats.growth_percent >= 0 ? '+' : ''}${stats.growth_percent}% vs Bulan Lalu`,
      icon: FiTrendingUp, bg: 'bg-green-50', color: 'text-green-600', trend: stats.growth_percent >= 0 ? 'up' : 'down' },
    { label: 'Klien Aktif', value: String(stats.active_clients),
      sub: 'Sedang dalam program', icon: FiUsers,
      bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Transaksi Hari Ini', value: String(stats.today_transactions.count),
      sub: formatRupiah(stats.today_transactions.amount), icon: FiCreditCard,
      bg: 'bg-amber-50', color: 'text-amber-600' },
    { label: 'Ahli Gizi Aktif', value: String(stats.active_nutritionists),
      sub: 'Online & Melayani', icon: FiActivity,
      bg: 'bg-purple-50', color: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 relative overflow-hidden">
      <Scene3DBackground subtle />
      
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <span className="inline-block px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-[11px] font-black uppercase tracking-[0.2em] mb-2 border border-green-100">
              Platform Analytics
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              Admin <span className="text-green-600">Overview</span>
            </h1>
            <p className="text-slate-500 font-medium">Ringkasan performa platform DietCare secara real-time.</p>
          </div>
          <button onClick={fetchDashboardData} disabled={isLoading}
            className="h-16 px-8 rounded-[1.25rem] bg-white border border-slate-100 font-black text-sm text-slate-900 shadow-sm flex items-center gap-3 group transition-all hover:shadow-xl hover:-translate-y-1">
            <FiRefreshCw className={`w-4 h-4 text-green-600 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            Refresh Data
          </button>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STAT_CARDS.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <TiltCard className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div className={`p-4 rounded-2xl ${s.bg} ${s.color} transition-transform group-hover:scale-110 duration-500`}>
                    <s.icon size={24} />
                  </div>
                  {s.trend && (
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${s.trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {s.sub}
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
                <h3 className="text-3xl font-black text-slate-900 group-hover:text-green-600 transition-colors">{s.value}</h3>
                {!s.trend && <p className="text-[10px] font-bold text-slate-400 mt-2">{s.sub}</p>}
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <TiltCard className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black text-slate-900">Performa Pendapatan</h3>
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                {['daily', 'weekly', 'monthly'].map((p) => (
                  <button key={p} onClick={() => setRevenuePeriod(p)}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                      revenuePeriod === p ? 'bg-white text-green-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
                    }`}>{p}</button>
                ))}
              </div>
            </div>
            <div className="h-[300px]">
              {revenueChartData ? (
                <Line data={revenueChartData} options={chartOpts} />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-300 font-black uppercase tracking-[0.2em] text-[10px]">Memuat Grafik...</div>
              )}
            </div>
          </TiltCard>

          {/* Client Chart */}
          <TiltCard className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-10">Distribusi Program</h3>
            <div className="h-[300px]">
              <Bar data={clientData} options={{
                ...chartOpts,
                plugins: {
                  ...chartOpts.plugins,
                  legend: { display: true, position: 'bottom' as const, labels: { boxWidth: 8, usePointStyle: true, color: '#94a3b8', font: { size: 10, weight: 'bold' as const }, padding: 20 } },
                },
                scales: { ...chartOpts.scales, x: { ...chartOpts.scales.x, stacked: true }, y: { ...chartOpts.scales.y, stacked: true } },
              }} />
            </div>
          </TiltCard>
        </div>

        {/* TRANSACTIONS TABLE */}
        <TiltCard className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <FiShoppingBag className="text-green-600" /> Transaksi Terbaru
            </h3>
            <button className="text-[10px] font-black text-green-600 uppercase tracking-widest hover:underline flex items-center gap-2">
              Lihat Semua Transaksi <FiChevronRight />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  {['Kode', 'Klien', 'Program', 'Total', 'Status', 'Tanggal'].map(h => (
                    <th key={h} className="text-left px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentTransactions.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-6 font-black text-slate-900 font-mono text-xs">{t.order_code || `#${t.id}`}</td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-xs font-black text-green-600 border border-green-100 group-hover:scale-110 transition-transform">
                          {t.user?.name?.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900 text-sm">{t.user?.name}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-slate-50 text-slate-500 border border-slate-100 uppercase tracking-widest">
                        {t.program?.name}
                      </span>
                    </td>
                    <td className="px-10 py-6 font-black text-slate-900 text-sm">{formatRupiah(t.final_amount)}</td>
                    <td className="px-10 py-6">
                      <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
                        t.status === 'paid' ? 'bg-green-50 text-green-600'
                        : t.status === 'pending' ? 'bg-amber-50 text-amber-600'
                        : 'bg-red-50 text-red-600'
                      }`}>{t.status}</span>
                    </td>
                    <td className="px-10 py-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
                      {new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TiltCard>

        {/* ALERTS & WORKLOAD */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Alerts */}
          <TiltCard className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-3 rounded-2xl bg-red-50 text-red-600">
                <FiAlertCircle size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900">Peringatan Sistem</h3>
            </div>
            <div className="space-y-4">
              {adminAlerts.map((alert: any, idx: number) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-red-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-sm font-black text-red-500 shadow-sm group-hover:scale-110 transition-transform">
                      {alert.user?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm">{alert.user?.name}</p>
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1">Meal Plan Delay &gt; 2 Hari</p>
                    </div>
                  </div>
                  <Button className="h-10 px-6 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all">
                    Handle
                  </Button>
                </div>
              ))}
              {adminAlerts.length === 0 && (
                <div className="py-20 text-center">
                  <div className="w-20 h-20 bg-green-50 rounded-[2.5rem] flex items-center justify-center text-green-600 mx-auto mb-6">
                    <FiCheckCircle size={40} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">Semua Aman!</h3>
                  <p className="text-slate-400 font-medium">Tidak ada antrean tertunda yang perlu ditangani.</p>
                </div>
              )}
            </div>
          </TiltCard>

          {/* Workload */}
          <TiltCard className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
                <FiActivity size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900">Beban Kerja Ahli Gizi</h3>
            </div>
            <div className="space-y-8">
              {workloadData.map((w: any, idx: number) => {
                const pct = (w.active_clients / w.max_clients) * 100;
                const barColor = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-green-500';
                const txtColor = pct >= 100 ? 'text-red-500' : pct >= 80 ? 'text-amber-500' : 'text-green-600';
                return (
                  <div key={idx} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black ${txtColor}`}>
                          {w.name?.charAt(0)}
                        </div>
                        <span className="font-black text-slate-900 text-sm">{w.name}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{w.active_clients} / {w.max_clients} Klien</span>
                    </div>
                    <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ duration: 1.5, delay: idx * 0.1 }}
                        className={`h-full ${barColor} rounded-full`}
                      />
                    </div>
                    <p className={`text-[9px] font-black uppercase tracking-widest text-right ${txtColor}`}>
                      {w.status}
                    </p>
                  </div>
                );
              })}
            </div>
          </TiltCard>
        </div>
      </div>
    </div>
  );
}
