<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FoodDiaryEntry extends Model
{
    use HasFactory;

    protected $table = 'food_diary_entries';

    protected $fillable = [
        'user_id',
        'food_id',
        'food_name_snapshot',
        'meal_type',
        'quantity_gram',
        'calories',
        'protein',
        'carbs',
        'fat',
        'fiber',
        'eaten_at',
        'image_path',
        'source',
        'note',
    ];

    protected $casts = [
        'eaten_at' => 'date',
        'quantity_gram' => 'float',
        'calories' => 'float',
        'protein' => 'float',
        'carbs' => 'float',
        'fat' => 'float',
        'fiber' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function food()
    {
        return $this->belongsTo(Food::class);
    }
}
