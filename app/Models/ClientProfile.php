<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'height_cm',
        'weight_kg',
        'age',
        'birth_date',
        'city',
        'gender',
        'activity_level',
        'medical_conditions',
        'allergies',
        'dietary_preferences',
        'dietary_restrictions',
        'target_type',
        'target_weight_kg',
        'bmi',
        'bmr',
        'tdee',
        'calorie_target',
    ];

    protected $casts = [
        'medical_conditions'   => 'array',
        'allergies'            => 'array',
        'dietary_preferences'  => 'array',
        'birth_date'           => 'date',
        'height_cm'            => 'decimal:2',
        'weight_kg'            => 'decimal:2',
        'bmi'                  => 'decimal:2',
        'bmr'                  => 'decimal:2',
        'tdee'                 => 'decimal:2',
        'target_weight_kg'     => 'decimal:2',
    ];

    // ── Relations ───────────────────────────────────────────
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
