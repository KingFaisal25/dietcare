<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WeightLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'date',
        'weight_kg',
        'waist_cm',
        'hip_cm',
        'arm_cm',
        'thigh_cm',
        'notes',
    ];

    protected $casts = [
        'date'      => 'date',
        'weight_kg' => 'decimal:2',
        'waist_cm'  => 'decimal:2',
        'hip_cm'    => 'decimal:2',
        'arm_cm'    => 'decimal:2',
        'thigh_cm'  => 'decimal:2',
    ];

    // ── Relations ───────────────────────────────────────────
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }
}
