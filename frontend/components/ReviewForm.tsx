'use client';

import React, { useState } from 'react';
import { FiStar, FiCheckCircle } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import api from '@/lib/api';

interface ReviewFormProps {
  programId: string | number;
  programName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ReviewForm = ({ programId, programName, isOpen, onClose, onSuccess }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Silakan pilih rating bintang');
      return;
    }
    if (content.length < 20) {
      setError('Review minimal 20 karakter');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await api.post('/client/reviews', {
        nutritionist_program_id: programId,
        rating,
        title,
        content,
        is_approved: isPublic,
      });
      setIsSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengirim review';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Review Terkirim">
        <div className="py-12 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-bounce">
              <FiCheckCircle size={40} />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Terima Kasih!</h3>
          <p className="text-gray-500 max-w-xs mx-auto">
            Review Anda sangat berarti bagi kami dan ahli gizi Anda.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Beri Review: ${programName}`}>
      <form onSubmit={handleSubmit} className="space-y-6 pt-4">
        {/* STAR RATING */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-gray-700">Bagaimana pengalamanmu?</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform active:scale-90"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <FiStar
                  size={32}
                  className={`${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-200'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Judul Review (Opsional)"
          placeholder="Contoh: Sangat Membantu!"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Isi Review</label>
          <textarea
            className="w-full rounded-md border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600"
            rows={4}
            placeholder="Ceritakan pengalamanmu mengikuti program ini..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider">
            <span className={content.length < 20 ? 'text-red-500' : 'text-green-600'}>
              {content.length} / 20 Karakter Minimal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublic"
            className="rounded text-green-600 focus:ring-green-500"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          <label htmlFor="isPublic" className="text-xs text-gray-500">
            Bolehkan review ini ditampilkan di website NutriPro?
          </label>
        </div>

        {error && (
          <p className="text-xs text-red-500 font-medium text-center">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button type="submit" className="flex-1" isLoading={isLoading}>
            Kirim Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewForm;
