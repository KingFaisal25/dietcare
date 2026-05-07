'use client';

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import api from '@/lib/api';
import {
  FiTrendingUp, FiUsers, FiShoppingBag, FiActivity,
  FiAlertCircle, FiLoader, FiRefreshCw, FiMoreVertical, FiCheckCircle,
} from 'react-icons/fi';
import { toast } from 'sonner';
import { Scene3DBackground } from '@/components/ui/Scene3DBackground';
import { TiltCard } from '@/components/ui/TiltCard';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

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
          labels: cd.labels || [],
          datasets: [{
            label: 'Revenue', data: cd.data || [],
            borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.08)',
            fill: true, tension: 0.4, borderWidth: 2,
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
      { label: 'Body Goals', data: [40, 50, 45, 60, 70, 85], backgroundColor: '#22c55e' },
      { label: 'Body for Baby', data: [20, 25, 30, 35, 40, 45], backgroundColor: '#3b82f6' },
      { label: 'Clinicare', data: [15, 20, 18, 22, 25, 30], backgroundColor: '#ef4444' },
    ],
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#0f172a', padding: 12, titleFont: { size: 12, weight: 'bold' as const }, bodyFont: { size: 12 }, displayColors: false },
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#475569', font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10, weight: 'bold' as const } } },
    },
  };

  if (isLoading && !stats.revenue_this_month) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="text-center space-y-4">
          <FiLoader className="w-10 h-10 text-green-500 animate-spin mx-auto" />
          <p className="text-slate-500 font-medium animate-pulse">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="text-center space-y-6 max-w-md px-6">
          <div className="w-20 h-20 bg-red-500/15 text-red-400 rounded-full flex items-center justify-center mx-auto">
            <FiAlertCircle size={40} />
          </div>
          <h2 className="text-xl font-bold text-white">Gagal Memuat Dashboard</h2>
          <p className="text-slate-400 text-sm">{error}</p>
          <button onClick={fetchDashboardData}
            className="btn-green w-full py-3 text-sm flex items-center justify-center gap-2">
            <FiRefreshCw size={18} /> Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const STAT_CARDS = [
    { label: 'Revenue Bulan Ini', value: formatRupiah(stats.revenue_this_month),
      sub: `${stats.growth_percent >= 0 ? '+' : ''}${stats.growth_percent}% dari bulan lalu`,
      icon: FiTrendingUp, iconBg: 'rgba(34,197,94,0.15)', iconColor: '#4ade80', subColor: stats.growth_percent >= 0 ? '#4ade80' : '#f87171' },
    { label: 'Klien Aktif', value: String(stats.active_clients),
      sub: 'Sedang dalam program', icon: FiUsers,
      iconBg: 'rgba(59,130,246,0.15)', iconColor: '#60a5fa', subColor: '#64748b' },
    { label: 'Transaksi Hari Ini', value: String(stats.today_transactions.count),
      sub: formatRupiah(stats.today_transactions.amount), icon: FiShoppingBag,
      iconBg: 'rgba(245,158,11,0.15)', iconColor: '#fbbf24', subColor: '#fbbf24' },
    { label: 'Ahli Gizi Aktif', value: String(stats.active_nutritionists),
      sub: 'Online & melayani', icon: FiActivity,
      iconBg: 'rgba(168,85,247,0.15)', iconColor: '#c084fc', subColor: '#64748b' },
  ];

  return (
    <div className="space-y-6 animate-fade-up relative">
      <Scene3DBackground subtle />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative z-10">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Ringkasan performa bisnis DietCare.</p>
        </div>
        <button onClick={fetchDashboardData} disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
          style={{ background: '#1e293b' }}>
          {isLoading ? <FiLoader className="animate-spin w-3.5 h-3.5" /> : <FiRefreshCw className="w-3.5 h-3.5" />}
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {STAT_CARDS.map((s, i) => {
          const Icon = s.icon;
          return (
            <TiltCard key={i} className={`stat-card animate-fade-up stagger-${i + 1} glass-panel border border-white/10`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ background: s.iconBg }}>
                  <Icon className="w-5 h-5" style={{ color: s.iconColor }} />
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">{s.value}</h3>
              <p className="text-[11px] font-semibold mt-1" style={{ color: s.subColor }}>{s.sub}</p>
            </TiltCard>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-10">
        {/* Revenue Chart */}
        <div className="p-6 rounded-[18px] border border-white/[0.06]" style={{ background: '#1e293b' }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-white">Grafik Revenue</h3>
            <div className="flex rounded-xl p-1 border border-white/[0.06]" style={{ background: '#273449' }}>
              {['daily', 'weekly', 'monthly'].map((p) => (
                <button key={p} onClick={() => setRevenuePeriod(p)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                    revenuePeriod === p ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'text-slate-500 hover:text-slate-300'
                  }`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="h-[280px]">
            {revenueChartData ? (
              <Line data={revenueChartData} options={chartOpts} />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-600">Memuat...</div>
            )}
          </div>
        </div>

        {/* Client Chart */}
        <div className="p-6 rounded-[18px] border border-white/[0.06]" style={{ background: '#1e293b' }}>
          <h3 className="text-sm font-bold text-white mb-6">Klien Baru per Program</h3>
          <div className="h-[280px]">
            <Bar data={clientData} options={{
              ...chartOpts,
              plugins: {
                ...chartOpts.plugins,
                legend: { position: 'bottom' as const, labels: { boxWidth: 8, usePointStyle: true, color: '#94a3b8', font: { size: 10, weight: 'bold' as const } } },
              },
              scales: { ...chartOpts.scales, x: { ...chartOpts.scales.x, stacked: true }, y: { ...chartOpts.scales.y, stacked: true } },
            }} />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-[18px] border border-white/[0.06] overflow-hidden relative z-10 glass-panel" style={{ background: 'rgba(30, 41, 59, 0.62)' }}>
        <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">Transaksi Terbaru</h3>
          <button className="text-[10px] font-bold text-green-400 uppercase tracking-widest hover:text-green-300 transition-colors">Lihat Semua</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {['Kode', 'Klien', 'Program', 'Total', 'Status', 'Tanggal'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {recentTransactions.map((t: any) => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-bold text-white font-mono text-xs">{t.order_code || `#${t.id}`}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold text-green-400" style={{ background: 'rgba(34,197,94,0.15)' }}>
                        {t.user?.name?.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-200 text-xs">{t.user?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg text-slate-400" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      {t.program?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-extrabold text-yellow-400 text-xs">{formatRupiah(t.final_amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      t.status === 'paid' ? 'bg-green-500/15 text-green-400'
                      : t.status === 'pending' ? 'bg-amber-500/15 text-amber-400'
                      : 'bg-red-500/15 text-red-400'
                    }`}>{t.status}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-20 text-center">
                  <FiShoppingBag className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Belum ada transaksi</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts + Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-10">
        {/* Alerts */}
        <div className="p-6 rounded-[18px] border border-white/[0.06]" style={{ background: '#1e293b' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
              <FiAlertCircle className="w-4 h-4 text-red-400" />
            </div>
            <h3 className="text-sm font-bold text-white">Peringatan Sistem</h3>
          </div>
          <div className="space-y-3">
            {adminAlerts.map((alert: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl border border-white/[0.06] flex items-center justify-between hover:border-red-500/20 transition-all"
                   style={{ background: '#273449' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-red-400"
                       style={{ background: 'rgba(239,68,68,0.15)' }}>
                    {alert.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs">{alert.user?.name}</p>
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mt-0.5">Meal Plan Delay &gt; 2 Hari</p>
                  </div>
                </div>
                <button className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-all">
                  Handle
                </button>
              </div>
            ))}
            {adminAlerts.length === 0 && (
              <div className="py-12 text-center">
                <FiCheckCircle className="w-8 h-8 text-green-500/30 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Semua berjalan lancar!</p>
              </div>
            )}
          </div>
        </div>

        {/* Workload */}
        <div className="p-6 rounded-[18px] border border-white/[0.06]" style={{ background: '#1e293b' }}>
          <h3 className="text-sm font-bold text-white mb-5">Beban Kerja Ahli Gizi</h3>
          <div className="space-y-5">
            {workloadData.map((w: any, idx: number) => {
              const pct = (w.active_clients / w.max_clients) * 100;
              const barColor = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#22c55e';
              const txtColor = pct >= 100 ? '#f87171' : pct >= 80 ? '#fbbf24' : '#4ade80';
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold"
                           style={{ background: `${barColor}20`, color: txtColor }}>
                        {w.name?.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-200 text-xs">{w.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{w.active_clients}/{w.max_clients}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-1000"
                         style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} />
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-right" style={{ color: txtColor }}>
                    {w.status}
                  </p>
                </div>
              );
            })}
            {workloadData.length === 0 && (
              <div className="py-12 text-center text-slate-600">Tidak ada data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
