'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiX, FiCheckCircle } from 'react-icons/fi';

export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if user has seen the exit popup in this session
    const hasSeenExitPopup = sessionStorage.getItem('hasSeenExitPopup');
    if (hasSeenExitPopup) {
      setHasShown(true);
      return;
    }

    // Exit intent detection - trigger when mouse leaves viewport from top
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is leaving from the top (going to address bar/close button)
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        // Remember for this session
        sessionStorage.setItem('hasSeenExitPopup', 'true');
      }
    };

    // Add event listener
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleCTA = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close popup"
          >
            <FiX className="text-xl text-gray-500" />
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🎉</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-black text-gray-800 mb-2">
              Tunggu Dulu!
            </h2>

            {/* Subtitle */}
            <p className="text-gray-600 mb-6">
              Sebelum pergi, coba dulu kalkulator gizi kami yang <span className="font-bold text-green-600">GRATIS 100%</span>
            </p>

            {/* Features */}
            <div className="space-y-3 mb-6 text-left">
              <div className="flex items-start gap-3">
                <FiCheckCircle className="text-green-500 text-xl flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-gray-800">Cek BMI & Kalori Harian</div>
                  <div className="text-sm text-gray-500">Tahu kebutuhan kalorimu dalam 2 menit</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiCheckCircle className="text-green-500 text-xl flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-gray-800">Menu Diet 3 Hari Indonesia</div>
                  <div className="text-sm text-gray-500">Sample meal plan makanan lokal</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiCheckCircle className="text-green-500 text-xl flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-gray-800">10 Kalkulator Lengkap</div>
                  <div className="text-sm text-gray-500">Usia tubuh, jadwal puasa, dan lainnya</div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <Link href="/kalkulator-gratis" onClick={handleCTA}>
                <button className="w-full bg-green-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl">
                  Coba Gratis Sekarang
                </button>
              </Link>

              <button
                onClick={handleClose}
                className="w-full text-gray-500 py-2 text-sm hover:text-gray-700 transition-colors"
              >
                Nanti aja
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
