"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { Camera, Plus, X, Trash2 } from "lucide-react";
import api from "@/lib/api";

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

export default function ProfilAhliGiziPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

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
            const existing = serverSchedules.find((s: { day_of_week: string; is_active: boolean; start_time: string; end_time: string }) => s.day_of_week === day);
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

  if (loading) return <div className="p-8 text-center">Memuat profil...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Profil</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan Profil"}
        </Button>
      </div>

      <div className="space-y-8">
        {/* 1. FOTO PROFIL */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Foto Profil</h2>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden flex-shrink-0">
              {photoUrl ? (
                <Image src={photoUrl} alt="Profile" width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Camera className="w-8 h-8" />
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={onSelectFile}
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Ubah Foto
              </Button>
              <p className="text-xs text-gray-500 mt-2">Rekomendasi rasio 1:1, max 2MB.</p>
            </div>
          </div>
        </section>

        {/* 2. INFORMASI DASAR */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Informasi Dasar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Gelar</label>
              <Input
                placeholder="Contoh: S.Gz, M.Gz"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Nomor STR <span className="text-red-500">*</span></label>
              <Input
                required
                value={formData.str_number}
                onChange={(e) => setFormData({ ...formData, str_number: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Nomor HP / WA</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email Profesional</label>
              <Input
                type="email"
                disabled
                value={formData.email}
              />
              <p className="text-xs text-gray-500">Email tidak dapat diubah</p>
            </div>
          </div>
        </section>

        {/* 3. BIO & SPESIALISASI */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Bio & Keahlian</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Bio Singkat</label>
              <textarea
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={500}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {formData.bio.length} / 500
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Pengalaman (Tahun)</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.years_experience}
                  onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Kota Praktik</label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Spesialisasi</label>
              <div className="flex flex-wrap gap-2">
                {SPECIALIZATIONS.map((spec) => {
                  const isSelected = formData.specializations.includes(spec);
                  return (
                    <button
                      key={spec}
                      onClick={() => toggleSpecialization(spec)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        isSelected
                          ? "bg-green-50 border-green-500 text-green-700"
                          : "bg-white border-gray-200 text-gray-600 hover:border-green-300"
                      }`}
                    >
                      {spec}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 4. PENDIDIKAN & SERTIFIKASI */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Pendidikan & Sertifikasi</h2>
          
          {/* Pendidikan */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-700">Pendidikan</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    education: [...prev.education, { degree: "", institution: "", year: "" }],
                  }))
                }
              >
                <Plus className="w-4 h-4 mr-1" /> Tambah
              </Button>
            </div>
            <div className="space-y-3">
              {formData.education.map((edu, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Input
                    placeholder="Jenjang (S1 Gizi)"
                    value={edu.degree}
                    onChange={(e) => {
                      const newEdu = [...formData.education];
                      newEdu[index].degree = e.target.value;
                      setFormData({ ...formData, education: newEdu });
                    }}
                  />
                  <Input
                    placeholder="Institusi"
                    value={edu.institution}
                    onChange={(e) => {
                      const newEdu = [...formData.education];
                      newEdu[index].institution = e.target.value;
                      setFormData({ ...formData, education: newEdu });
                    }}
                  />
                  <Input
                    placeholder="Tahun"
                    className="w-24"
                    value={edu.year}
                    onChange={(e) => {
                      const newEdu = [...formData.education];
                      newEdu[index].year = e.target.value;
                      setFormData({ ...formData, education: newEdu });
                    }}
                  />
                  <button
                    onClick={() => {
                      const newEdu = formData.education.filter((_, i) => i !== index);
                      setFormData({ ...formData, education: newEdu });
                    }}
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg border border-transparent"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {formData.education.length === 0 && (
                <p className="text-sm text-gray-500 italic">Belum ada riwayat pendidikan.</p>
              )}
            </div>
          </div>

          {/* Sertifikasi */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-700">Sertifikasi</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    certifications: [...prev.certifications, { name: "", institution: "", year: "" }],
                  }))
                }
              >
                <Plus className="w-4 h-4 mr-1" /> Tambah
              </Button>
            </div>
            <div className="space-y-3">
              {formData.certifications.map((cert, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Input
                    placeholder="Nama Sertifikasi"
                    value={cert.name}
                    onChange={(e) => {
                      const newCert = [...formData.certifications];
                      newCert[index].name = e.target.value;
                      setFormData({ ...formData, certifications: newCert });
                    }}
                  />
                  <Input
                    placeholder="Lembaga"
                    value={cert.institution}
                    onChange={(e) => {
                      const newCert = [...formData.certifications];
                      newCert[index].institution = e.target.value;
                      setFormData({ ...formData, certifications: newCert });
                    }}
                  />
                  <Input
                    placeholder="Tahun"
                    className="w-24"
                    value={cert.year}
                    onChange={(e) => {
                      const newCert = [...formData.certifications];
                      newCert[index].year = e.target.value;
                      setFormData({ ...formData, certifications: newCert });
                    }}
                  />
                  <button
                    onClick={() => {
                      const newCert = formData.certifications.filter((_, i) => i !== index);
                      setFormData({ ...formData, certifications: newCert });
                    }}
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg border border-transparent"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {formData.certifications.length === 0 && (
                <p className="text-sm text-gray-500 italic">Belum ada sertifikasi.</p>
              )}
            </div>
          </div>
        </section>

        {/* 5. JADWAL KETERSEDIAAN */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Jadwal Ketersediaan</h2>
          <p className="text-sm text-gray-500 mb-6">Tentukan jadwal reguler kapan Anda tersedia untuk konsultasi.</p>
          
          <div className="space-y-4">
            {schedules.map((schedule, index) => (
              <div key={schedule.day_of_week} className="flex items-center gap-4">
                <div className="w-32 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={schedule.is_active}
                    onChange={(e) => {
                      const newSchedules = [...schedules];
                      newSchedules[index].is_active = e.target.checked;
                      setSchedules(newSchedules);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className={`font-medium ${schedule.is_active ? 'text-gray-900' : 'text-gray-400'}`}>
                    {schedule.day_of_week}
                  </span>
                </div>
                
                {schedule.is_active ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      className="w-32"
                      value={schedule.start_time}
                      onChange={(e) => {
                        const newSchedules = [...schedules];
                        newSchedules[index].start_time = e.target.value;
                        setSchedules(newSchedules);
                      }}
                    />
                    <span className="text-gray-500">-</span>
                    <Input
                      type="time"
                      className="w-32"
                      value={schedule.end_time}
                      onChange={(e) => {
                        const newSchedules = [...schedules];
                        newSchedules[index].end_time = e.target.value;
                        setSchedules(newSchedules);
                      }}
                    />
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 italic">Libur</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 6. PENGATURAN NOTIFIKASI */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Pengaturan Notifikasi</h2>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notif_new_message}
                onChange={(e) => setFormData({ ...formData, notif_new_message: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <div>
                <p className="font-medium text-gray-900">Notifikasi Pesan Baru</p>
                <p className="text-sm text-gray-500">Terima email saat klien mengirim pesan baru.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notif_new_consultation}
                onChange={(e) => setFormData({ ...formData, notif_new_consultation: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <div>
                <p className="font-medium text-gray-900">Jadwal Konsultasi Baru</p>
                <p className="text-sm text-gray-500">Terima notifikasi saat ada klien menjadwalkan konsultasi.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notif_reminder}
                onChange={(e) => setFormData({ ...formData, notif_reminder: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <div>
                <p className="font-medium text-gray-900">Pengingat Konsultasi</p>
                <p className="text-sm text-gray-500">Pengingat 1 jam sebelum jadwal konsultasi dimulai.</p>
              </div>
            </label>
          </div>
        </section>

      </div>

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold">Potong Foto Profil</h3>
              <button onClick={() => setShowCropModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-grow overflow-auto flex justify-center bg-gray-100">
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
                  src={typeof upImg === 'string' ? upImg : ''}
                  alt="Upload preview"
                  className="max-h-96 object-contain"
                />
              </ReactCrop>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCropModal(false)}>Batal</Button>
              <Button onClick={uploadPhoto}>Simpan Foto</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
