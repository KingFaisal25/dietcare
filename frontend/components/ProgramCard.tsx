"use client";

import Link from "next/link";
import { Check, Crown, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "./ui/Button";
import { TiltCard } from "./ui/TiltCard";

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
  onSelect,
}: ProgramCardProps) {
  const formattedPrice = `Rp ${price.toLocaleString("id-ID")}`;

  return (
    <TiltCard
      className={`relative flex flex-col rounded-[2rem] border-2 bg-white p-8 transition-all duration-spring ${
        isPopular
          ? "border-brand-500 shadow-green"
          : isRecommended
            ? "border-brand-200 shadow-float"
            : "border-neutral-100 hover:border-brand-100 shadow-card"
      }`}
    >
      {/* Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-green">
          <Crown className="h-3 w-3" />
          Paling Populer
        </div>
      )}
      {!isPopular && isRecommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-float">
          <Sparkles className="h-3 w-3" />
          Direkomendasikan
        </div>
      )}

      {/* Header */}
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-black tracking-tight text-neutral-900">{programName}</h3>
        <p className="mt-2 text-sm font-medium text-neutral-500">{tagline}</p>
      </div>

      {/* Price */}
      <div className="mb-8 text-center bg-brand-50/50 rounded-3xl p-6">
        {originalPrice && (
          <p className="mb-1 text-xs font-bold text-neutral-400 line-through">
            Rp {originalPrice.toLocaleString("id-ID")}
          </p>
        )}
        <p className="text-4xl font-black text-neutral-900">{formattedPrice}</p>
        {pricePerMonth && (
          <p className="mt-2 text-sm font-bold text-brand-600">{pricePerMonth}/bulan</p>
        )}
        <div className="mt-3 inline-block px-3 py-1 bg-white rounded-full border border-brand-100 text-[10px] font-bold text-brand-600 uppercase tracking-wider">
          {duration}
        </div>
      </div>

      {/* Features */}
      <ul className="mb-8 flex-1 space-y-4">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <Check className="h-3 w-3 stroke-[3px]" />
            </div>
            <span className="text-sm font-medium text-neutral-600 leading-snug">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Link
        href={checkoutUrl ?? `/checkout?program=${slug}`}
        onClick={onSelect}
        className="block w-full"
      >
        <Button 
          variant={isPopular || isRecommended ? "primary" : "secondary"}
          className="w-full h-14 group"
        >
          Pilih Program Ini
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </TiltCard>
  );
}
