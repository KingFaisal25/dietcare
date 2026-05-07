'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { FiUserPlus, FiFilter, FiCheckCircle, FiLoader, FiUser } from 'react-icons/fi';
import api from '@/lib/api';
import { toast } from 'sonner';

interface PendingOrder {
  id: number;
  order_code: string;
  user: { name: string; email: string };
  program: { name: string };
  package_label?: string;
  created_at: string;
}

interface Nutritionist {
  id: number;
  name: string;
  specialty?: string;
  active_clients: number;
  max_clients: number;
}

const AssignNutritionist = () => {
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [nutritionists, setNutritionists] = useState<Nutritionist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState<number | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, workloadRes] = await Promise.allSettled([
        api.get('/admin/orders?status=paid&per_page=50'),
        api.get('/admin/dashboard/workload'),
      ]);

      if (ordersRes.status === 'fulfilled') {
        // Filter only orders without a nutritionist assigned
        const unassigned = (ordersRes.value.data.data || []).filter(
          (o: any) => !o.nutritionist_id
        );
        setPendingOrders(unassigned);
      } else {
        toast.error('Gagal memuat daftar pesanan');
      }

      if (workloadRes.status === 'fulfilled') {
        setNutritionists(workloadRes.value.data || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAssignModal = (order: PendingOrder) => {
    setSelectedOrder(order);
    setIsAssignModalOpen(true);
  };

  const handleAssign = async (nutritionistId: number) => {
    if (!selectedOrder) return;
    setIsAssigning(nutritionistId);
    try {
      await api.put(`/admin/orders/${selectedOrder.id}/assign`, {
        nutritionist_id: nutritionistId,
      });
      toast.success(`Ahli gizi berhasil ditugaskan untuk ${selectedOrder.user?.name}`);
      setIsAssignModalOpen(false);
      setSelectedOrder(null);
      fetchData(); // Refresh list
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Gagal menugaskan ahli gizi';
      toast.error(msg);
    } finally {
      setIsAssigning(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 leading-tight">Assign Ahli Gizi</h1>
        <p className="text-neutral-500 text-sm font-medium">
          Tentukan ahli gizi untuk klien yang sudah membayar
        </p>
      </div>

      <Card className="overflow-hidden border-none shadow-sm rounded-[32px] bg-white">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <FiLoader className="w-10 h-10 text-brand-600 animate-spin" />
            <p className="text-neutral-400 font-bold italic">Memuat pesanan...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 text-neutral-400 text-[10px] uppercase font-black tracking-widest border-b border-neutral-100">
                <tr>
                  <th className="px-8 py-5">Kode Order</th>
                  <th className="px-8 py-5">Nama Klien</th>
                  <th className="px-8 py-5">Program</th>
                  <th className="px-8 py-5">Tanggal Bayar</th>
                  <th className="px-8 py-5 text-center">Assign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 text-sm">
                {pendingOrders.length > 0 ? pendingOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="px-8 py-5 font-black text-neutral-900">
                      {order.order_code || `#${order.id}`}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-black text-xs border border-brand-100">
                          {order.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900">{order.user?.name}</p>
                          <p className="text-[10px] text-neutral-400">{order.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <Badge variant="default">{order.program?.name}</Badge>
                    </td>
                    <td className="px-8 py-5 text-neutral-500 font-medium">
                      {new Date(order.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <Button
                        size="sm"
                        onClick={() => handleOpenAssignModal(order)}
                        className="bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl"
                      >
                        <FiUserPlus className="mr-2" /> Assign
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <FiCheckCircle className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
                      <p className="text-neutral-400 font-bold">Semua pesanan sudah ditangani!</p>
                      <p className="text-neutral-300 text-sm mt-1">Tidak ada pesanan yang perlu di-assign ahli gizi.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* MODAL ASSIGN AHLI GIZI */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => { setIsAssignModalOpen(false); setSelectedOrder(null); }}
        title={`Assign Ahli Gizi — ${selectedOrder?.user?.name}`}
      >
        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-bold text-neutral-700">
              Pilih Ahli Gizi untuk{' '}
              <span className="text-brand-600">{selectedOrder?.program?.name}</span>
            </p>
            <button className="text-xs text-neutral-400 flex items-center gap-1 hover:text-neutral-600">
              <FiFilter className="w-3 h-3" /> Filter
            </button>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {nutritionists.length > 0 ? nutritionists.map((nutri) => {
              const workload = nutri.max_clients > 0
                ? (nutri.active_clients / nutri.max_clients) * 100
                : 0;
              const isFull = workload >= 100;
              const colorBar = isFull
                ? 'bg-red-500'
                : workload >= 80
                ? 'bg-orange-500'
                : 'bg-emerald-500';

              return (
                <div
                  key={nutri.id}
                  className={`p-4 border rounded-2xl flex items-center justify-between transition-all ${
                    isFull
                      ? 'border-neutral-100 bg-neutral-50 opacity-60'
                      : 'border-neutral-100 hover:bg-brand-50 hover:border-brand-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-black border border-brand-100">
                      {nutri.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 flex items-center gap-2">
                        {nutri.name}
                        {isFull && (
                          <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-black uppercase">Penuh</span>
                        )}
                      </p>
                      <p className="text-xs text-neutral-400">{nutri.specialty || 'Gizi Umum'}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="h-1.5 w-28 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colorBar} rounded-full transition-all`}
                            style={{ width: `${Math.min(workload, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-neutral-400 font-medium">
                          {nutri.active_clients}/{nutri.max_clients} klien
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isFull ? 'outline' : 'primary'}
                    disabled={isFull || isAssigning === nutri.id}
                    onClick={() => handleAssign(nutri.id)}
                    className="rounded-xl font-bold"
                  >
                    {isAssigning === nutri.id
                      ? <FiLoader className="animate-spin" />
                      : 'Pilih'
                    }
                  </Button>
                </div>
              );
            }) : (
              <div className="py-10 text-center">
                <FiUser className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
                <p className="text-neutral-400 font-bold text-sm">Belum ada ahli gizi terdaftar</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <FiCheckCircle className="text-emerald-500" />
              <span>Email notifikasi dikirim otomatis setelah assign.</span>
            </div>
            <Button
              variant="outline"
              onClick={() => { setIsAssignModalOpen(false); setSelectedOrder(null); }}
            >
              Batal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AssignNutritionist;
