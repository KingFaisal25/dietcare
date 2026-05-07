"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiImage, FiFileText,
  FiX, FiLoader, FiSave, FiExternalLink,
} from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import api from "@/lib/api";
import { toast } from "sonner";
import { getBackendBaseUrl } from "@/lib/url";

const STORAGE_BASE = getBackendBaseUrl() + "/storage/";
const storageUrl = (path?: string | null) => (path ? `${STORAGE_BASE}${path}` : null);

// ─── Types ───────────────────────────────────────────────────────────────────
interface GalleryImage { id: number; image_url: string }

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: string;
  status: "draft" | "published";
  image_path?: string;
  image_url?: string;
  images?: GalleryImage[];
  author?: { name: string };
  created_at: string;
}

interface BlogForm {
  title: string;
  content: string;
  category: string;
  status: "draft" | "published";
  coverFile: File | null;
  galleryFiles: File[];
  removeImageIds: number[];
}

const EMPTY_FORM: BlogForm = {
  title: "", content: "", category: "", status: "draft",
  coverFile: null, galleryFiles: [], removeImageIds: [],
};

const CATEGORIES = [
  "Gizi & Nutrisi", "Diet & Penurunan BB", "Kesehatan Ibu Hamil",
  "Olahraga", "Resep Sehat", "Kesehatan Klinis", "Tips Sehat", "Lainnya",
];

// ─── Blog Form Modal ──────────────────────────────────────────────────────────
function BlogFormModal({
  isOpen, post, onClose, onRefresh,
}: {
  isOpen: boolean;
  post: BlogPost | null;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [form, setForm] = useState<BlogForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [existingGallery, setExistingGallery] = useState<GalleryImage[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const isEdit = !!post;

  useEffect(() => {
    if (!isOpen) return;
    if (post) {
      setForm({
        title: post.title,
        content: post.content,
        category: post.category,
        status: post.status,
        coverFile: null,
        galleryFiles: [],
        removeImageIds: [],
      });
      setCoverPreview(post.image_url || storageUrl(post.image_path) || null);
      setExistingGallery(post.images || []);
    } else {
      setForm(EMPTY_FORM);
      setCoverPreview(null);
      setExistingGallery([]);
    }
    setGalleryPreviews([]);
    setErrors({});
  }, [post, isOpen]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Judul wajib diisi";
    else if (form.title.length > 255) e.title = "Judul maksimal 255 karakter";
    if (!form.content.trim()) e.content = "Konten wajib diisi";
    if (!form.category) e.category = "Kategori wajib dipilih";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Ukuran gambar maks 2MB"); return; }
    setForm(p => ({ ...p, coverFile: file }));
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentTotal = (existingGallery.length - form.removeImageIds.length) + form.galleryFiles.length;
    const slots = Math.max(0, 5 - currentTotal);
    if (slots === 0) { toast.error("Maksimal 5 gambar galeri"); return; }
    const valid = files.filter(f => f.size <= 2 * 1024 * 1024).slice(0, slots);
    if (valid.length < files.length) toast.warning("Beberapa gambar dilewati (> 2MB atau melebihi batas 5)");
    setForm(p => ({ ...p, galleryFiles: [...p.galleryFiles, ...valid] }));
    setGalleryPreviews(p => [...p, ...valid.map(f => URL.createObjectURL(f))]);
  };

  const removeExistingGalleryImg = (id: number) => {
    setForm(p => ({ ...p, removeImageIds: [...p.removeImageIds, id] }));
    setExistingGallery(p => p.filter(img => img.id !== id));
  };

  const removeNewGalleryImg = (idx: number) => {
    setForm(p => {
      const files = [...p.galleryFiles];
      files.splice(idx, 1);
      return { ...p, galleryFiles: files };
    });
    setGalleryPreviews(p => {
      const previews = [...p];
      previews.splice(idx, 1);
      return previews;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);

    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("content", form.content);
      payload.append("category", form.category);
      payload.append("status", form.status);
      if (form.coverFile) payload.append("image", form.coverFile);
      form.galleryFiles.forEach(f => payload.append("images[]", f));
      form.removeImageIds.forEach(id => payload.append("remove_images[]", String(id)));

      if (isEdit) {
        await api.post(`/admin/blogs/${post!.id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Artikel berhasil diperbarui");
      } else {
        await api.post("/admin/blogs", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Artikel berhasil dipublikasikan");
      }
      onRefresh();
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { errors?: Record<string, string | string[]> } } };
      if (err?.response?.status === 422) {
        const serverErrors = err.response?.data?.errors || {};
        const mapped: Record<string, string> = {};
        for (const [k, v] of Object.entries(serverErrors)) {
          mapped[k] = Array.isArray(v) ? v[0] : String(v);
        }
        setErrors(mapped);
        toast.error("Periksa kembali isian formulir");
      } else {
        toast.error("Gagal menyimpan artikel");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const totalGallery = existingGallery.length + form.galleryFiles.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-100 px-8 py-5 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="text-xl font-black text-neutral-900">
              {isEdit ? "Edit Artikel" : "Tulis Artikel Baru"}
            </h2>
            <p className="text-xs text-neutral-400 font-medium mt-0.5">
              {isEdit ? `Mengedit: ${post?.title}` : "Buat konten edukasi kesehatan baru"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-xl transition-all">
            <FiX className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-7">

          {/* ── Cover Image ── */}
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2">
              Gambar Cover <span className="text-neutral-400 font-normal">(opsional, maks 2MB)</span>
            </label>
            <div className="relative group">
              {coverPreview ? (
                <div className="relative w-full h-52 rounded-2xl overflow-hidden border-2 border-neutral-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                    <label className="cursor-pointer px-4 py-2 bg-white rounded-xl text-sm font-bold text-neutral-900 hover:bg-neutral-50">
                      Ganti Gambar
                      <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                    </label>
                    <button type="button" onClick={() => { setForm(p => ({ ...p, coverFile: null })); setCoverPreview(null); }}
                      className="px-4 py-2 bg-red-500 rounded-xl text-sm font-bold text-white hover:bg-red-600">
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-neutral-200 rounded-2xl cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-all">
                  <FiImage className="w-8 h-8 text-neutral-300 mb-2" />
                  <span className="text-sm font-bold text-neutral-400">Klik untuk unggah cover</span>
                  <span className="text-xs text-neutral-300 mt-1">JPG, PNG, GIF, WEBP maks 2MB</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                </label>
              )}
            </div>
          </div>

          {/* ── Gallery Images ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-neutral-700">
                Galeri Foto <span className="text-neutral-400 font-normal">(maks 5 gambar)</span>
              </label>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${totalGallery >= 5 ? 'bg-red-50 text-red-500' : 'bg-neutral-100 text-neutral-500'}`}>
                {totalGallery}/5
              </span>
            </div>

            {/* Existing gallery */}
            {existingGallery.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mb-3">
                {existingGallery.map(img => (
                  <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.image_url} alt="Gallery" className="w-full h-full object-cover" />
                    <button type="button"
                      onClick={() => removeExistingGalleryImg(img.id)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <FiX className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New gallery previews */}
            {galleryPreviews.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mb-3">
                {galleryPreviews.map((preview, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-brand-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="New" className="w-full h-full object-cover" />
                    <button type="button"
                      onClick={() => removeNewGalleryImg(idx)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <FiX className="w-5 h-5 text-white" />
                    </button>
                    <span className="absolute bottom-1 left-1 text-[9px] bg-brand-500 text-white px-1 rounded font-bold">Baru</span>
                  </div>
                ))}
              </div>
            )}

            {totalGallery < 5 && (
              <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-neutral-200 rounded-2xl cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-all w-fit">
                <FiImage className="text-neutral-400" />
                <span className="text-sm font-bold text-neutral-400">Tambah foto galeri</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
              </label>
            )}
          </div>

          {/* ── Title ── */}
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1.5">
              Judul Artikel <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Contoh: 5 Tips Diet Sehat untuk Pemula"
              className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium text-gray-900 bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder:text-neutral-400 ${errors.title ? "border-red-400 bg-red-50" : "border-neutral-200"}`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1 font-medium">{errors.title}</p>}
            <p className="text-xs text-neutral-400 mt-1">{form.title.length}/255 karakter</p>
          </div>

          {/* ── Category & Status ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium text-gray-900 bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all appearance-none ${errors.category ? "border-red-400 bg-red-50" : "border-neutral-200"}`}
              >
                <option value="">Pilih kategori...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1 font-medium">{errors.category}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {(["draft", "published"] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, status: s }))}
                    className={`flex-1 py-3 rounded-2xl border text-sm font-bold capitalize transition-all ${
                      form.status === s
                        ? s === "published"
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-amber-400 text-white border-amber-400"
                        : "bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100"
                    }`}
                  >
                    {s === "published" ? "Publikasikan" : "Draft"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1.5">
              Konten <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.content}
              onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              rows={14}
              placeholder="Tulis konten artikel di sini..."
              className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium text-gray-900 bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all resize-none leading-relaxed placeholder:text-neutral-400 ${errors.content ? "border-red-400 bg-red-50" : "border-neutral-200"}`}
            />
            {errors.content && <p className="text-xs text-red-500 mt-1 font-medium">{errors.content}</p>}
            <p className="text-xs text-neutral-400 mt-1">{form.content.length} karakter</p>
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl font-bold">
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl px-8 shadow-lg shadow-brand-100"
            >
              {isSaving
                ? <><FiLoader className="animate-spin mr-2 inline" />Menyimpan...</>
                : <><FiSave className="mr-2 inline" />{isEdit ? "Simpan Perubahan" : "Publikasikan"}</>
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BlogManagementPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/admin/blogs");
      // Paginated response has `data.data`; flat has `data`
      const raw = response.data?.data ?? response.data ?? [];
      setPosts(Array.isArray(raw) ? raw : raw.data ?? []);
    } catch {
      toast.error("Gagal memuat data blog");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Hapus artikel "${title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await api.delete(`/admin/blogs/${id}`);
      toast.success("Artikel berhasil dihapus");
      fetchPosts();
    } catch {
      toast.error("Gagal menghapus artikel");
    }
  };

  const handleCreate = () => { setEditingPost(null); setIsModalOpen(true); };
  const handleEdit   = (post: BlogPost) => { setEditingPost(post); setIsModalOpen(true); };
  const handleClose  = () => { setIsModalOpen(false); setEditingPost(null); };

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl shadow-sm border border-neutral-100 px-6 py-5">
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">Manajemen Blog</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Kelola artikel, edukasi, dan berita kesehatan DietCare.
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 text-[10px] font-black border border-brand-100">
                {posts.length} artikel
              </span>
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-5 rounded-2xl shadow-lg shadow-brand-100 transition-all shrink-0"
          >
            <FiPlus className="w-4 h-4" /> Tulis Artikel Baru
          </Button>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-md border border-neutral-100 overflow-hidden">
          {/* Search bar */}
          <div className="flex flex-col md:flex-row gap-3 p-5 border-b border-neutral-100">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                id="blog-search"
                type="text"
                placeholder="Cari judul atau kategori..."
                className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all placeholder:text-neutral-400"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-gray-600 font-medium hover:text-gray-900 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-all"
              >
                <FiX className="w-4 h-4" /> Reset
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="py-24 flex flex-col items-center gap-4 bg-white">
              <FiLoader className="w-9 h-9 text-brand-500 animate-spin" />
              <p className="text-gray-500 font-semibold text-sm">Memuat artikel...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-neutral-100">
                    <th className="px-5 py-3.5 text-[11px] font-black text-gray-500 uppercase tracking-wider">Artikel</th>
                    <th className="px-5 py-3.5 text-[11px] font-black text-gray-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-5 py-3.5 text-[11px] font-black text-gray-500 uppercase tracking-wider">Penulis</th>
                    <th className="px-5 py-3.5 text-[11px] font-black text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-[11px] font-black text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-5 py-3.5 text-[11px] font-black text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-100">
                  {filtered.map(post => (
                    <tr key={post.id} className="group hover:bg-brand-50/30 transition-colors">
                      {/* Article */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center overflow-hidden shrink-0">
                            {post.image_url || post.image_path ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={post.image_url || storageUrl(post.image_path) || ""}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FiImage className="text-neutral-300 w-5 h-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{post.title}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5 font-medium truncate max-w-[200px]">/{post.slug}</p>
                            {post.images && post.images.length > 0 && (
                              <p className="text-[10px] text-brand-600 font-bold mt-0.5">
                                +{post.images.length} foto galeri
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Category */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border border-neutral-200 bg-white text-gray-700 whitespace-nowrap">
                          {post.category}
                        </span>
                      </td>
                      {/* Author */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-[11px] font-black text-brand-700 shrink-0">
                            {post.author?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="text-sm text-gray-700 font-medium truncate max-w-[100px]">
                            {post.author?.name || '—'}
                          </span>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-4">
                        <Badge
                          variant={post.status === "published" ? "success" : "warning"}
                          className="text-[11px] font-bold capitalize px-2.5 py-1"
                        >
                          {post.status === "published" ? "Published" : "Draft"}
                        </Badge>
                      </td>
                      {/* Date */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-600 font-medium whitespace-nowrap">
                          {new Date(post.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {post.status === "published" && (
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Lihat publik"
                              className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                            >
                              <FiExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleEdit(post)}
                            title="Edit"
                            className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id, post.title)}
                            title="Hapus"
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={6} className="px-5 py-24 text-center bg-white">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center">
                            <FiFileText className="w-8 h-8 text-neutral-300" />
                          </div>
                          <div>
                            <p className="text-base font-bold text-gray-900">
                              {searchQuery ? "Tidak ada artikel yang cocok" : "Belum ada artikel"}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {searchQuery
                                ? `Tidak ditemukan hasil untuk "${searchQuery}"`
                                : "Mulai dengan membuat artikel pertama Anda."}
                            </p>
                          </div>
                          {!searchQuery && (
                            <Button
                              onClick={handleCreate}
                              className="mt-1 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-sm px-5 py-2"
                            >
                              <FiPlus className="mr-1.5 inline w-4 h-4" />
                              Buat Artikel Pertama
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <BlogFormModal
        isOpen={isModalOpen}
        post={editingPost}
        onClose={handleClose}
        onRefresh={fetchPosts}
      />
    </>
  );
}
