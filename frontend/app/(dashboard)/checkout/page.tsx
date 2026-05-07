"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import api from "@/lib/api";

interface ApiErrorResponse {
  message?: string;
}

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess: () => void;
          onPending: () => void;
          onError: () => void;
          onClose: () => void;
        }
      ) => void;
    };
  }
}

const programs = [
  {
    id: 1,
    name: "Simpel",
    price: 150000,
    duration: "14 Hari",
    features: ["Konsultasi Awal", "Meal Plan 14 Hari", "Evaluasi Akhir"],
  },
  {
    id: 2,
    name: "Intensif",
    price: 250000,
    duration: "30 Hari",
    features: [
      "Konsultasi Awal",
      "Meal Plan 30 Hari",
      "Tanya Jawab via WA 30 Hari",
      "Evaluasi Mingguan",
    ],
  },
  {
    id: 3,
    name: "Intensif+",
    price: 450000,
    duration: "60 Hari",
    features: [
      "Konsultasi Awal",
      "Meal Plan 60 Hari",
      "Tanya Jawab via WA 60 Hari",
      "Evaluasi Mingguan",
      "Penyesuaian Meal Plan",
    ],
  },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const programIdParam = searchParams.get("program_id");
  const programId = programIdParam ? parseInt(programIdParam, 10) : 2; // Default to 2 (Intensif)

  const program = programs.find((p) => p.id === programId) || programs[1];

  const [promoCode, setPromoCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePayment = async () => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      // Panggil API POST /api/payment/create (sesuai route backend)
      const response = await api.post("/payment/create", {
        program_id: program.id,
        // Asumsi nutritionist_id dikirim statis atau didapat dari state lain
        nutritionist_id: 1, 
      });

      const token = response.data.order?.midtrans_token;

      if (!token) {
        throw new Error("Token pembayaran tidak ditemukan.");
      }

      // Tampilkan Midtrans Snap
      window.snap.pay(token, {
        onSuccess: function () {
          router.push(`/checkout/success?program_id=${program.id}`);
        },
        onPending: function () {
          setErrorMsg("Pembayaran tertunda. Silakan selesaikan pembayaran Anda.");
          setIsLoading(false);
        },
        onError: function () {
          setErrorMsg("Pembayaran gagal. Silakan coba lagi.");
          setIsLoading(false);
        },
        onClose: function () {
          setErrorMsg("Anda menutup popup pembayaran sebelum menyelesaikan transaksi.");
          setIsLoading(false);
        },
      });
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      console.error(error);
      setErrorMsg(
        apiError.response?.data?.message || "Terjadi kesalahan saat memproses pesanan."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Checkout Program
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Detail Program */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Ringkasan Pesanan
          </h2>
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
              {program.name}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Durasi: {program.duration}
            </p>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Fitur yang Anda dapatkan:
            </h4>
            <ul className="space-y-2">
              {program.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                  <svg
                    className="w-5 h-5 text-green-500 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Form Pembayaran */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Pembayaran
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kode Promo (Opsional)
              </label>
              <div className="flex gap-2">
                <Input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Masukkan kode promo"
                  className="flex-1"
                />
                <Button variant="outline">Terapkan</Button>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">Harga Program</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  Rp {program.price.toLocaleString("id-ID")}
                </span>
              </div>
              {/* Jika ada diskon bisa ditampilkan di sini */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  Total Bayar
                </span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  Rp {program.price.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm">
                {errorMsg}
              </div>
            )}
          </div>

          <Button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full py-4 text-lg font-medium flex justify-center items-center"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Memproses...
              </>
            ) : (
              "Bayar Sekarang"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
