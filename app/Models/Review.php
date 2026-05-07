<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'nutritionist_program_id',
        'client_id',
        'nutritionist_id',
        'rating',
        'title',
        'content',
        'is_featured',
        'is_approved',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function nutritionist()
    {
        return $this->belongsTo(User::class, 'nutritionist_id');
    }

    public function nutritionistProgram()
    {
        return $this->belongsTo(NutritionistProgram::class);
    }
}
