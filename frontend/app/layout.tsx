import type { Metadata } from "next";
import "./globals.css";
import { WaFloatingButton } from "@/components/WaFloatingButton";
import Script from "next/script";
import Providers from "./providers";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "DietCare - Konsultasi Gizi Online",
  description: "Platform konsultasi gizi dan diet online profesional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      <body className="font-body antialiased min-h-screen">
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
