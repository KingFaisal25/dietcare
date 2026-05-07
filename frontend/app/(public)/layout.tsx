import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DietCare — Konsultasi Gizi Online dengan Ahli Gizi Tersertifikasi',
  description:
    'Platform konsultasi gizi dan diet online profesional. Dapatkan program diet personal dari ahli gizi bersertifikasi MTKI. Turunkan berat badan, kontrol gula darah, dan capai target kesehatanmu.',
  keywords: [
    'konsultasi gizi online',
    'ahli gizi',
    'diet sehat',
    'program diet',
    'nutrisi',
    'DietCare',
    'turun berat badan',
    'meal plan',
  ],
  openGraph: {
    title: 'DietCare — Konsultasi Gizi Online',
    description:
      'Dapatkan program diet personal dari ahli gizi bersertifikasi MTKI. 500+ klien berhasil mencapai target kesehatan mereka.',
    type: 'website',
    locale: 'id_ID',
    siteName: 'DietCare',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DietCare — Konsultasi Gizi Online',
    description:
      'Program diet personal dari ahli gizi bersertifikasi. Mulai perjalanan hidup sehat Anda sekarang.',
  },
};

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
