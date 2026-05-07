<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    use HasFactory;

    protected $fillable = [
        'nutritionist_program_id',
        'type',
        'status',
        'scheduled_at',
        'duration_minutes',
        'notes',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
    ];

    public function nutritionistProgram()
    {
        return $this->belongsTo(NutritionistProgram::class);
    }
}
