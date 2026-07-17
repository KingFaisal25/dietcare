'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FiArrowLeft, FiEdit2, FiLock, FiTrash2, FiCalendar, FiSmartphone, FiMail } from 'react-icons/fi';
import Link from 'next/link';

const UserDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = React.use(params);
  const [user] = useState({
    id: resolvedParams.id,
    name: 'Budi Santoso',
    email: 'budi@gmail.com',
    phone: '081234567890',
    role: 'patient',
    status: 'Aktif',
    joined: '2024-03-01',
    profile_pic: null,
    program_history: [
      { id: 'ORD-001', name: 'Body Goals', duration: '30 Hari', status: 'Active', date: '2024-03-01' },
      { id: 'ORD-000', name: 'Body Goals', duration: '30 Hari', status: 'Completed', date: '2024-02-01' },
    ],
    progress_bb: [
      { date: '2024-02-01', weight: 85 },
      { date: '2024-02-15', weight: 83 },
      { date: '2024-03-01', weight: 81.5 },
    ],
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge variant="danger">Admin</Badge>;
      case 'nutritionist': return <Badge variant="success">Ahli Gizi</Badge>;
      default: return <Badge variant="default">Klien</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            <FiArrowLeft className="mr-2" /> Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Detail User</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* INFO DASAR */}
        <Card className="lg:col-span-1 p-6 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-4xl">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
              <div className="mt-2">{getRoleBadge(user.role)}</div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3 text-sm">
              <FiMail className="text-gray-400" />
              <div>
                <p className="text-gray-400 text-xs">Email</p>
                <p className="font-medium text-gray-700">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <FiSmartphone className="text-gray-400" />
              <div>
                <p className="text-gray-400 text-xs">Nomor HP</p>
                <p className="font-medium text-gray-700">{user.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <FiCalendar className="text-gray-400" />
              <div>
                <p className="text-gray-400 text-xs">Tanggal Daftar</p>
                <p className="font-medium text-gray-700">{user.joined}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-6">
            <Button className="w-full" variant="outline">
              <FiEdit2 className="mr-2" /> Edit Profil
            </Button>
            <Button className="w-full" variant="outline">
              <FiLock className="mr-2" /> Reset Password
            </Button>
            <Button variant="ghost" className="w-full text-red-600 hover:bg-red-50">
              <FiTrash2 className="mr-2" /> Nonaktifkan Akun
            </Button>
          </div>
        </Card>

        {/* RIWAYAT & PROGRESS (IF CLIENT) */}
        {user.role === 'patient' && (
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="font-bold text-gray-700 mb-4">Riwayat Program</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-gray-400 uppercase text-xs font-medium">
                    <tr className="border-b border-gray-100">
                      <th className="py-3 text-left">Order ID</th>
                      <th className="py-3 text-left">Program</th>
                      <th className="py-3 text-left">Durasi</th>
                      <th className="py-3 text-left">Status</th>
                      <th className="py-3 text-left">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {user.program_history.map((prog, i) => (
                      <tr key={i}>
                        <td className="py-4 font-medium text-gray-800">{prog.id}</td>
                        <td className="py-4">{prog.name}</td>
                        <td className="py-4">{prog.duration}</td>
                        <td className="py-4">
                          <Badge variant={prog.status === 'Active' ? 'success' : 'default'}>{prog.status}</Badge>
                        </td>
                        <td className="py-4 text-gray-500">{prog.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-gray-700 mb-4">Progress Berat Badan</h3>
              <div className="space-y-4">
                {user.progress_bb.map((p, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{p.date}</span>
                    <span className="text-lg font-bold text-green-600">{p.weight} kg</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetail;
