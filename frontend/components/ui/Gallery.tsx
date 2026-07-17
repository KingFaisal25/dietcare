"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMaximize2, FiX, FiChevronLeft, FiChevronRight, FiFilter } from 'react-icons/fi';

interface GalleryImage {
  id: number;
  url: string;
  title: string;
  category: string;
  description?: string;
}

interface GalleryProps {
  images: GalleryImage[];
  categories: string[];
}

export function Gallery({ images, categories }: GalleryProps) {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const filteredImages = activeCategory === 'Semua' 
    ? images 
    : images.filter(img => img.category === activeCategory);

  const openLightbox = (image: GalleryImage, index: number) => {
    setSelectedImage(image);
    setSelectedIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => {
    const nextIdx = (selectedIndex + 1) % filteredImages.length;
    setSelectedIndex(nextIdx);
    setSelectedImage(filteredImages[nextIdx]);
  };

  const prevImage = () => {
    const prevIdx = (selectedIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedIndex(prevIdx);
    setSelectedImage(filteredImages[prevIdx]);
  };

  return (
    <div className="space-y-12">
      {/* 1. Category Filter */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2 mr-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">
          <FiFilter /> Filter
        </div>
        {['Semua', ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 border ${
              activeCategory === cat
                ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200'
                : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 2. Image Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredImages.map((img, idx) => (
            <motion.div
              key={img.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="group relative aspect-square rounded-[2.5rem] overflow-hidden bg-slate-100 cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500"
              onClick={() => openLightbox(img, idx)}
            >
              <Image
                src={img.url}
                alt={img.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8AKpT0W8yQAAAABJRU5ErkJggg=="
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-green-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-8 text-center">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  whileHover={{ y: 0, opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mx-auto border border-white/30">
                    <FiMaximize2 size={24} />
                  </div>
                  <div>
                    <p className="text-white font-black text-lg">{img.title}</p>
                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">{img.category}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* 3. Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 md:p-12"
          >
            {/* Close Button */}
            <button 
              onClick={closeLightbox}
              className="absolute top-8 right-8 w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-50 border border-white/10"
            >
              <FiX size={32} />
            </button>

            {/* Navigation Buttons */}
            <button 
              onClick={prevImage}
              className="absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-50 border border-white/10"
            >
              <FiChevronLeft size={32} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-50 border border-white/10"
            >
              <FiChevronRight size={32} />
            </button>

            {/* Image Content */}
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <motion.div 
                key={selectedImage.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className="relative w-full h-[70vh] max-w-5xl"
              >
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 text-center max-w-2xl"
              >
                <span className="px-4 py-1.5 rounded-full bg-green-500 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block">
                  {selectedImage.category}
                </span>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-4">{selectedImage.title}</h3>
                {selectedImage.description && (
                  <p className="text-slate-400 text-lg leading-relaxed">{selectedImage.description}</p>
                )}
                <p className="text-slate-600 font-bold mt-8 text-sm uppercase tracking-widest">
                  {selectedIndex + 1} dari {filteredImages.length}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
