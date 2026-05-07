import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Program Clinicare — Gizi Klinis untuk Kondisi Medis Khusus | DietCare",
  description:
    "Program gizi klinis untuk diabetes, hipertensi, kolesterol, PCOS, asam urat, dan kondisi medis lainnya. Didampingi Ahli Gizi Klinis bersertifikat.",
  openGraph: {
    title: "Program Clinicare — DietCare",
    description: "Gizi klinis untuk kondisi medis khusus dengan ahli gizi klinis bersertifikat.",
    type: "website",
    locale: "id_ID",
    siteName: "DietCare",
  },
};

export default function ClinicareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
