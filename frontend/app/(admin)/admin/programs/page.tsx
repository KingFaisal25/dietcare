'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FiEdit2, FiExternalLink, FiPlus, FiLoader, FiActivity, FiTrash2 } from 'react-icons/fi';
import api from '@/lib/api';
import Link from 'next/link';
import { toast } from 'sonner';

const ProgramsManagement = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrograms = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/programs');
      setPrograms(res.data || []);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
      toast.error('Gagal mengambil data program');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProgram = async (id: number, name: string) => {
    if (!confirm(`Hapus program "${name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await api.delete(`/admin/programs/${id}`);
      toast.success('Program berhasil dihapus');
      fetchPrograms();
    } catch {
      toast.error('Gagal menghapus program');
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="p-6 space-y-8 bg-surface-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 leading-tight">Kelola Program</h1>
          <p className="text-neutral-500 text-sm font-medium">Manajemen layanan konsultasi dan paket harga</p>
        </div>
        <Link href="/admin/programs/new">
          <Button className="bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-100">
            <FiPlus className="mr-2" /> Program Baru
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <FiLoader className="w-10 h-10 text-brand-500 animate-spin" />
          <p className="text-neutral-400 font-bold italic">Memuat daftar program...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.length > 0 ? programs.map((program) => (
            <Card key={program.id} className="overflow-hidden group border-none shadow-sm hover:shadow-2xl hover:shadow-brand-100/50 transition-all rounded-[32px] bg-white relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-bl-[3rem] -mr-8 -mt-8 group-hover:bg-brand-100 transition-colors" />
              
              <div className="p-8 space-y-6 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 text-xl font-black border border-brand-100 group-hover:scale-110 transition-transform">
                    {program.name.charAt(0)}
                  </div>
                  <Badge variant={program.is_active ? 'success' : 'default'} className="font-black uppercase tracking-widest text-[10px] py-1 px-3">
                    {program.is_active ? 'Aktif' : 'Draft'}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-xl font-black text-neutral-900 group-hover:text-brand-600 transition-colors leading-tight">{program.name}</h3>
                  <p className="text-xs text-neutral-400 font-bold tracking-wider mt-1">/{program.slug}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-6 border-y border-neutral-50">
                  <div className="space-y-1">
                    <p className="text-[10px] text-neutral-400 uppercase font-black tracking-[0.15em]">Harga</p>
                    <p className="font-black text-neutral-900 text-lg">{formatRupiah(program.price || 0)}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] text-neutral-400 uppercase font-black tracking-[0.15em]">Fitur</p>
                    <p className="font-black text-neutral-900 text-lg">{Array.isArray(program.features) ? program.features.length : 0} item</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/admin/programs/${program.id}/edit`} className="flex-1">
                    <Button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl h-11">
                      <FiEdit2 className="mr-1.5" /> Edit
                    </Button>
                  </Link>
                  <button
                    onClick={() => deleteProgram(program.id, program.name)}
                    className="px-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all border border-red-100 flex items-center justify-center h-11"
                    title="Hapus Program"
                  >
                    <FiTrash2 className="w-4.5 h-4.5" />
                  </button>
                  <Link href={`/program/${program.slug}`} target="_blank" className="flex-1">
                    <Button variant="ghost" className="w-full font-bold text-neutral-600 hover:bg-neutral-50 rounded-xl border-2 border-neutral-50 h-11">
                      <FiExternalLink className="mr-1.5" /> Preview
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )) : (
            <div className="col-span-full py-20 text-center bg-neutral-50 rounded-[32px] border-2 border-dashed border-neutral-200">
              <FiActivity className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-400 font-bold italic">Belum ada program yang dibuat.</p>
              <Link href="/admin/programs/new">
                <Button className="mt-6 bg-brand-500 text-white font-bold rounded-xl">Buat Program Pertama</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgramsManagement;
