"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Star, CheckCircle, ShieldCheck, MapPin, Award, Calendar, BookOpen, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { buildApiUrl } from "@/lib/url";

const LoadingSpinner = ({ size = "md", className = "" }: { size?: "sm" | "md" | "lg" | "xl", className?: string }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };
  return (
    <div className={`animate-spin rounded-full border-b-2 border-current ${sizeClasses[size]} ${className}`}></div>
  );
};

interface Review {
  id: number;
  client_name: string;
  rating: number;
  text: string;
  date: string;
}

interface NutritionistDetail {
  id: number;
  name: string;
  title: string | null;
  photo: string | null;
  str_number: string | null;
  bio: string | null;
  city: string | null;
  specializations: string[] | null;
  education: { degree: string; institution: string; year: string }[] | null;
  certifications: { name: string; institution: string; year: string }[] | null;
  years_experience: number;
  rating: number;
  review_count: number;
  total_clients: number;
  success_rate: number;
  is_available: boolean;
  reviews: Review[];
}

export default function AhliGiziDetailPage() {
  const { slug } = useParams();
  const [profile, setProfile] = useState<NutritionistDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(buildApiUrl(`/public/nutritionists/${slug}`));
        if (res.ok) {
          const data = await res.json();
          setProfile(data.data ?? null);
        }
      } catch (error) {
        console.error("Failed to fetch nutritionist profile", error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProfile();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="xl" className="text-green-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ahli Gizi Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-6">Maaf, profil yang Anda cari tidak ada atau telah dihapus.</p>
        <Link href="/ahli-gizi">
          <Button>Kembali ke Daftar Ahli Gizi</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. HERO PROFIL */}
      <section className="bg-white border-b border-gray-200 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 h-32 md:w-48 md:h-48 flex-shrink-0 relative">
              <Image 
                src={profile.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=e8f8f0&color=0d6e42&size=200`} 
                alt={profile.name}
                width={200}
                height={200}
                className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
              />
              {profile.is_available && (
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full" title="Tersedia"></div>
              )}
            </div>

            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
                    {profile.name} <span className="text-xl md:text-2xl text-gray-500 font-normal">{profile.title}</span>
                    <span title="Terverifikasi"><ShieldCheck className="w-6 h-6 text-blue-500" /></span>
                  </h1>
                  <p className="text-gray-600 mt-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {profile.city || "Indonesia"}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <div className="flex items-center md:justify-end gap-1 mb-1">
                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                    <span className="text-2xl font-bold text-gray-900">{profile.rating}</span>
                  </div>
                  <p className="text-sm text-gray-500">dari {profile.review_count} ulasan</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {profile.specializations?.map((spec) => (
                  <span key={spec} className="px-3 py-1 bg-green-50 border border-green-100 text-green-700 text-sm font-medium rounded-full">
                    {spec}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {profile.is_available ? (
                  <Link href={`/checkout?nutritionist_id=${profile.id}`} className="w-full sm:w-auto">
                    <Button size="lg" className="w-full">Pilih Ahli Gizi Ini</Button>
                  </Link>
                ) : (
                  <Button size="lg" disabled variant="outline" className="w-full sm:w-auto">Jadwal Penuh</Button>
                )}
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white">Lihat Program</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* 2. TENTANG */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tentang</h2>
              <div className="prose prose-green max-w-none text-gray-700 mb-8">
                <p>{profile.bio || "Belum ada informasi bio."}</p>
              </div>

              {profile.str_number && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl text-blue-900 mb-8 border border-blue-100">
                  <ShieldCheck className="w-6 h-6 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Surat Tanda Registrasi (STR) Aktif</p>
                    <p className="text-xs opacity-80">No. {profile.str_number}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-green-600" /> Pendidikan
                  </h3>
                  <ul className="space-y-4">
                    {profile.education && profile.education.length > 0 ? (
                      profile.education.map((edu, i) => (
                        <li key={i} className="flex gap-4">
                          <div className="w-2 h-2 mt-2 bg-green-400 rounded-full flex-shrink-0"></div>
                          <div>
                            <p className="font-bold text-gray-900">{edu.degree}</p>
                            <p className="text-gray-600 text-sm">{edu.institution}</p>
                            <p className="text-gray-400 text-xs mt-1">{edu.year}</p>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 italic">Belum ada data.</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-600" /> Sertifikasi
                  </h3>
                  <ul className="space-y-4">
                    {profile.certifications && profile.certifications.length > 0 ? (
                      profile.certifications.map((cert, i) => (
                        <li key={i} className="flex gap-4">
                          <div className="w-2 h-2 mt-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
                          <div>
                            <p className="font-bold text-gray-900">{cert.name}</p>
                            <p className="text-gray-600 text-sm">{cert.institution}</p>
                            <p className="text-gray-400 text-xs mt-1">{cert.year}</p>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 italic">Belum ada data.</li>
                    )}
                  </ul>
                </div>
              </div>
            </section>

            {/* 4. REVIEW KLIEN */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-green-600" /> Ulasan Klien
                </h2>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-bold text-lg">{profile.rating}</span>
                </div>
              </div>

              <div className="space-y-6">
                {profile.reviews && profile.reviews.length > 0 ? (
                  profile.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 text-green-700 font-bold rounded-full flex items-center justify-center">
                            {review.client_name}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">Klien DietCare</p>
                            <p className="text-xs text-gray-500">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 italic">&quot;{review.text}&quot;</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Belum ada ulasan untuk ahli gizi ini.</p>
                )}
              </div>
              
              {profile.reviews && profile.reviews.length > 0 && (
                <Button variant="outline" className="w-full mt-6 justify-center">Lihat Semua Ulasan</Button>
              )}
            </section>
          </div>

          <div className="space-y-6">
            {/* 3. STATISTIK */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-6">Statistik Ahli Gizi</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{profile.total_clients}+</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Klien</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{profile.success_rate}%</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Success Rate</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center col-span-2">
                  <div className="text-2xl font-bold text-green-600 mb-1">{profile.years_experience} Tahun</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Pengalaman</div>
                </div>
              </div>
            </div>

            {/* 5. JADWAL TERSEDIA */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" /> Jadwal Tersedia
              </h3>
              <p className="text-sm text-gray-500 mb-4">Hari praktik reguler untuk konsultasi (dapat berubah sesuai kesepakatan):</p>
              
              <ul className="space-y-3">
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day) => {
                  // This is just a dummy display since we don't have real schedule API hooked here yet.
                  // Ideally we fetch from /api/nutritionists/{id}/schedule
                  const isAvailable = ['Senin', 'Rabu', 'Jumat', 'Sabtu'].includes(day);
                  
                  return (
                    <li key={day} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                      <span className="font-medium text-gray-700">{day}</span>
                      {isAvailable ? (
                        <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Tersedia</span>
                      ) : (
                        <span className="text-gray-400">Libur</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
            
            <div className="bg-green-50 rounded-2xl p-6 border border-green-100 text-center">
              <h3 className="font-bold text-green-900 mb-2">Ingin konsultasi?</h3>
              <p className="text-green-800 text-sm mb-4">Pilih program yang sesuai dan jadwalkan sesi pertama Anda.</p>
              <Link href={`/checkout?nutritionist_id=${profile.id}`}>
                <Button className="w-full justify-center shadow-md">Pilih Sekarang</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
