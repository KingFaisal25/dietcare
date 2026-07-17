"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import {
  Camera, Plus, X, Trash2, Award, Briefcase, Calendar,
  Bell, FileText, MapPin, User, Save, RefreshCw
} from "lucide-react";
import api from "@/lib/api";
import gsap from "gsap";

const SPECIALIZATIONS = [
  "Penurunan BB",
  "Kenaikan BB",
  "Gizi Klinis",
  "Gizi Olahraga",
  "Gizi Ibu Hamil",
  "Gizi Anak",
  "PCOS",
  "Diabetes",
];

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

type ActiveTab = "dasar" | "bio" | "pendidikan" | "jadwal" | "notifikasi";

export default function ProfilAhliGiziPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("dasar");

  // Refs for animations
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    str_number: "",
    phone: "",
    email: "",
    bio: "",
    city: "",
    years_experience: 0,
    specializations: [] as string[],
    education: [] as { degree: string; institution: string; year: string }[],
    certifications: [] as { name: string; institution: string; year: string }[],
    notif_new_message: true,
    notif_new_consultation: true,
    notif_reminder: true,
  });

  const [schedules, setSchedules] = useState(
    DAYS.map((day) => ({ day_of_week: day, is_active: false, start_time: "09:00", end_time: "17:00" }))
  );

  // Photo State
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [upImg, setUpImg] = useState<string | ArrayBuffer | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Crop>({ unit: "%", width: 50, height: 50, x: 25, y: 25 });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  // GSAP Entrance Animation
  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".animate-fade-in"),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [loading]);

  // Animate tab switches
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/nutritionist/profile");
      const { user: profileUser, profile, schedules: serverSchedules } = res.data;

      setFormData({
        name: profileUser.name || "",
        title: profile?.title || "",
        str_number: profile?.str_number || "",
        phone: profileUser.phone || "",
        email: profileUser.email || "",
        bio: profile?.bio || "",
        city: profile?.city || "",
        years_experience: profile?.years_experience || 0,
        specializations: profile?.specializations || [],
        education: profile?.education || [],
        certifications: profile?.certifications || [],
        notif_new_message: profile?.notif_new_message ?? true,
        notif_new_consultation: profile?.notif_new_consultation ?? true,
        notif_reminder: profile?.notif_reminder ?? true,
      });

      setPhotoUrl(profile?.photo || null);

      if (serverSchedules && serverSchedules.length > 0) {
        setSchedules(
          DAYS.map((day) => {
            const existing = serverSchedules.find(
              (s: { day_of_week: string; is_active: boolean; start_time: string; end_time: string }) =>
                s.day_of_week === day
            );
            return existing
              ? {
                  day_of_week: existing.day_of_week,
                  is_active: existing.is_active,
                  start_time: existing.start_time ? existing.start_time.substring(0, 5) : "09:00",
                  end_time: existing.end_time ? existing.end_time.substring(0, 5) : "17:00",
                }
              : { day_of_week: day, is_active: false, start_time: "09:00", end_time: "17:00" };
          })
        );
      }
    } catch (error) {
      console.error(error);
      setToast({ message: "Gagal memuat profil", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/nutritionist/profile", formData);
      await api.put("/nutritionist/schedule", { schedules });
      setToast({ message: "Profil berhasil disimpan", type: "success" });
    } catch (error) {
      console.error(error);
      setToast({ message: "Gagal menyimpan profil", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setUpImg(reader.result));
      reader.readAsDataURL(e.target.files[0]);
      setShowCropModal(true);
    }
  };

  const uploadPhoto = async () => {
    if (!completedCrop || !imgRef.current) return;

    const canvas = document.createElement("canvas");
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append("photo", blob, "profile.jpg");

      try {
        const res = await api.post("/nutritionist/profile/photo", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setPhotoUrl(res.data.photo_url);
        setShowCropModal(false);
        setToast({ message: "Foto berhasil diunggah", type: "success" });
      } catch (error) {
        console.error(error);
        setToast({ message: "Gagal mengunggah foto", type: "error" });
      }
    }, "image/jpeg");
  };

  const toggleSpecialization = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-slate-400 font-bold italic">Memuat profil profesional...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Header Panel */}
      <div className="animate-fade-in flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="relative group w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt="Profile"
                width={80}
                height={80}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <Camera className="w-8 h-8" />
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={onSelectFile}
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">
              {formData.name || "Ahli Gizi"} {formData.title && `, ${formData.title}`}
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-1">
              STR: {formData.str_number || "Belum dimasukkan"} • {formData.years_experience} Tahun Pengalaman
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-lg shadow-emerald-100 flex items-center gap-2"
          >
            {saving ? (
              <>
                <RefreshCw className="animate-spin w-4 h-4" /> Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Simpan Profil
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="animate-fade-in lg:col-span-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 space-y-2">
          <span className="block px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Pengaturan Profil
          </span>
          {[
            { id: "dasar", label: "Informasi Dasar", icon: <User className="w-4 h-4" /> },
            { id: "bio", label: "Bio & Keahlian", icon: <Briefcase className="w-4 h-4" /> },
            { id: "pendidikan", label: "Pendidikan & Sertifikat", icon: <Award className="w-4 h-4" /> },
            { id: "jadwal", label: "Jadwal Praktik", icon: <Calendar className="w-4 h-4" /> },
            { id: "notifikasi", label: "Notifikasi", icon: <Bell className="w-4 h-4" /> },
          ].map((tab) => {
            const isAct = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-left transition-all ${
                  isAct
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="animate-fade-in lg:col-span-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 min-h-[500px]">
          <div ref={contentRef} className="space-y-6">
            {/* TABS IMPLEMENTATION */}
            {activeTab === "dasar" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Informasi Dasar</h3>
                  <p className="text-xs text-slate-400 font-medium">Informasi identitas profesional utama Anda</p>
                </div>
                <hr className="border-slate-100" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Nama Lengkap
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Masukkan nama lengkap"
                      className="h-12 bg-slate-50 border-slate-200 rounded-xl text-sm text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Gelar Akademik
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Contoh: S.Gz, M.Gz"
                      className="h-12 bg-slate-50 border-slate-200 rounded-xl text-sm text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Nomor STR <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      value={formData.str_number}
                      onChange={(e) => setFormData({ ...formData, str_number: e.target.value })}
                      placeholder="16-digit nomor STR"
                      className="h-12 bg-slate-50 border-slate-200 rounded-xl text-sm text-slate-900 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      No. WhatsApp
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Contoh: 0812xxxxxxxx"
                      className="h-12 bg-slate-50 border-slate-200 rounded-xl text-sm text-slate-900"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Email Profesional
                    </label>
                    <Input
                      type="email"
                      disabled
                      value={formData.email}
                      className="h-12 bg-slate-100 border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-slate-400 font-bold italic">
                      * Email akun utama tidak dapat diubah demi keamanan akun SaaS Anda.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "bio" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Bio & Keahlian</h3>
                  <p className="text-xs text-slate-400 font-medium">Beri tahu klien mengenai latar belakang keahlian Anda</p>
                </div>
                <hr className="border-slate-100" />
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Bio Singkat (Maks 500 karakter)
                  </label>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tulis bio singkat di sini..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 resize-none leading-relaxed"
                  />
                  <p className="text-right text-[10px] text-slate-400 font-bold">
                    {formData.bio.length} / 500
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Pengalaman Kerja (Tahun)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.years_experience}
                      onChange={(e) =>
                        setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })
                      }
                      className="h-12 bg-slate-50 border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Kota Praktik
                    </label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Contoh: Jakarta"
                      className="h-12 bg-slate-50 border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Spesialisasi Fokus Gizi
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALIZATIONS.map((spec) => {
                      const isSelected = formData.specializations.includes(spec);
                      return (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => toggleSpecialization(spec)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100"
                              : "bg-slate-50 border-slate-200 text-slate-500 hover:border-emerald-300 hover:bg-white"
                          }`}
                        >
                          {spec}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "pendidikan" && (
              <div className="space-y-8">
                {/* Pendidikan Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Riwayat Pendidikan</h3>
                      <p className="text-xs text-slate-400 font-medium">Riwayat studi akademik gizi Anda</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          education: [...prev.education, { degree: "", institution: "", year: "" }],
                        }))
                      }
                      className="rounded-xl font-bold border-slate-200 h-10 px-4 text-emerald-600 hover:bg-emerald-50/50"
                    >
                      <Plus className="w-4 h-4 mr-1.5" /> Tambah
                    </Button>
                  </div>
                  <hr className="border-slate-100" />
                  <div className="space-y-3">
                    {formData.education.map((edu, index) => (
                      <div key={index} className="flex gap-3 items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <Input
                          placeholder="S1 Ilmu Gizi"
                          value={edu.degree}
                          onChange={(e) => {
                            const newEdu = [...formData.education];
                            newEdu[index].degree = e.target.value;
                            setFormData({ ...formData, education: newEdu });
                          }}
                          className="h-11 bg-white border-slate-200 rounded-lg text-xs"
                        />
                        <Input
                          placeholder="Universitas"
                          value={edu.institution}
                          onChange={(e) => {
                            const newEdu = [...formData.education];
                            newEdu[index].institution = e.target.value;
                            setFormData({ ...formData, education: newEdu });
                          }}
                          className="h-11 bg-white border-slate-200 rounded-lg text-xs"
                        />
                        <Input
                          placeholder="Tahun"
                          className="w-24 h-11 bg-white border-slate-200 rounded-lg text-xs text-center"
                          value={edu.year}
                          onChange={(e) => {
                            const newEdu = [...formData.education];
                            newEdu[index].year = e.target.value;
                            setFormData({ ...formData, education: newEdu });
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newEdu = formData.education.filter((_, i) => i !== index);
                            setFormData({ ...formData, education: newEdu });
                          }}
                          className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {formData.education.length === 0 && (
                      <p className="text-xs text-slate-400 font-bold italic text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        Belum ada riwayat pendidikan terdaftar.
                      </p>
                    )}
                  </div>
                </div>

                {/* Sertifikasi Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Sertifikasi & Pelatihan</h3>
                      <p className="text-xs text-slate-400 font-medium">Sertifikat profesional yang menunjang kredibilitas</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          certifications: [...prev.certifications, { name: "", institution: "", year: "" }],
                        }))
                      }
                      className="rounded-xl font-bold border-slate-200 h-10 px-4 text-emerald-600 hover:bg-emerald-50/50"
                    >
                      <Plus className="w-4 h-4 mr-1.5" /> Tambah
                    </Button>
                  </div>
                  <hr className="border-slate-100" />
                  <div className="space-y-3">
                    {formData.certifications.map((cert, index) => (
                      <div key={index} className="flex gap-3 items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <Input
                          placeholder="Certified Sports Nutritionist"
                          value={cert.name}
                          onChange={(e) => {
                            const newCert = [...formData.certifications];
                            newCert[index].name = e.target.value;
                            setFormData({ ...formData, certifications: newCert });
                          }}
                          className="h-11 bg-white border-slate-200 rounded-lg text-xs"
                        />
                        <Input
                          placeholder="Lembaga Sertifikasi"
                          value={cert.institution}
                          onChange={(e) => {
                            const newCert = [...formData.certifications];
                            newCert[index].institution = e.target.value;
                            setFormData({ ...formData, certifications: newCert });
                          }}
                          className="h-11 bg-white border-slate-200 rounded-lg text-xs"
                        />
                        <Input
                          placeholder="Tahun"
                          className="w-24 h-11 bg-white border-slate-200 rounded-lg text-xs text-center"
                          value={cert.year}
                          onChange={(e) => {
                            const newCert = [...formData.certifications];
                            newCert[index].year = e.target.value;
                            setFormData({ ...formData, certifications: newCert });
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newCert = formData.certifications.filter((_, i) => i !== index);
                            setFormData({ ...formData, certifications: newCert });
                          }}
                          className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {formData.certifications.length === 0 && (
                      <p className="text-xs text-slate-400 font-bold italic text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        Belum ada sertifikasi terdaftar.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "jadwal" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Jadwal Praktik Konsultasi</h3>
                  <p className="text-xs text-slate-400 font-medium">Tentukan hari & jam operasional ketersediaan konsultasi reguler Anda</p>
                </div>
                <hr className="border-slate-100" />
                <div className="space-y-4">
                  {schedules.map((schedule, index) => (
                    <div
                      key={schedule.day_of_week}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          id={`schedule-active-${schedule.day_of_week}`}
                          type="checkbox"
                          checked={schedule.is_active}
                          onChange={(e) => {
                            const newSchedules = [...schedules];
                            newSchedules[index].is_active = e.target.checked;
                            setSchedules(newSchedules);
                          }}
                          className="w-5 h-5 rounded border-slate-200 text-emerald-500 focus:ring-emerald-500 accent-emerald-500"
                        />
                        <label
                          htmlFor={`schedule-active-${schedule.day_of_week}`}
                          className={`text-sm font-black cursor-pointer ${
                            schedule.is_active ? "text-slate-900" : "text-slate-400"
                          }`}
                        >
                          {schedule.day_of_week}
                        </label>
                      </div>

                      {schedule.is_active ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            className="w-28 h-10 bg-white border-slate-200 rounded-lg text-xs"
                            value={schedule.start_time}
                            onChange={(e) => {
                              const newSchedules = [...schedules];
                              newSchedules[index].start_time = e.target.value;
                              setSchedules(newSchedules);
                            }}
                          />
                          <span className="text-slate-400 font-bold">-</span>
                          <Input
                            type="time"
                            className="w-28 h-10 bg-white border-slate-200 rounded-lg text-xs"
                            value={schedule.end_time}
                            onChange={(e) => {
                              const newSchedules = [...schedules];
                              newSchedules[index].end_time = e.target.value;
                              setSchedules(newSchedules);
                            }}
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-bold italic bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                          Tutup / Libur
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "notifikasi" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Pengaturan Notifikasi</h3>
                  <p className="text-xs text-slate-400 font-medium">Kelola bagaimana Anda menerima notifikasi aktivitas dari platform SaaS</p>
                </div>
                <hr className="border-slate-100" />
                <div className="space-y-4">
                  {[
                    {
                      key: "notif_new_message" as const,
                      title: "Notifikasi Pesan Klien Baru",
                      desc: "Kirim email notifikasi ketika ada chat masuk dari klien baru Anda.",
                    },
                    {
                      key: "notif_new_consultation" as const,
                      title: "Jadwal Sesi Konsultasi Baru",
                      desc: "Beri tahu saya ketika klien memesan sesi jadwal video-call/konsultasi baru.",
                    },
                    {
                      key: "notif_reminder" as const,
                      title: "Pengingat Jadwal Konsultasi",
                      desc: "Kirim notifikasi pengingat 1 jam sebelum sesi konsultasi video dimulai.",
                    },
                  ].map((notif) => (
                    <label
                      key={notif.key}
                      className="flex gap-4 items-start p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData[notif.key]}
                        onChange={(e) => setFormData({ ...formData, [notif.key]: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-200 text-emerald-500 accent-emerald-500 shrink-0 mt-0.5"
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-black text-slate-900">{notif.title}</p>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">{notif.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden flex flex-col border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 text-base">Potong Foto Profil</h3>
              <button
                onClick={() => setShowCropModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex-grow overflow-auto flex justify-center bg-slate-100/50 min-h-[300px]">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={typeof upImg === "string" ? upImg : ""}
                  alt="Upload preview"
                  className="max-h-80 object-contain rounded-xl"
                />
              </ReactCrop>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCropModal(false)}
                className="rounded-xl font-bold border-slate-200"
              >
                Batal
              </Button>
              <Button
                onClick={uploadPhoto}
                className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-5"
              >
                Simpan Foto
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
