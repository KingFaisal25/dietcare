"use client";

import Link from "next/link";
import { Check, Phone, Crown, Sparkles } from "lucide-react";
import { getWaLink } from "@/lib/wa";

export interface ProgramCardProps {
  programName: string;
  slug: string;
  tagline: string;
  price: number;
  originalPrice?: number;
  pricePerMonth?: string;
  duration: string;
  features: string[];
  isPopular?: boolean;
  isRecommended?: boolean;
  checkoutUrl?: string;
  waMessage?: string;
  onSelect?: () => void;
}

export default function ProgramCard({
  programName,
  slug,
  tagline,
  price,
  originalPrice,
  pricePerMonth,
  duration,
  features,
  isPopular = false,
  isRecommended = false,
  checkoutUrl,
  waMessage,
  onSelect,
}: ProgramCardProps) {
  const formattedPrice = `Rp ${price.toLocaleString("id-ID")}`;

  return (
    <div
      className={`relative flex flex-col rounded-3xl border-2 bg-white p-7 transition-all hover:shadow-xl ${
        isPopular
          ? "border-emerald-500 shadow-lg shadow-emerald-100 ring-1 ring-emerald-500"
          : isRecommended
            ? "border-emerald-400 shadow-md"
            : "border-gray-100 hover:border-gray-200"
      }`}
    >
      {/* Badge */}
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md">
          <Crown className="h-3 w-3" />
          Paling Populer
        </div>
      )}
      {!isPopular && isRecommended && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-sky-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md">
          <Sparkles className="h-3 w-3" />
          Recommended
        </div>
      )}

      {/* Header */}
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-gray-900">{programName}</h3>
        <p className="mt-1 text-sm text-gray-500">{tagline}</p>
      </div>

      {/* Price */}
      <div className="mb-6 text-center">
        {originalPrice && (
          <p className="text-sm text-gray-400 line-through">
            Rp {originalPrice.toLocaleString("id-ID")}
          </p>
        )}
        <p className="text-3xl font-extrabold text-gray-900">{formattedPrice}</p>
        {pricePerMonth && (
          <p className="mt-1 text-sm font-medium text-emerald-600">{pricePerMonth}/bulan</p>
        )}
        <p className="mt-1 text-sm text-gray-400">{duration}</p>
      </div>

      {/* Features */}
      <ul className="mb-8 flex-1 space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Link
        href={checkoutUrl ?? `/checkout?program=${slug}`}
        onClick={onSelect}
        className={`block w-full rounded-2xl py-3.5 text-center text-sm font-bold transition-all ${
          isPopular || isRecommended
            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700"
            : "border-2 border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-600"
        }`}
      >
        Beli Sekarang
      </Link>

      {/* WA link */}
      {waMessage && (
        <a
          href={getWaLink(waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-400 transition hover:text-emerald-600"
        >
          <Phone className="h-3.5 w-3.5" />
          Tanya via WA dulu
        </a>
      )}
    </div>
  );
}
