import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { WaFloatingButton } from "@/components/WaFloatingButton";
import Script from "next/script";
import Providers from "./providers";
import ErrorBoundary from "@/components/ErrorBoundary";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DietCare - Konsultasi Gizi & Diet Online Profesional",
  description: "Transformasi kesehatan Anda bersama ahli gizi berlisensi. Program Body Goals, Body for Baby, dan Clinicare dengan panduan nutrisi berbasis sains.",
  keywords: ["konsultasi gizi", "diet online", "ahli gizi", "body goals", "diet sehat", "nutrisi ibu hamil", "diet diabetes"],
  authors: [{ name: "DietCare Team" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "DietCare - Konsultasi Gizi & Diet Online Profesional",
    description: "Transformasi kesehatan Anda bersama ahli gizi berlisensi. Program Body Goals, Body for Baby, dan Clinicare.",
    url: "https://dietcare.com",
    siteName: "DietCare",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DietCare - Konsultasi Gizi & Diet Online Profesional",
    description: "Transformasi kesehatan Anda bersama ahli gizi berlisensi.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "name": "DietCare",
    "alternateName": "DietCare",
    "url": "https://dietcare.com",
    "logo": "https://dietcare.com/favicon.ico",
    "image": "https://dietcare.com/hero-image.jpg",
    "sameAs": [
      "https://instagram.com/dietcare",
      "https://facebook.com/dietcare",
      "https://tiktok.com/@dietcare"
    ],
    "description": "Platform konsultasi gizi dan diet online profesional bersama ahli gizi berlisensi. Kami menyediakan program Body Goals, Body for Baby, dan Clinicare.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Ciwidey",
      "addressLocality": "Kabupaten Bandung",
      "addressRegion": "Jawa Barat",
      "addressCountry": "ID"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -6.2088,
      "longitude": 106.8456
    },
    "telephone": "+6285798137527",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "17:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "08:00",
        "closes": "12:00"
      }
    ],
    "medicalSpecialty": "Nutrition",
    "priceRange": "$$"
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://dietcare.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://dietcaresalma.com/blog?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakartaSans.variable} font-body antialiased min-h-screen`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationSchema, websiteSchema]) }}
        />
        <ErrorBoundary>
          <Providers>
            {children}
            <WaFloatingButton />
          </Providers>
        </ErrorBoundary>
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="lazyOnload"
        />
        <Script
          src="https://meet.jit.si/external_api.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
