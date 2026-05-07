<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

/**
 * Order Model — Menyimpan data transaksi pembayaran
 *
 * Status flow:
 *   pending → paid     (pembayaran berhasil)
 *   pending → cancelled (dibatalkan user/admin)
 *   pending → expired  (melewati batas waktu bayar)
 */
class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'program_id',
        'nutritionist_id',
        'promo_code_id',
        'order_code',
        'total_amount',
        'discount_amount',
        'final_amount',
        'status',
        'payment_method',
        'midtrans_token',
        'paid_at',
        'expired_at',
    ];

    protected $casts = [
        'total_amount'    => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'final_amount'    => 'decimal:2',
        'paid_at'         => 'datetime',
        'expired_at'      => 'datetime',
    ];

    // ── Relations ───────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function nutritionist()
    {
        return $this->belongsTo(User::class, 'nutritionist_id');
    }

    public function nutritionistProgram()
    {
        return $this->hasOne(NutritionistProgram::class);
    }

    public function promoCode()
    {
        return $this->belongsTo(PromoCode::class);
    }

    public function promoCodeUsage()
    {
        return $this->hasOne(PromoCodeUsage::class);
    }

    // ── Status Check Methods ────────────────────────

    /**
     * Apakah order sudah dibayar?
     */
    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    /**
     * Apakah order masih menunggu pembayaran?
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Apakah order sudah melewati batas waktu bayar?
     */
    public function isExpired(): bool
    {
        if ($this->status === 'expired') return true;

        // Cek jika melewati expired_at tapi status belum di-update
        if ($this->isPending() && $this->expired_at && Carbon::now()->gt($this->expired_at)) {
            // Auto-update status ke expired
            $this->update(['status' => 'expired']);
            return true;
        }

        return false;
    }

    /**
     * Apakah order dibatalkan?
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    // ── Helper Methods ──────────────────────────────

    /**
     * Generate order code unik: DCS-YYYYMMDD-XXXXX
     */
    public static function generateOrderCode(): string
    {
        $prefix = 'DCS';
        $date   = Carbon::now()->format('Ymd');
        $random = strtoupper(substr(uniqid(), -5));

        return "{$prefix}-{$date}-{$random}";
    }
}
