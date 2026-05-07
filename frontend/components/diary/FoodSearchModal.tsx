"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { 
  FiSearch, FiX, FiPlus, FiChevronLeft, FiHeart, FiClock, FiBookOpen 
} from 'react-icons/fi';
import { FaLeaf, FaCamera, FaCheckCircle } from 'react-icons/fa';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SkeletonListItem } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import api from '@/lib/api';
import debounce from 'lodash/debounce';
import { AnimatePresence, motion } from 'framer-motion';

interface FoodItem {
  id: number;
  name: string;
  category: string;
  nutrients_per_serving: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  serving: {
    size: number;
    unit: string;
    description: string;
  };
  image_url: string;
}

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: string;
  date: string;
  onAdd: () => void;
  onScanClick?: () => void;
  onManualClick?: () => void;
}

const FoodSearchModal = ({ isOpen, onClose, mealType, date, onAdd, onScanClick, onManualClick }: FoodSearchModalProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('all');

  const searchFoods = useMemo(
    () => debounce(async (q: string) => {
      if (!q) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/foods/search?q=${q}`);
        setResults(res.data.data);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (isOpen) {
      searchFoods(query);
    }
    return () => searchFoods.cancel();
  }, [query, searchFoods, isOpen]);

  const handleAddEntry = async () => {
    if (!selectedFood) return;

    try {
      const multiplier = quantity;
      await api.post('/diary', {
        food_id: selectedFood.id,
        food_name_snapshot: selectedFood.name,
        meal_type: mealType,
        quantity_gram: selectedFood.serving.size * multiplier,
        calories: selectedFood.nutrients_per_serving.calories * multiplier,
        protein: selectedFood.nutrients_per_serving.protein * multiplier,
        carbs: selectedFood.nutrients_per_serving.carbs * multiplier,
        fat: selectedFood.nutrients_per_serving.fat * multiplier,
        eaten_at: date,
        source: 'manual',
      });
      onAdd();
      onClose();
      setSelectedFood(null);
      setQuantity(1);
      setQuery('');
    } catch (err) {
      console.error('Failed to add entry', err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-4">
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-white w-full h-[92vh] md:max-w-xl md:h-[80vh] rounded-t-[32px] md:rounded-3xl flex flex-col overflow-hidden shadow-2xl"
        >
          {/* Mobile Handle */}
          <div className="md:hidden w-12 h-1.5 bg-neutral-200 rounded-full mx-auto my-3 shrink-0" />

          {/* Header */}
          <div className="px-6 py-4 flex items-center gap-4">
            {selectedFood ? (
              <button onClick={() => setSelectedFood(null)} className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors">
                <FiChevronLeft size={24} className="text-neutral-600" />
              </button>
            ) : (
              <div className="p-2 -ml-2 bg-brand-50 text-brand-600 rounded-xl">
                <FaLeaf size={20} />
              </div>
            )}
            <h2 className="text-xl font-black text-neutral-900 flex-1 truncate">
              {selectedFood ? 'Atur Porsi' : `Tambah ${mealType}`}
            </h2>
            <button onClick={onClose} className="p-2 -mr-2 hover:bg-neutral-100 rounded-full transition-colors">
              <FiX size={24} className="text-neutral-400" />
            </button>
          </div>

          {!selectedFood ? (
            <>
              {/* Search bar */}
              <div className="px-6 pb-4">
                <div className="relative group">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                  <Input
                    className="pl-12 pr-10 h-14 bg-neutral-50 border-2 border-transparent focus:border-brand-500 focus:bg-white rounded-2xl transition-all text-base font-medium"
                    placeholder="Cari nasi goreng, ayam, buah..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                  />
                  {query && (
                    <button 
                      onClick={() => setQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-neutral-200 text-neutral-500 rounded-full hover:bg-neutral-300 transition-colors"
                    >
                      <FiX size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="px-6 flex gap-6 border-b border-neutral-100 overflow-x-auto no-scrollbar shrink-0">
                {[
                  { id: 'all', label: 'Semua', icon: null },
                  { id: 'fav', label: '⭐ Favorit', icon: null },
                  { id: 'recent', label: '🕐 Baru-baru ini', icon: null },
                  { id: 'recipe', label: '🍽️ Resep Saya', icon: null },
                  { id: 'manual', label: '➕ Tambah Manual', icon: null },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === 'manual') onManualClick?.();
                      else setActiveTab(tab.id);
                    }}
                    className={`flex items-center gap-2 py-3 px-1 whitespace-nowrap border-b-2 font-bold text-sm transition-all ${
                      activeTab === tab.id ? 'border-brand-500 text-brand-600' : 'border-transparent text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    <SkeletonListItem />
                    <SkeletonListItem />
                    <SkeletonListItem />
                  </div>
                ) : results.length > 0 ? (
                  results.map((item) => (
                    <motion.button
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={item.id}
                      onClick={() => setSelectedFood(item)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-brand-50/50 rounded-2xl border border-neutral-100 transition-all text-left group"
                    >
                      <div className="w-14 h-14 bg-neutral-100 rounded-2xl overflow-hidden shrink-0 relative ring-2 ring-transparent group-hover:ring-brand-100 transition-all">
                        {item.image_url ? (
                          <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300 text-2xl">
                            🍱
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-neutral-900 truncate">{item.name}</h4>
                        <p className="text-xs font-medium text-neutral-400 mt-0.5">{item.serving.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-lg font-black text-brand-600">{Math.round(item.nutrients_per_serving.calories)}</span>
                        <span className="text-[10px] font-bold text-neutral-400 block uppercase">kkal</span>
                      </div>
                      <div className="p-2 rounded-xl bg-neutral-50 text-neutral-400 group-hover:bg-brand-500 group-hover:text-white transition-all">
                        <FiPlus size={20} />
                      </div>
                    </motion.button>
                  ))
                ) : query ? (
                  <div className="text-center py-12 space-y-6">
                    <EmptyState 
                      icon="🔍" 
                      title="Makanan tidak ditemukan" 
                      description={`Tidak menemukan "${query}"? Coba kata kunci lain atau gunakan fitur di bawah.`} 
                    />
                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                      <Button 
                        variant="outline" 
                        onClick={onScanClick}
                        className="rounded-2xl py-6 font-bold border-brand-200 text-brand-600 gap-2"
                      >
                        <FaCamera className="h-4 w-4" /> Barcode
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={onManualClick}
                        className="rounded-2xl py-6 font-bold border-brand-200 text-brand-600 gap-2"
                      >
                        <FiBookOpen className="h-4 w-4" /> Manual
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 space-y-4">
                    <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center mx-auto mb-2">
                      <FiSearch size={32} className="text-brand-500 opacity-40" />
                    </div>
                    <p className="text-neutral-400 font-bold max-w-[200px] mx-auto leading-relaxed">
                      Mulai cari makanan untuk log diary kamu
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Portion Adjustment View */
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 overflow-y-auto p-8 space-y-10"
            >
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-neutral-900">{selectedFood.name}</h3>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-neutral-100 text-neutral-500 text-xs font-bold">
                  1 porsi = {selectedFood.serving.size}{selectedFood.serving.unit} ({selectedFood.serving.description})
                </div>
              </div>

              <div className="flex justify-center">
                <div className="relative w-52 h-52">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                    <motion.circle 
                      cx="50" cy="50" r="45" fill="none" stroke="#16a34a" strokeWidth="8" 
                      strokeDasharray="282.7"
                      initial={{ strokeDashoffset: 282.7 }}
                      animate={{ strokeDashoffset: 282.7 * (1 - Math.min(quantity / 5, 1)) }}
                      transition={{ type: "spring", bounce: 0 }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-neutral-900 tracking-tighter">
                      {Math.round(selectedFood.nutrients_per_serving.calories * quantity)}
                    </span>
                    <span className="text-xs font-black text-neutral-400 uppercase tracking-widest mt-1">Kkal Total</span>
                  </div>
                </div>
              </div>

              {/* Portion Selector */}
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center px-2">
                    <span className="font-black text-neutral-900 uppercase tracking-wider text-xs">Jumlah Porsi</span>
                    <span className="text-2xl font-black text-brand-600">{quantity}x</span>
                  </div>
                  
                  {/* Custom Slider Style */}
                  <input 
                    type="range" min="0.5" max="5" step="0.5" 
                    value={quantity} onChange={(e) => setQuantity(parseFloat(e.target.value))}
                    className="w-full h-3 bg-neutral-100 rounded-full appearance-none cursor-pointer accent-brand-500"
                  />
                  
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                    {[0.5, 1, 1.5, 2, 100].map(val => (
                      <button 
                        key={val}
                        onClick={() => setQuantity(val === 100 ? 1 : val)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 ${
                          (val === 100 ? false : quantity === val) ? 'bg-brand-500 text-white shadow-green' : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
                        }`}
                      >
                        {val === 100 ? '100g' : `${val} porsi`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-8 border-t border-neutral-100">
                  <MacroBox label="Protein" value={selectedFood.nutrients_per_serving.protein * quantity} color="blue" />
                  <MacroBox label="Karbo" value={selectedFood.nutrients_per_serving.carbs * quantity} color="amber" />
                  <MacroBox label="Lemak" value={selectedFood.nutrients_per_serving.fat * quantity} color="red" />
                </div>
              </div>

              <Button 
                className="w-full h-16 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-lg font-black shadow-green transition-all active:scale-95 gap-3"
                onClick={handleAddEntry}
              >
                <FaCheckCircle /> Tambah ke {mealType}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

function MacroBox({ label, value, color }: { label: string, value: number, color: 'blue' | 'amber' | 'red' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-red-50 text-red-600 border-red-100'
  };
  return (
    <div className={`text-center p-4 rounded-2xl border ${colors[color]}`}>
      <span className="block text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">{label}</span>
      <span className="text-lg font-black">{Math.round(value)}<span className="text-[10px] ml-0.5">g</span></span>
    </div>
  );
}

export default FoodSearchModal;
