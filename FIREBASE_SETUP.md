# 🔥 Panduan Setup Firebase Realtime Database

## 1. Buat Akun & Project Firebase

1. Buka [firebase.google.com](https://firebase.google.com) → login dengan Google Account
2. Klik **"Go to Console"** → **"Add project"**
3. Nama project: `dietcare-salma` (atau nama lain)
4. Matikan Google Analytics (tidak diperlukan) → **Create project**
5. Tunggu selesai → klik **Continue**

## 2. Buat Web App

1. Di dashboard project, klik ikon **</> (Web)** untuk menambah web app
2. Nama app: `DietCare Web` → klik **Register app**
3. Firebase akan menampilkan konfigurasi seperti:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "dietcare-salma.firebaseapp.com",
  databaseURL: "https://dietcare-salma-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dietcare-salma",
  storageBucket: "dietcare-salma.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

4. **Copy semua value** di atas ke file `frontend/.env.local`

## 3. Aktifkan Realtime Database

1. Di sidebar Firebase Console → **Build** → **Realtime Database**
2. Klik **"Create Database"**
3. Pilih lokasi: **asia-southeast1 (Singapore)** ← terdekat dengan Indonesia
4. Pilih **"Start in test mode"** → klik **Enable**

## 4. Set Security Rules

Setelah database aktif, buka tab **Rules** dan paste:

```json
{
  "rules": {
    "chats": {
      "$chatRoomId": {
        ".read": true,
        ".write": true,
        "messages": {
          ".indexOn": ["timestamp"]
        }
      }
    }
  }
}
```

> **Catatan**: Rules di atas adalah mode development (open access).
> Untuk production, ganti dengan rules yang memvalidasi user ID.

## 5. Update `.env.local`

Buka `frontend/.env.local` dan ganti placeholder:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dietcare-salma.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://dietcare-salma-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dietcare-salma
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dietcare-salma.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 6. Restart Dev Server

```bash
cd frontend
npm run dev
```

Selesai! Buka `/konsultasi` untuk mulai chat. 🎉
