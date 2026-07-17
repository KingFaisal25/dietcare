'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import Image from 'next/image';
import { 
  FiCamera, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiCalendar, 
  FiMapPin, 
  FiLock, 
  FiBell, 
  FiActivity, 
  FiCheckCircle, 
  FiAlertCircle,
  FiArrowRight,
  FiTarget
} from 'react-icons/fi';
import api from '@/lib/api';

interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  created_at: string;
  client_profile?: {
    birth_date: string;
    city: string;
    height_cm: number;
    weight_kg: number;
    medical_conditions: string;
    allergies: string;
    dietary_restrictions: string;
    target_weight_kg: number;
    calorie_target: number;
  };
  notification_settings?: {
    meal_log: boolean;
    weight_log: boolean;
    promo_article: boolean;
    nutritionist_msg: boolean;
  };
  client_programs?: {
    id: string;
    program: {
      name: string;
    };
    status: string;
    start_date: string;
  }[];
}

const getAvatarUrl = (avatar: string | null): string => {
  if (!avatar) return '';
  if (avatar.startsWith('http')) return avatar;
  return avatar.startsWith('/') ? avatar : `/storage/${avatar}`;
};

const ClientProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profil');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsLoadingSave] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [personalForm, setPersonalForm] = useState({
    name: '',
    phone: '',
    birth_date: '',
    city: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const [notifSettings, setNotifSettings] = useState({
    meal_log: true,
    weight_log: true,
    promo_article: true,
    nutritionist_msg: true,
  });

  const [nutritionForm, setNutritionForm] = useState({
    height: '',
    weight: '',
    medical_conditions: '',
    allergies: '',
    dietary_restrictions: '',
    target_weight: '',
  });

  const [isNutritionModalOpen, setIsNutritionModalOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/client/profile');
      setUserData(res.data);
      
      // Sync forms
      setPersonalForm({
        name: res.data.name || '',
        phone: res.data.phone || '',
        birth_date: res.data.client_profile?.birth_date || '',
        city: res.data.client_profile?.city || '',
      });

      if (res.data.notification_settings) {
        setNotifSettings(res.data.notification_settings);
      }

      setNutritionForm({
        height: res.data.client_profile?.height_cm || '',
        weight: res.data.client_profile?.weight_kg || '',
        medical_conditions: res.data.client_profile?.medical_conditions || '',
        allergies: res.data.client_profile?.allergies || '',
        dietary_restrictions: res.data.client_profile?.dietary_restrictions || '',
        target_weight: res.data.client_profile?.target_weight_kg || '',
      });

    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingSave(true);
    try {
      await api.put('/client/profile', personalForm);
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Failed to update profile', error);
      setMessage({ type: 'error', text: 'Gagal memperbarui profil.' });
    } finally {
      setIsLoadingSave(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
      return;
    }
    setIsLoadingSave(true);
    try {
      await api.put('/client/profile/password', passwordForm);
      setMessage({ type: 'success', text: 'Password berhasil diubah!' });
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error: unknown) {
      console.error('Failed to update password', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengubah password.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoadingSave(false);
    }
  };

  const handleToggleNotif = async (key: string) => {
    const newSettings = { ...notifSettings, [key]: !notifSettings[key as keyof typeof notifSettings] };
    setNotifSettings(newSettings);
    try {
      await api.put('/client/profile/notifications', { notification_settings: newSettings });
    } catch (error) {
      console.error('Failed to update notifications', error);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append('photo', e.target.files[0]);
      setIsLoadingSave(true);
      try {
        const res = await api.post('/client/profile/photo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (userData) {
          setUserData({ ...userData, avatar: res.data.avatar_url });
        }
        setMessage({ type: 'success', text: 'Foto profil berhasil diperbarui!' });
      } catch (error) {
        console.error('Failed to upload photo', error);
        setMessage({ type: 'error', text: 'Gagal mengupload foto.' });
      } finally {
        setIsLoadingSave(false);
      }
    }
  };

  const handleUpdateNutrition = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingSave(true);
    try {
      await api.put('/client/profile/nutrition-data', nutritionForm);
      setIsNutritionModalOpen(false);
      setMessage({ type: 'success', text: 'Data gizi berhasil diperbarui!' });
      fetchProfile();
    } catch (error) {
      console.error('Failed to update nutrition data', error);
      setMessage({ type: 'error', text: 'Gagal memperbarui data gizi.' });
    } finally {
      setIsLoadingSave(false);
    }
  };

  const calculateBMI = (w: number | undefined, h: number | undefined) => {
    if (!w || !h) return 0;
    const heightInMeters = h / 100;
    return (w / (heightInMeters * heightInMeters)).toFixed(1);
  };

  if (isLoading || !userData) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl p-6 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Profil & Pengaturan</h1>
          <p className="text-gray-500 text-sm">Kelola informasi pribadi dan data kesehatan Anda</p>
        </div>
        {message.text && (
          <div className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
            {message.text}
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('profil')}
          className={`px-8 py-2.5 text-sm rounded-lg transition-all font-bold flex items-center gap-2 ${
            activeTab === 'profil' ? 'bg-white shadow-md text-green-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiUser /> Profil Saya
        </button>
        <button
          onClick={() => setActiveTab('gizi')}
          className={`px-8 py-2.5 text-sm rounded-lg transition-all font-bold flex items-center gap-2 ${
            activeTab === 'gizi' ? 'bg-white shadow-md text-green-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FiActivity /> Data Gizi Saya
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ALWAYS SHOWN */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-8 text-center relative overflow-hidden">
            {/* PHOTO SECTION */}
            <div className="relative inline-block mx-auto mb-6 group">
              <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-green-50 bg-gray-100">
                {userData.avatar ? (
                  <Image 
                    src={getAvatarUrl(userData.avatar)} 
                    alt={userData.name} 
                    width={128} 
                    height={128} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <FiUser size={64} />
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2.5 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all transform hover:scale-110"
              >
                <FiCamera size={18} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
              />
            </div>
            
            <h3 className="text-xl font-bold text-gray-800">{userData.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{userData.email}</p>
            <Badge variant="success">Member NutriPro</Badge>

            <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Bergabung Sejak</span>
                <span className="font-bold text-gray-700">
                  {new Date(userData.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Total Program</span>
                <span className="font-bold text-gray-700">{userData.client_programs?.length || 0}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
              <FiCalendar className="text-green-600" /> Riwayat Program
            </h4>
            <div className="space-y-3">
              {userData.client_programs && userData.client_programs.length > 0 ? (
                userData.client_programs.map((p) => (
                  <div key={p.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                          {p.program.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(p.start_date).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <Badge 
                        variant={p.status === 'active' ? 'success' : p.status === 'completed' ? 'default' : 'danger'}
                      >
                        {p.status === 'active' ? 'Aktif' : p.status === 'completed' ? 'Selesai' : 'Batal'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">Belum ada riwayat program.</p>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: TAB CONTENT */}
        <div className="lg:col-span-2">
          {activeTab === 'profil' ? (
            <div className="space-y-6">
              {/* DATA PRIBADI FORM */}
              <Card className="p-8">
                <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-50 pb-4">Data Pribadi</h3>
                <form onSubmit={handleUpdatePersonal} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Nama Lengkap" 
                    icon={<FiUser />} 
                    value={personalForm.name}
                    onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                    required 
                  />
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-10 py-2 text-sm text-gray-500 cursor-not-allowed" 
                        value={userData.email} 
                        readOnly 
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">Email sudah terverifikasi dan tidak dapat diubah.</p>
                  </div>
                  <Input 
                    label="Nomor HP / WhatsApp" 
                    icon={<FiPhone />} 
                    value={personalForm.phone}
                    onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                    required 
                  />
                  <Input 
                    label="Tanggal Lahir" 
                    type="date" 
                    icon={<FiCalendar />} 
                    value={personalForm.birth_date}
                    onChange={(e) => setPersonalForm({ ...personalForm, birth_date: e.target.value })}
                  />
                  <Input 
                    label="Kota Tempat Tinggal" 
                    icon={<FiMapPin />} 
                    value={personalForm.city}
                    onChange={(e) => setPersonalForm({ ...personalForm, city: e.target.value })}
                  />
                  <div className="md:col-span-2 flex justify-end">
                    <Button type="submit" isLoading={isSaving}>Simpan Perubahan</Button>
                  </div>
                </form>
              </Card>

              {/* GANTI PASSWORD */}
              <details className="group border-none outline-none">
                <summary className="list-none cursor-pointer">
                  <Card className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <FiLock size={20} />
                      </div>
                      <span className="font-bold text-gray-800">Keamanan & Password</span>
                    </div>
                    <FiArrowRight className="text-gray-400 group-open:rotate-90 transition-transform" />
                  </Card>
                </summary>
                <Card className="mt-2 p-8 animate-in slide-in-from-top-2">
                  <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <Input 
                      label="Password Lama" 
                      type="password" 
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      required 
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input 
                        label="Password Baru" 
                        type="password" 
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                        required 
                      />
                      <Input 
                        label="Konfirmasi Password Baru" 
                        type="password" 
                        value={passwordForm.new_password_confirmation}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" variant="outline" isLoading={isSaving}>Update Password</Button>
                    </div>
                  </form>
                </Card>
              </details>

              {/* PREFERENSI NOTIFIKASI */}
              <Card className="p-8">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FiBell className="text-green-600" /> Preferensi Notifikasi
                </h3>
                <div className="space-y-4">
                  {[
                    { key: 'meal_log', label: 'Reminder Log Makan (Email)', desc: 'Pengingat harian untuk mencatat sarapan, makan siang, dan makan malam.' },
                    { key: 'weight_log', label: 'Reminder Timbang Badan (Email)', desc: 'Pengingat mingguan setiap Senin pagi untuk mencatat berat badan.' },
                    { key: 'promo_article', label: 'Info Promo & Artikel (Email)', desc: 'Berita terbaru mengenai promo program dan artikel kesehatan menarik.' },
                    { key: 'nutritionist_msg', label: 'Pesan dari Ahli Gizi (WA)', desc: 'Notifikasi langsung via WhatsApp saat ahli gizi mengirimkan pesan.' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="max-w-[80%]">
                        <p className="text-sm font-bold text-gray-800">{item.label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                      <button 
                        onClick={() => handleToggleNotif(item.key)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          notifSettings[item.key as keyof typeof notifSettings] ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                          notifSettings[item.key as keyof typeof notifSettings] ? 'left-7' : 'left-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              {/* TAB 2: DATA GIZI SAYA */}
              <Card className="p-8">
                <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <FiActivity className="text-green-600" /> Data Gizi & Fisik
                  </h3>
                  <Button size="sm" variant="outline" onClick={() => setIsNutritionModalOpen(true)}>
                    Update Data Gizi
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-center">
                    <p className="text-[10px] text-green-600 uppercase font-bold tracking-widest mb-1">Tinggi Badan</p>
                    <p className="text-2xl font-black text-green-800">{userData.client_profile?.height_cm || '-'} <span className="text-xs font-medium">cm</span></p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                    <p className="text-[10px] text-blue-600 uppercase font-bold tracking-widest mb-1">Berat Badan</p>
                    <p className="text-2xl font-black text-blue-800">{userData.client_profile?.weight_kg || '-'} <span className="text-xs font-medium">kg</span></p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-center">
                    <p className="text-[10px] text-purple-600 uppercase font-bold tracking-widest mb-1">BMI Sekarang</p>
                    <p className="text-2xl font-black text-purple-800">
                      {calculateBMI(userData.client_profile?.weight_kg, userData.client_profile?.height_cm)}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-gray-700">Kondisi Medis</h4>
                      <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[60px]">
                        {userData.client_profile?.medical_conditions || 'Tidak ada data.'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-gray-700">Alergi Makanan</h4>
                      <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[60px]">
                        {userData.client_profile?.allergies || 'Tidak ada data.'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-gray-700">Pantangan Diet</h4>
                    <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[60px]">
                      {userData.client_profile?.dietary_restrictions || 'Tidak ada data.'}
                    </p>
                  </div>
                </div>
              </Card>

              {/* TARGET PROGRAM */}
              <Card className="p-8">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Target Program</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-600">
                      <FiTarget size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Target Berat Badan</p>
                      <p className="text-lg font-bold text-gray-800">{userData.client_profile?.target_weight_kg || '-'} kg</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
                      <FiActivity size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Kebutuhan Kalori</p>
                      <p className="text-lg font-bold text-gray-800">{userData.client_profile?.calorie_target || '-'} kkal</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* UPDATE NUTRITION MODAL */}
      <Modal 
        isOpen={isNutritionModalOpen} 
        onClose={() => setIsNutritionModalOpen(false)}
        title="Update Data Gizi"
      >
        <form onSubmit={handleUpdateNutrition} className="space-y-6 pt-4">
          <div className="bg-blue-50 p-4 rounded-xl flex gap-3 border border-blue-100">
            <FiAlertCircle className="text-blue-600 mt-1 flex-shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Perubahan data gizi akan diinformasikan ke ahli gizi Anda untuk penyesuaian meal plan jika diperlukan.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Tinggi Badan (cm)" 
              type="number" 
              value={nutritionForm.height}
              onChange={(e) => setNutritionForm({ ...nutritionForm, height: e.target.value })}
            />
            <Input 
              label="Berat Sekarang (kg)" 
              type="number" 
              value={nutritionForm.weight}
              onChange={(e) => setNutritionForm({ ...nutritionForm, weight: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Kondisi Medis</label>
            <textarea
              className="w-full rounded-md border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600"
              rows={3}
              value={nutritionForm.medical_conditions}
              onChange={(e) => setNutritionForm({ ...nutritionForm, medical_conditions: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Alergi & Pantangan</label>
            <textarea
              className="w-full rounded-md border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600"
              rows={3}
              value={nutritionForm.allergies}
              onChange={(e) => setNutritionForm({ ...nutritionForm, allergies: e.target.value })}
            />
          </div>

          <Input 
            label="Target Berat Badan (kg)" 
            type="number" 
            value={nutritionForm.target_weight}
            onChange={(e) => setNutritionForm({ ...nutritionForm, target_weight: e.target.value })}
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsNutritionModalOpen(false)}>Batal</Button>
            <Button type="submit" className="flex-1" isLoading={isSaving}>Simpan Data</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientProfilePage;
