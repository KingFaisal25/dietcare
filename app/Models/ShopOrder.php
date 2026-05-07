<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ShopOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number', 'user_id', 'customer_name', 'address', 'phone',
        'delivery_type', 'delivery_time', 'payment_method',
        'subtotal', 'delivery_fee', 'total',
        'status', 'tracking_code', 'notes',
        'processed_at', 'shipped_at', 'delivered_at',
    ];

    protected $casts = [
        'subtotal'     => 'float',
        'delivery_fee' => 'float',
        'total'        => 'float',
        'processed_at' => 'datetime',
        'shipped_at'   => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(ShopOrderItem::class, 'shop_order_id');
    }

    public static function generateOrderNumber(): string
    {
        return 'DS-' . strtoupper(substr(md5(uniqid()), 0, 8));
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pending'    => 'Menunggu',
            'diproses'   => 'Diproses',
            'dikirim'    => 'Dikirim',
            'sampai'     => 'Sampai',
            'dibatalkan' => 'Dibatalkan',
            default      => ucfirst($this->status),
        };
    }
}
