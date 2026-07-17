'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { FiClock, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';

interface RecipeMatch {
  name: string;
  description: string;
  cook_time_minutes: number;
  difficulty: string;
  estimated_calories: number;
  ingredients: string[];
  matched_ingredients: string[];
  missing_ingredients: string[];
  steps: string[];
  score: number;
}

interface RecipeResponse {
  selected_ingredients: string[];
  recipes: RecipeMatch[];
  suggestion?: string;
}

const QUICK_INGREDIENTS = [
  'telur',
  'nasi',
  'ayam',
  'bawang',
  'tomat',
  'wortel',
  'brokoli',
  'tahu',
  'kol',
  'keju',
  'mi',
  'roti',
];

export function RecipeGenerator() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<RecipeResponse | null>(null);

  const canSubmit = useMemo(() => ingredients.length > 0 && ingredients.length <= 8, [ingredients]);

  const addIngredient = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized || ingredients.includes(normalized) || ingredients.length >= 8) return;
    setIngredients((current) => [...current, normalized]);
    setDraft('');
  };

  const removeIngredient = (value: string) => {
    setIngredients((current) => current.filter((item) => item !== value));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/public/calculate/recipe-generator', {
        ingredients,
      });

      setResult(response.data.data as RecipeResponse);
    } catch (err: unknown) {
      setError('Gagal mencari resep. Coba lagi dalam beberapa saat.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Isi Kulkas Jadi Apa?</h2>
        <p className="text-sm text-slate-500">
          Masukkan bahan yang Anda punya, lalu kami carikan ide resep praktis yang paling cocok.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 space-y-4">
        <label className="text-xs font-black uppercase tracking-widest text-slate-500">
          Bahan yang tersedia
        </label>

        <div className="flex flex-wrap gap-2">
          {ingredients.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => removeIngredient(item)}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-200"
            >
              {item}
              <FiTrash2 className="h-3.5 w-3.5" />
            </button>
          ))}
          {ingredients.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-400">
              Belum ada bahan ditambahkan.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addIngredient(draft);
              }
            }}
            placeholder="Contoh: telur, nasi, bawang"
            className="h-14 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
          <Button
            type="button"
            onClick={() => addIngredient(draft)}
            variant="outline"
            className="sm:min-w-[160px]"
            icon={<FiPlus />}
          >
            Tambah Bahan
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_INGREDIENTS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => addIngredient(item)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              + {item}
            </button>
          ))}
        </div>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          isLoading={isLoading}
          className="w-full"
          icon={<FiSearch />}
        >
          Cari Ide Resep
        </Button>

        <p className="text-xs text-slate-400">
          Maksimal 8 bahan. Semakin spesifik, hasil resep semakin relevan.
        </p>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-4">
          {result.recipes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
              <p className="text-base font-bold text-slate-700">Belum ketemu resep yang pas.</p>
              <p className="mt-2 text-sm text-slate-500">{result.suggestion}</p>
            </div>
          ) : (
            result.recipes.map((recipe) => (
              <div key={recipe.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900">{recipe.name}</h3>
                    <p className="text-sm text-slate-500">{recipe.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="success">{recipe.score} bahan cocok</Badge>
                    <Badge variant="outline">
                      <FiClock className="h-3.5 w-3.5" />
                      {recipe.cook_time_minutes} menit
                    </Badge>
                    <Badge variant="outline">{recipe.estimated_calories} kkal</Badge>
                    <Badge variant="outline">{recipe.difficulty}</Badge>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Sudah ada</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {recipe.matched_ingredients.map((item) => (
                        <Badge key={item} variant="success">{item}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-amber-50 p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-amber-700">Perlu ditambah</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {recipe.missing_ingredients.length > 0 ? (
                        recipe.missing_ingredients.map((item) => (
                          <Badge key={item} variant="warning">{item}</Badge>
                        ))
                      ) : (
                        <span className="text-sm font-medium text-amber-700">Semua bahan utama sudah siap.</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Langkah singkat</p>
                  <ol className="mt-3 space-y-2 text-sm text-slate-700">
                    {recipe.steps.map((step, index) => (
                      <li key={step} className="flex gap-3">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
