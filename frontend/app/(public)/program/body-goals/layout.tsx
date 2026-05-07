import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Program Body Goals — Konsultasi Gizi Diet Bersama Ahli Gizi | DietCare",
  description:
    "Program diet sehat bersama ahli gizi tersertifikasi. Pilih program Body Goals sesuai kebutuhanmu. Mulai dari Rp 279.900.",
  openGraph: {
    title: "Program Body Goals — DietCare",
    description:
      "Capai berat badan idealmu dengan pendampingan ahli gizi tersertifikasi. Mulai dari Rp 279.900.",
    type: "website",
    locale: "id_ID",
    siteName: "DietCare",
  },
};

export default function BodyGoalsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
