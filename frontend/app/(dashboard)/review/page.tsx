'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FiEdit3, FiStar, FiMessageCircle } from 'react-icons/fi';
import api from '@/lib/api';
import ReviewForm from '@/components/ReviewForm';
import ReviewCard from '@/components/ReviewCard';

interface Program {
  id: string;
  order_id: string;
  status: string;
  program: {
    name: string;
  };
  nutritionist: {
    name: string;
  };
  review?: Review;
}

interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  created_at: string;
  client: {
    name: string;
    avatar?: string;
  };
  nutritionist_program: {
    program: {
      name: string;
    };
  };
}

const ReviewPage = () => {
  const [completedPrograms, setCompletedPrograms] = useState<Program[]>([]);
  const [submittedReviews, setSubmittedReviews] = useState<Review[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Assuming /api/client/profile returns nutritionistPrograms
      const res = await api.get('/client/profile');
      const allPrograms: Program[] = res.data.nutritionist_programs || [];
      
      // Filter programs that are completed and NOT reviewed
      setCompletedPrograms(allPrograms.filter((p) => p.status === 'completed' && !p.review));
      
      // Get all reviews (you might need a separate endpoint for this, or extract from user data)
      // For now, let's extract from all programs that have a review
      const reviews: Review[] = allPrograms.filter((p) => p.review).map((p) => ({
        id: p.review!.id,
        rating: p.review!.rating,
        title: p.review!.title,
        content: p.review!.content,
        created_at: p.review!.created_at,
        client: { name: res.data.name, avatar: res.data.avatar },
        nutritionist_program: { program: p.program }
      }));
      
      setSubmittedReviews(reviews);
      
    } catch (err) {
      console.error('Failed to fetch programs', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (program: Program) => {
    setSelectedProgram(program);
    setIsFormOpen(true);
  };

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Review & Rating</h1>
          <p className="text-gray-500 text-sm">Bagikan pengalamanmu bersama para ahli gizi NutriPro</p>
        </div>
      </div>

      {/* PROGRAMS WAITING FOR REVIEW */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
          <FiStar className="text-yellow-500" /> Butuh Review
        </h2>
        
        {completedPrograms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedPrograms.map((program) => (
              <Card key={program.id} className="p-5 flex flex-col justify-between border-l-4 border-l-green-600">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="success">Program Selesai</Badge>
                    <span className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter">
                      ID: {program.order_id}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">{program.program.name}</h3>
                  <p className="text-sm text-gray-500">Ahli Gizi: {program.nutritionist.name}</p>
                </div>
                <Button 
                  className="mt-4 w-full" 
                  size="sm"
                  onClick={() => handleOpenForm(program)}
                >
                  <FiEdit3 className="mr-2" /> Beri Rating & Review
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 text-sm italic">Tidak ada program yang menunggu review.</p>
            </div>
          )
        )}
      </section>

      {/* SUBMITTED REVIEWS */}
      <section className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
          <FiMessageCircle className="text-blue-500" /> Review Saya
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {submittedReviews.length > 0 ? (
            submittedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          ) : (
            !isLoading && (
              <div className="md:col-span-2 p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 text-sm italic">Kamu belum pernah memberikan review.</p>
              </div>
            )
          )}
        </div>
      </section>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      )}

      {/* REVIEW FORM MODAL */}
      {selectedProgram && (
        <ReviewForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={fetchData}
          programId={selectedProgram.id}
          programName={selectedProgram.program.name}
        />
      )}
    </div>
  );
};

export default ReviewPage;
