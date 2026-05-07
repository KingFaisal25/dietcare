"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/Button";

const programs = [
  { id: 1, name: "Simpel", duration: "14 Hari" },
  { id: 2, name: "Intensif", duration: "30 Hari" },
  { id: 3, name: "Intensif+", duration: "60 Hari" },
];

function SuccessContent() {
  const searchParams = useSearchParams();
  const programIdParam = searchParams.get("program_id");
  const programId = programIdParam ? parseInt(programIdParam, 10) : 2;

  const program = programs.find((p) => p.id === programId) || programs[1];

  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = window.setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="mb-8 flex justify-center">
        <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Pembayaran Berhasil!
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        Terima kasih telah bergabung dengan DietCare. Perjalanan sehat Anda dimulai sekarang.
      </p>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 text-left mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Ringkasan Program
        </h2>
        <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
          <span className="text-gray-600 dark:text-gray-400">Program</span>
          <span className="font-medium text-gray-900 dark:text-white">{program.name}</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
          <span className="text-gray-600 dark:text-gray-400">Durasi</span>
          <span className="font-medium text-gray-900 dark:text-white">{program.duration}</span>
        </div>
        
        <div className="mt-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Langkah Selanjutnya:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-2">
            <li>Isi data gizi dan kesehatan Anda secara lengkap.</li>
            <li>Jadwalkan konsultasi awal dengan ahli gizi kami.</li>
            <li>Dapatkan meal plan personal Anda.</li>
          </ol>
        </div>
      </div>

      <Link href="/onboarding" passHref>
        <Button size="lg" className="w-full sm:w-auto px-8">
          Mulai Isi Data Gizi
        </Button>
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
