'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FiArrowLeft, FiXCircle, FiCreditCard, FiUser, FiClock, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';

const OrderDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = React.use(params);
  const [order] = useState({
    id: resolvedParams.id,
    client: { name: 'Andi Wijaya', email: 'andi@gmail.com', phone: '081234567890' },
    program: { name: 'Body Goals', type: 'Intensif', duration: '30 Hari' },
    nutritionist: { name: 'Tim Ahli Gizi', id: 1 },
    payment: { total: 609900, method: 'QRIS', midtrans_id: 'MID-12345-ABCD', status: 'Settlement' },
    status: 'Paid',
    date: '2024-03-21 14:30:00',
    timeline: [
      { status: 'Order Dibuat', time: '2024-03-21 14:25:00', completed: true },
      { status: 'Menunggu Bayar', time: '2024-03-21 14:25:00', completed: true },
      { status: 'Paid', time: '2024-03-21 14:30:00', completed: true },
      { status: 'Program Aktif', time: '2024-03-21 15:00:00', completed: true },
      { status: 'Selesai', time: '-', completed: false },
    ],
  });

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid': return <Badge variant="success">Paid</Badge>;
      case 'Pending': return <Badge variant="warning">Pending</Badge>;
      case 'Cancelled': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="default">Expired</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="sm">
            <FiArrowLeft className="mr-2" /> Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Detail Order - {order.id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* INFO ORDER & PEMBAYARAN */}
          <Card className="p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <p className="text-sm text-gray-400">Status Pembayaran</p>
                <div className="mt-1">{getStatusBadge(order.status)}</div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">ID Transaksi Midtrans</p>
                <p className="font-mono text-xs font-medium text-gray-600">{order.payment.midtrans_id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <FiUser className="text-green-600" /> Informasi Klien
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-gray-800">{order.client.name}</p>
                  <p className="text-gray-500">{order.client.email}</p>
                  <p className="text-gray-500">{order.client.phone}</p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <FiCreditCard className="text-green-600" /> Detail Program
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-gray-800">{order.program.name}</p>
                  <p className="text-gray-500">Tipe: {order.program.type}</p>
                  <p className="text-gray-500">Durasi: {order.program.duration}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-gray-700">Rincian Biaya</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatRupiah(order.payment.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pajak (0%)</span>
                <span className="font-medium">Rp 0</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3 text-green-600">
                <span>Total</span>
                <span>{formatRupiah(order.payment.total)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button variant="outline" className="text-red-600 hover:bg-red-50">
                <FiXCircle className="mr-2" /> Batalkan Order
              </Button>
              <Button variant="outline">
                Refund Manual
              </Button>
            </div>
          </Card>
        </div>

        {/* TIMELINE & ACTIONS */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-gray-700 mb-6">Status Timeline</h3>
            <div className="space-y-8">
              {order.timeline.map((item, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== order.timeline.length - 1 && (
                    <div className={`absolute left-[11px] top-6 w-[2px] h-full ${item.completed ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {item.completed ? <FiCheckCircle size={14} /> : <FiClock size={14} />}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${item.completed ? 'text-gray-800' : 'text-gray-400'}`}>{item.status}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-gray-700 mb-4">Ahli Gizi</h3>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                {order.nutritionist.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{order.nutritionist.name}</p>
                <Link href={`/users/${order.nutritionist.id}`} className="text-xs text-green-600 hover:underline">
                  Lihat Profil
                </Link>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline" size="sm">
              Ubah Ahli Gizi
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
