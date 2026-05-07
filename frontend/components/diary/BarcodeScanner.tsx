'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { FiX, FiCamera, FiZap } from 'react-icons/fi';
import { BsKeyboard } from 'react-icons/bs';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  onManualInput?: () => void;
}

const BarcodeScanner = ({ onScan, onClose, onManualInput }: BarcodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [torch, setTorch] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let controls: IScannerControls | undefined;

    const startScanning = async () => {
      try {
        const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
        const backCamera = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        ) || videoInputDevices[0];

        if (!backCamera) {
          setError('Kamera tidak ditemukan');
          return;
        }

        controls = await codeReader.decodeFromVideoDevice(
          backCamera.deviceId,
          videoRef.current!,
          (result) => {
            if (result) {
              setIsSuccess(true);
              if (navigator.vibrate) navigator.vibrate(200);
              
              setTimeout(() => {
                onScan(result.getText());
                if (controls) controls.stop();
              }, 500);
            }
          }
        );
      } catch (err: unknown) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'Gagal mengakses kamera.';
        setError(`${errorMessage} Pastikan izin kamera diberikan.`);
      }
    };

    startScanning();

    return () => {
      if (controls) {
        controls.stop();
      }
    };
  }, [onScan]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col"
    >
      {/* HEADER OVERLAY */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 flex items-center justify-between text-white bg-gradient-to-b from-black/60 to-transparent">
        <button 
          onClick={onClose} 
          className="p-3 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-all border border-white/10"
        >
          <FiX size={24} />
        </button>
        <h3 className="text-lg font-black tracking-tight">Scan Barcode</h3>
        <button 
          onClick={() => setTorch(!torch)}
          className={`p-3 backdrop-blur-md rounded-2xl transition-all border ${
            torch ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-white/10 text-white border-white/10'
          }`}
        >
          <FiZap size={24} />
        </button>
      </div>

      {/* CAMERA VIEW */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {error ? (
          <div className="text-white text-center p-8 max-w-sm">
            <div className="h-20 w-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiCamera size={40} className="text-red-500" />
            </div>
            <h4 className="text-xl font-bold mb-2">Akses Kamera Gagal</h4>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">{error}</p>
            <Button onClick={onClose} className="w-full bg-white text-black font-bold py-6 rounded-2xl">
              Kembali
            </Button>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" />
            
            {/* SCANNING OVERLAY */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="relative w-[280px] h-[280px]">
                {/* Frame Corners */}
                <div className={`absolute inset-0 border-2 rounded-[32px] transition-all duration-500 ${isSuccess ? 'border-brand-500 bg-brand-500/10' : 'border-white/20'}`} />
                
                {/* Brackets */}
                <div className={`absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 rounded-tl-[32px] transition-colors duration-500 ${isSuccess ? 'border-brand-500' : 'border-brand-500'}`} />
                <div className={`absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 rounded-tr-[32px] transition-colors duration-500 ${isSuccess ? 'border-brand-500' : 'border-brand-500'}`} />
                <div className={`absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 rounded-bl-[32px] transition-colors duration-500 ${isSuccess ? 'border-brand-500' : 'border-brand-500'}`} />
                <div className={`absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 rounded-br-[32px] transition-colors duration-500 ${isSuccess ? 'border-brand-500' : 'border-brand-500'}`} />

                {/* Scan Line Animation */}
                {!isSuccess && (
                  <motion.div 
                    animate={{ top: ["5%", "95%", "5%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    className="absolute left-[5%] right-[5%] h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_rgba(239,68,68,0.8)] z-10"
                  />
                )}

                {/* Success Indicator */}
                <AnimatePresence>
                  {isSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-brand-500/20 rounded-[32px]"
                    >
                      <div className="h-16 w-16 bg-brand-500 rounded-full flex items-center justify-center shadow-lg shadow-brand-500/40">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <motion.path 
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={3} 
                            d="M5 13l4 4L19 7" 
                          />
                        </svg>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-12 text-center space-y-2">
                <p className="text-white font-bold text-lg">Arahkan kamera ke barcode</p>
                <p className="text-white/50 text-sm">Posisikan barcode di dalam kotak</p>
              </div>
            </div>

            {/* BOTTOM ACTIONS */}
            <div className="absolute bottom-12 left-0 right-0 px-8 flex flex-col items-center gap-6">
              <button 
                onClick={onManualInput}
                className="flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-bold hover:bg-white/20 transition-all active:scale-95"
              >
                <BsKeyboard className="h-5 w-5" />
                Ketik Barcode Manual
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default BarcodeScanner;
