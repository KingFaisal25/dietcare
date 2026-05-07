<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'nutritionist_program_id',
        'sender_role',
        'message',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function nutritionistProgram()
    {
        return $this->belongsTo(NutritionistProgram::class);
    }
}
