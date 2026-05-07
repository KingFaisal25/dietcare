<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ShopProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'description', 'price', 'image',
        'calories', 'protein', 'fat', 'carbs',
        'category', 'is_healthy', 'is_nutritionist_recommended',
        'nutritionist_label', 'stock', 'is_active',
    ];

    protected $casts = [
        'price'    => 'float',
        'calories' => 'float',
        'protein'  => 'float',
        'fat'      => 'float',
        'carbs'    => 'float',
        'is_healthy' => 'boolean',
        'is_nutritionist_recommended' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function orderItems()
    {
        return $this->hasMany(ShopOrderItem::class);
    }

    public function getImageUrlAttribute(): string
    {
        if (!$this->image) {
            return asset('images/placeholder-food.png');
        }
        if (str_starts_with($this->image, 'http')) {
            return $this->image;
        }
        return asset('storage/' . $this->image);
    }
}
