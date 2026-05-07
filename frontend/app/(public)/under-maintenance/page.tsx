'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FiSettings, FiCheckCircle } from 'react-icons/fi';

const MaintenancePage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, save to waiting list API
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-green-600 flex items-center justify-center px-6 py-20">
      <div className="max-w-2xl w-full">
        <Card className="p-8 md:p-12 text-center space-y-8 shadow-2xl border-none">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
            <FiSettings size={48} />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900">Fitur Sedang Dalam Pemeliharaan</h1>
            <p className="text-gray-500 leading-relaxed max-w-md mx-auto">
              Kami sedang meracik bumbu terbaik untuk meningkatkan pengalaman sehatmu. Fitur ini akan segera kembali dengan tampilan yang lebih segar!
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 max-w-xs mx-auto">
            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
              <span>Progress</span>
              <span>85%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 w-[85%] rounded-full"></div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm font-bold text-gray-700">Ingin tahu saat sudah siap?</p>
                <div className="flex flex-col md:flex-row gap-3">
                  <Input 
                    placeholder="Alamat email kamu" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Button type="submit">Beritahu Saya</Button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 text-green-600 font-bold bg-green-50 p-4 rounded-xl border border-green-100">
                <FiCheckCircle />
                <span>Terima kasih! Kami akan segera kabari Anda.</span>
              </div>
            )}
          </div>
        </Card>
        
        <p className="text-center text-white/60 text-xs mt-8">
          NutriPro Diet Care Indonesia &copy; 2024
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;
