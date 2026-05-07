<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'duration_days',
        'max_consultations',
        'features',
        'is_active',
    ];

    protected $casts = [
        'features'  => 'array',
        'price'     => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // ── Relations ───────────────────────────────────
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
