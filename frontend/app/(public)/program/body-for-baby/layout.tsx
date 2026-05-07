import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Program Body for Baby — Nutrisi Ibu Hamil & Menyusui | DietCare",
  description:
    "Program gizi khusus untuk ibu hamil, menyusui, dan program hamil. Didampingi ahli gizi klinis bersertifikat.",
  openGraph: {
    title: "Program Body for Baby — DietCare",
    description: "Nutrisi optimal untuk ibu dan buah hati. Didampingi ahli gizi bersertifikat.",
    type: "website",
    locale: "id_ID",
    siteName: "DietCare",
  },
};

export default function BodyForBabyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
