'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { FiSearch } from 'react-icons/fi';

export function FoodSearchTool() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const search = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const res = await api.get(`/public/foods/search-local?q=${encodeURIComponent(query)}`);
      setResults(res.data.data || []);
      setHasSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Cari Kalori Makanan Lokal</h2>
      <form onSubmit={search} className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            placeholder="Ketik: Nasi padang, seblak..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '...' : <FiSearch />}
        </Button>
      </form>

      <div className="mt-6 space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {hasSearched && results.length === 0 && !isLoading && (
          <div className="text-center p-8 text-slate-500">
            Makanan tidak ditemukan. Coba kata kunci lain (misal: ayam, nasi).
          </div>
        )}

        {results.map((f, i) => (
          <div key={i} className="p-4 border border-slate-200 rounded-xl bg-white hover:border-emerald-300 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-slate-800">{f.name}</h3>
              <Badge>{f.calories} kkal</Badge>
            </div>

            <div className="flex gap-4 text-xs text-slate-500 mb-2">
              <span>Protein: {f.protein}g</span>
              <span>Karbo: {f.carbs}g</span>
              <span>Lemak: {f.fat}g</span>
            </div>

            <div className="bg-amber-50 text-amber-800 p-2 rounded text-xs font-medium">
              {f.warning}
            </div>
          </div>
        ))}

        {!hasSearched && (
          <div className="text-center p-8 text-slate-400 text-sm">
            Ketik nama makanan di atas untuk melihat kalori dan peringatannya.
          </div>
        )}
      </div>
    </div>
  );
}
