'use client';

import React from 'react';
import Image from 'next/image';
import { FiStar } from 'react-icons/fi';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ReviewCardProps {
  review: {
    client: {
      name: string;
      avatar?: string;
    };
    rating: number;
    title?: string;
    content: string;
    nutritionist_program: {
      program: {
        name: string;
      };
    };
    created_at: string;
  };
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const formatName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[1][0]}.`;
    }
    return name;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {review.client.avatar ? (
            <Image
              src={review.client.avatar}
              alt={review.client.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-50"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">
              {getInitials(review.client.name)}
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-gray-900">{formatName(review.client.name)}</p>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
              {review.nutritionist_program.program.name}
            </p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <FiStar
              key={i}
              size={14}
              className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
            />
          ))}
        </div>
      </div>

      {review.title && (
        <h4 className="text-sm font-bold text-gray-800 mb-1">{review.title}</h4>
      )}
      <p className="text-sm text-gray-600 leading-relaxed italic">
        &quot;{review.content}&quot;
      </p>

      <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
        <span className="text-[10px] text-gray-400 font-medium">
          {format(new Date(review.created_at), 'd MMMM yyyy', { locale: id })}
        </span>
      </div>
    </div>
  );
};

export default ReviewCard;
