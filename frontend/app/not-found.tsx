import Link from 'next/link';
import { FiArrowLeft, FiMessageSquare } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Funny Illustration Placeholder */}
        <div className="relative">
          <div className="text-[150px] font-black text-green-50/50 absolute inset-0 flex items-center justify-center -z-10 select-none">
            404
          </div>
          <div className="w-48 h-48 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-inner border-4 border-white">
            <span className="text-6xl">🥗</span>
          </div>
          <div className="absolute -bottom-2 right-1/4 bg-yellow-400 text-gray-900 text-[10px] font-black px-2 py-1 rounded-md rotate-12 shadow-md uppercase">
            Kesasar ya?
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black text-gray-900">Halaman Tidak Ditemukan 😅</h1>
          <p className="text-gray-500 leading-relaxed">
            Sepertinya ahli gizi kami lupa menaruh resep di halaman ini, atau halamannya memang tidak pernah ada.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/">
            <Button className="w-full py-6 text-lg font-bold">
              <FiArrowLeft className="mr-2" /> Kembali ke Beranda
            </Button>
          </Link>
          <Link href="https://wa.me/6281234567890" target="_blank">
            <Button variant="outline" className="w-full py-6 text-lg font-bold border-green-600 text-green-600 hover:bg-green-50">
              <FiMessageSquare className="mr-2" /> Hubungi Kami via WA
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-400 pt-4">
          NutriPro &copy; 2024. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
