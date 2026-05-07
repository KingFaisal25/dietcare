# Integrasi AI DietCare Salma

Sistem ini mendukung beberapa penyedia AI (AI Providers) dengan mekanisme switching yang mudah melalui file `.env`.

## Penyedia AI yang Didukung

### 1. OpenRouter (Rekomendasi Gratis untuk Teks)
- **URL**: [https://openrouter.ai/](https://openrouter.ai/)
- **Kelebihan**: Akses ke banyak model (Gemma, Mistral, Llama) secara gratis atau sangat murah. Kompatibel dengan API OpenAI.
- **Model Gratis Populer**: `google/gemma-7b-it:free`, `mistralai/mistral-7b-instruct:free`.

### 2. Google Gemini (Rekomendasi Gratis untuk Vision)
- **URL**: [https://aistudio.google.com/](https://aistudio.google.com/)
- **Kelebihan**: Tier gratis yang sangat murah hati (15 RPM untuk Gemini 1.5 Flash). Sangat kuat untuk analisis gambar (Food Photo Recognition).
- **Model**: `gemini-1.5-flash`.

### 3. OpenAI (Berbayar)
- **URL**: [https://platform.openai.com/](https://platform.openai.com/)
- **Kelebihan**: Performa terbaik (GPT-4o).
- **Model**: `gpt-4o`, `gpt-4o-mini`.

## Konfigurasi (.env)

Tambahkan variabel berikut ke file `.env` Anda:

```env
# Pilih provider: openrouter, gemini, atau openai
AI_PROVIDER=openrouter

# Konfigurasi OpenRouter
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=google/gemma-7b-it:free

# Konfigurasi Gemini
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-1.5-flash

# Konfigurasi OpenAI
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o
```

## Mekanisme Fallback & Abstraksi

Semua fitur AI (Meal Plan, Food Analysis, Chatbot) menggunakan `AIManager` dan `AIServiceInterface`. Hal ini memungkinkan:
1. **Mudah Migrasi**: Cukup ganti `AI_PROVIDER` di `.env` tanpa mengubah kode logika bisnis.
2. **Multi-Model**: Anda bisa menggunakan provider yang berbeda untuk fitur yang berbeda jika diperlukan dengan memanggil `aiManager->driver('gemini')` secara spesifik di controller.
3. **Logging**: Semua penggunaan (tokens & cost) dicatat secara otomatis untuk memantau penggunaan API.
