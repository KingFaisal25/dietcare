## DietCare Salma (Laravel + Next.js)

Production checklist singkat untuk memastikan release aman dan stabil.

## Stack

- Backend: Laravel 12 + Sanctum + PostgreSQL
- Frontend: Next.js 15 (folder `frontend`)

## Local setup

1) Backend:
- `composer install`
- copy `.env.example` -> `.env`
- `php artisan key:generate`
- configure database credentials in `.env`
- `php artisan migrate --seed`
- `php artisan serve`

2) Frontend:
- `cd frontend`
- `npm install`
- copy `.env.local` values sesuai backend URL
- `npm run dev`

## Quality gates (wajib hijau)

- Backend tests: `php artisan test`
- Frontend lint: `cd frontend && npm run lint`
- Frontend build: `cd frontend && npm run build`

## Production readiness checklist

- **Env & Secrets**
- `APP_ENV=production`
- `APP_DEBUG=false`
- set `APP_URL` ke domain production
- set `FRONTEND_URL` (boleh comma-separated untuk multi-origin)
- isi credential sensitif via environment/secret manager (bukan hardcoded)

- **CORS**
- origin frontend production terdaftar di `FRONTEND_URL`
- `supports_credentials` aktif jika pakai cookie auth

- **Rate limit endpoint sensitif**
- login + reset password sudah dibatasi via named limiter
- endpoint public read memakai limiter khusus

- **Queue / Scheduler / Cache**
- jalankan worker queue untuk job reminder/notifikasi
- aktifkan scheduler (`php artisan schedule:work` atau cron)
- gunakan driver cache/session yang sesuai environment

- **Storage**
- jalankan `php artisan storage:link` di production bila file upload dipakai

- **Build & Deployment**
- deploy backend + frontend dalam mode production
- verifikasi endpoint publik, auth flow, dashboard role-based, dan webhook payment

## Security note

- Jangan commit nilai rahasia (`.env`, API keys, payment keys).
- Rotasi credential jika pernah terpapar di environment pengembangan.
