<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NutritionistScheduleSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'nutritionist_id',
        'weekday',
        'availability',
    ];

    public function nutritionist()
    {
        return $this->belongsTo(User::class, 'nutritionist_id');
    }
}
