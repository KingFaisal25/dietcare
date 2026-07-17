'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FiSearch, FiDownload, FiEye, FiXCircle, FiLoader } from 'react-icons/fi';
import api from '@/lib/api';
import Link from 'next/link';
import { toast } from 'sonner';

const OrdersManagement = () => {
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/orders?status=${filter}&search=${search}&page=${page}`);
      setOrders(res.data.data);
      setTotalPages(res.data.last_page);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Gagal mengambil data order');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter, search, page]);

  const statusOptions = ['Semua', 'Paid', 'Pending', 'Cancelled', 'Expired'];

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return <Badge variant="success">Lunas</Badge>;
      case 'pending': return <Badge variant="warning">Menunggu</Badge>;
      case 'cancelled': return <Badge variant="danger">Dibatalkan</Badge>;
      default: return <Badge variant="default">Kadaluarsa</Badge>;
    }
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/admin/orders/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-order-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Data order berhasil diexport');
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengexport data order');
    }
  };

  return (
    <div className="p-6 space-y-6 bg-surface-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 leading-tight">Kelola Order</h1>
          <p className="text-neutral-500 text-sm font-medium">Monitoring semua transaksi dan status pembayaran</p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          className="rounded-xl font-bold border-neutral-200 hover:bg-white transition-all"
        >
          <FiDownload className="mr-2" /> Export Excel
        </Button>
      </div>

      <Card className="p-4 border-none shadow-sm rounded-2xl bg-white">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex bg-neutral-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => { setFilter(s); setPage(1); }}
                className={`px-6 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  filter === s ? 'bg-white shadow-sm text-brand-600' : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <Input 
              placeholder="Cari kode atau nama..." 
              className="pl-12 bg-neutral-50 border-neutral-200 rounded-xl text-sm focus:ring-brand-500"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden border-none shadow-sm rounded-[32px] bg-white">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <FiLoader className="w-10 h-10 text-brand-500 animate-spin" />
              <p className="text-neutral-400 font-bold italic">Memuat data order...</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead className="bg-neutral-50 text-neutral-400 text-[10px] uppercase font-black tracking-widest border-b border-neutral-100">
                  <tr>
                    <th className="px-8 py-5">Kode Order</th>
                    <th className="px-8 py-5">Klien</th>
                    <th className="px-8 py-5">Program</th>
                    <th className="px-8 py-5">Total</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Tanggal</th>
                    <th className="px-8 py-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 text-sm">
                  {orders.length > 0 ? orders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors group">
                      <td className="px-8 py-5 font-black text-neutral-900">{order.order_code || `ORD-${order.id}`}</td>
                      <td className="px-8 py-5">
                        <div>
                          <p className="font-bold text-neutral-900">{order.user?.name}</p>
                          <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">{order.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-bold text-neutral-600">{order.program?.name}</td>
                      <td className="px-8 py-5 font-black text-brand-600">{formatRupiah(order.final_amount)}</td>
                      <td className="px-8 py-5">{getStatusBadge(order.status)}</td>
                      <td className="px-8 py-5 font-medium text-neutral-500">
                        {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl font-bold text-brand-600 hover:bg-brand-50">
                            Detail
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="py-20 text-center">
                        <p className="text-neutral-400 font-bold italic">Tidak ada order ditemukan.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-6 border-t border-neutral-100 flex justify-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                        page === i + 1 
                          ? 'bg-brand-500 text-white shadow-lg shadow-brand-100' 
                          : 'bg-white text-neutral-400 border border-neutral-100 hover:bg-neutral-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OrdersManagement;
