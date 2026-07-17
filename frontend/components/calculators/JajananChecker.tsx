'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { FiCoffee, FiSearch, FiZap } from 'react-icons/fi';

interface JajananItem {
  name: string;
  category: string;
  serving: string;
  calories: number;
  sugar_g: number;
  caffeine_mg: number;
  tags: string[];
  warning: string;
}

export function JajananChecker() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<JajananItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = async (keyword?: string) => {
    setIsLoading(true);
    setError('');

    try {
      const suffix = keyword?.trim() ? `?q=${encodeURIComponent(keyword.trim())}` : '';
      const response = await api.get(`/public/foods/jajanan${suffix}`);
      setItems((response.data.data as JajananItem[]) || []);
      setHasLoaded(true);
    } catch (err: unknown) {
      setError('Gagal mengambil data jajanan. Coba ulangi lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const topWarning = useMemo(() => {
    const highest = [...items].sort((a, b) => b.calories - a.calories)[0];
    return highest?.name ?? null;
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Cek Kalori Jajanan & Kopi Kekinian</h2>
        <p className="text-sm text-slate-500">
          Cari minuman viral, kopi susu, atau jajanan favorit lalu cek estimasi kalorinya dengan cepat.
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          fetchItems(query);
        }}
        className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Contoh: boba, kopi, seblak, croffle"
            className="h-14 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
          <Button type="submit" isLoading={isLoading} className="sm:min-w-[180px]" icon={<FiSearch />}>
            Cari Jajanan
          </Button>
        </div>
      </form>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {hasLoaded && !error && (
        <div className="space-y-4">
          {topWarning && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <span className="font-black uppercase tracking-widest text-xs">Highlight</span>
              <p className="mt-2 font-medium">
                Item paling padat kalori pada hasil ini: <span className="font-black">{topWarning}</span>
              </p>
            </div>
          )}

          {items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
              <p className="text-base font-bold text-slate-700">Belum ada hasil yang cocok.</p>
              <p className="mt-2 text-sm text-slate-500">Coba kata kunci seperti `kopi`, `boba`, `dimsum`, atau `seblak`.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((item) => (
                <div key={item.name} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{item.name}</h3>
                      <p className="text-sm text-slate-500">{item.category} · {item.serving}</p>
                    </div>
                    <Badge variant="success">{item.calories} kkal</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-rose-50 p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-rose-600">Gula</p>
                      <p className="mt-1 text-lg font-black text-rose-900">{item.sugar_g} g</p>
                    </div>
                    <div className="rounded-2xl bg-blue-50 p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Kafein</p>
                      <p className="mt-1 text-lg font-black text-blue-900">{item.caffeine_mg} mg</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                    <div className="flex items-center gap-2 font-black text-slate-900">
                      <FiZap className="h-4 w-4 text-amber-500" />
                      Catatan Gizi
                    </div>
                    <p className="mt-2">{item.warning}</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                    <FiCoffee className="h-3.5 w-3.5" />
                    Pilih versi less sugar untuk opsi yang lebih aman
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
