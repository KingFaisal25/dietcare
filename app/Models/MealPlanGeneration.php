<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MealPlanGeneration extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'program_enrollment_id',
        'params',
        'status',
        'result',
        'error_message',
        'generated_at',
    ];

    protected $casts = [
        'params' => 'array',
        'result' => 'array',
        'generated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
