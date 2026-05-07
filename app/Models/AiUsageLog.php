<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiUsageLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'tokens_used',
        'cost_usd',
        'feature',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
