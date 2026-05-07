'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { FiSearch, FiPlus, FiUser, FiMail, FiPhone, FiLock, FiLoader } from 'react-icons/fi';
import api from '@/lib/api';
import Link from 'next/link';
import { toast } from 'sonner';

const UsersManagement = () => {
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Add Nutritionist form state
  const [newNutri, setNewNutri] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/users?role=${filter}&search=${search}&page=${page}`);
      setUsers(res.data.data);
      setTotalPages(res.data.last_page);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Gagal mengambil data user');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter, search, page]);

  const handleAddNutritionist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNutri.name || !newNutri.email || !newNutri.phone) {
      toast.error('Nama, email, dan nomor HP wajib diisi');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/admin/users/nutritionist', newNutri);
      toast.success('Undangan berhasil dikirim ke ' + newNutri.email);
      setIsAddModalOpen(false);
      setNewNutri({ name: '', email: '', phone: '' });
      fetchUsers();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Gagal mengirim undangan';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setNewNutri({ name: '', email: '', phone: '' });
  };

  const roles = ['Semua', 'Client', 'Nutritionist', 'Admin'];

  const getRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return <Badge variant="danger">Admin</Badge>;
      case 'nutritionist': return <Badge variant="success">Ahli Gizi</Badge>;
      default: return <Badge variant="default">Klien</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-surface-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 leading-tight">Kelola User</h1>
          <p className="text-neutral-500 text-sm font-medium">Manajemen akun klien, ahli gizi, dan admin</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-100"
        >
          <FiPlus className="mr-2" /> Tambah Ahli Gizi
        </Button>
      </div>

      <Card className="p-4 border-none shadow-sm rounded-2xl bg-white">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex bg-neutral-100 p-1 rounded-xl">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => { setFilter(r); setPage(1); }}
                className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${
                  filter === r ? 'bg-white shadow-sm text-brand-600' : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Cari nama atau email..."
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
              <p className="text-neutral-400 font-bold italic">Memuat data user...</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead className="bg-neutral-50 text-neutral-400 text-[10px] uppercase font-black tracking-widest border-b border-neutral-100">
                  <tr>
                    <th className="px-8 py-5">Nama &amp; Email</th>
                    <th className="px-8 py-5">Role</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Tanggal Daftar</th>
                    <th className="px-8 py-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 text-sm">
                  {users.length > 0 ? users.map((user) => (
                    <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 font-black text-sm border border-brand-100 group-hover:scale-110 transition-transform">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900">{user.name}</p>
                            <p className="text-xs text-neutral-400 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">{getRoleBadge(user.role)}</td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          user.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-medium text-neutral-500">
                        {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center gap-2">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl font-bold text-brand-600 hover:bg-brand-50">
                              Detail
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <p className="text-neutral-400 font-bold italic">Tidak ada user ditemukan.</p>
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

      {/* MODAL TAMBAH AHLI GIZI */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={closeModal}
        title="Tambah Ahli Gizi Baru"
      >
        <form className="space-y-4 pt-4" onSubmit={handleAddNutritionist}>
          <Input
            label="Nama Lengkap"
            icon={<FiUser />}
            placeholder=" S.Gz"
            value={newNutri.name}
            onChange={(e) => setNewNutri({ ...newNutri, name: e.target.value })}
          />
          <Input
            label="Email"
            icon={<FiMail />}
            type="email"
            placeholder="@dietcare.id"
            value={newNutri.email}
            onChange={(e) => setNewNutri({ ...newNutri, email: e.target.value })}
          />
          <Input
            label="Nomor HP"
            icon={<FiPhone />}
            placeholder="081234567890"
            value={newNutri.phone}
            onChange={(e) => setNewNutri({ ...newNutri, phone: e.target.value })}
          />
          <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2 border border-blue-100">
            <FiLock className="text-blue-600 mt-1 shrink-0" />
            <p className="text-xs text-blue-700">
              Password sementara akan di-generate otomatis dan dikirim melalui email undangan aktivasi.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={closeModal}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? <><FiLoader className="animate-spin mr-2 inline" /> Mengirim...</>
                : 'Kirim Undangan'
              }
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersManagement;
