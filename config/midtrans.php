<?php

/**
 * Konfigurasi Midtrans Payment Gateway
 *
 * Server Key & Client Key didapat dari:
 * https://dashboard.midtrans.com → Settings → Access Keys
 *
 * Saat development, gunakan mode Sandbox:
 * - Server Key: SB-Mid-server-xxx
 * - Client Key: SB-Mid-client-xxx
 */
return [
    // Server key untuk transaksi backend (charge, refund, dll)
    'server_key'     => env('MIDTRANS_SERVER_KEY', ''),

    // Client key untuk Snap.js di frontend
    'client_key'     => env('MIDTRANS_CLIENT_KEY', ''),

    // false = Sandbox (testing), true = Production (live)
    'is_production'  => env('MIDTRANS_IS_PRODUCTION', false),

    // Otomatis sanitize input dari karakter berbahaya
    'is_sanitized'   => true,

    // Aktifkan 3D Secure untuk kartu kredit (wajib di Indonesia)
    'is_3ds'         => true,

    // URL notifikasi webhook dari Midtrans
    // Midtrans akan POST ke URL ini saat status pembayaran berubah
    'notification_url' => env('MIDTRANS_NOTIFICATION_URL', '/api/payment/webhook'),

    // Durasi expiry transaksi (dalam menit)
    'expiry_duration' => env('MIDTRANS_EXPIRY_DURATION', 1440), // 24 jam default

    // Snap URL
    'snap_url' => env('MIDTRANS_IS_PRODUCTION', false)
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js',
];
