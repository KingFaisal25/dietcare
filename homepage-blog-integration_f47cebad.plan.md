---
name: homepage-blog-integration
overview: Integrasikan artikel blog dari admin ke beranda publik dengan menampilkan artikel `published` terbaru, lalu tambahkan halaman detail blog publik modern di `/blog/[slug]`.
todos:
  - id: add-public-blog-api
    content: Tambah endpoint publik blog (list + detail by slug) untuk artikel published
    status: pending
  - id: homepage-blog-section
    content: Tambahkan section blog modern di beranda dengan loading/empty/error states
    status: pending
  - id: public-blog-detail-page
    content: Buat halaman detail blog publik baru di /blog/[slug]
    status: pending
  - id: verify-blog-integration
    content: Verifikasi route, API response, lint, build, dan flow klik card dari beranda
    status: pending
isProject: false
---

# Integrasi Blog ke Beranda

## Tujuan
- Artikel yang dibuat dari admin (`/admin/blogs`) otomatis muncul di beranda publik.
- Hanya artikel `published` yang ditampilkan.
- Card blog di beranda mengarah ke halaman detail blog publik baru (`/blog/[slug]`).
- Tampilan section blog di beranda modern, kreatif, dan konsisten dengan desain existing.

## Perubahan backend
- Tambahkan endpoint publik untuk listing & detail blog:
  - `GET /api/public/blogs` (published, latest, optional `limit`)
  - `GET /api/public/blogs/{slug}`
- Implementasi controller publik blog (atau pisah dari admin controller) agar response stabil untuk frontend.
- Validasi model query pada `BlogPost`:
  - filter `status = published`
  - urut `published_at` desc fallback `created_at`
- Daftarkan route baru di [c:/dietcaresalma/routes/api.php](c:/dietcaresalma/routes/api.php) dengan limiter public read.

## Perubahan frontend beranda
- Update [c:/dietcaresalma/frontend/app/(public)/page.tsx](c:/dietcaresalma/frontend/app/(public)/page.tsx):
  - fetch artikel blog dari endpoint publik baru.
  - tambah section blog modern (headline + featured card + grid artikel + CTA).
  - state lengkap: loading, empty, error fallback.
  - gunakan `Image` untuk thumbnail + metadata (kategori, tanggal, penulis/ringkasan).
- Pastikan URL API memakai helper yang sudah ada (`buildApiUrl`) agar tidak duplikasi `/api`.

## Halaman detail blog publik
- Buat route page baru:
  - [c:/dietcaresalma/frontend/app/(public)/blog/[slug]/page.tsx](c:/dietcaresalma/frontend/app/(public)/blog/[slug]/page.tsx)
- Muat data via endpoint detail publik.
- Desain detail page modern:
  - hero image, judul, kategori, tanggal, author
  - body content yang readable
  - fallback untuk not found/error.

## Konsistensi admin-blog existing
- Pertahankan alur create/update admin di [c:/dietcaresalma/frontend/app/(admin)/admin/blogs/page.tsx](c:/dietcaresalma/frontend/app/(admin)/admin/blogs/page.tsx) dan [c:/dietcaresalma/app/Http/Controllers/Admin/BlogController.php](c:/dietcaresalma/app/Http/Controllers/Admin/BlogController.php).
- Pastikan ketika status artikel `published`, langsung terbaca oleh endpoint publik tanpa perubahan manual lain.

## Verifikasi
- Backend:
  - route baru terdaftar
  - endpoint publik blog mengembalikan JSON expected
- Frontend:
  - `npm run lint` bersih
  - `npm run build` lulus
  - beranda menampilkan artikel published terbaru
  - klik card membuka `/blog/[slug]` dengan data benar

## Alur data
```mermaid
flowchart LR
  adminUI[AdminBlogsUI] -->|POST or PUT| adminApi[AdminBlogController]
  adminApi --> blogTable[(blog_posts)]
  homePage[PublicHomePage] -->|GET /api/public/blogs| publicBlogApi[PublicBlogController]
  publicBlogApi --> blogTable
  homePage --> blogDetailPage[BlogDetailPage]
  blogDetailPage -->|GET /api/public/blogs/{slug}| publicBlogApi
```