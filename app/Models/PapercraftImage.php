<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PapercraftImage extends Model
{
    protected $fillable = ['papercraft_id', 'image_path', 'is_primary'];

    public function papercraft(): BelongsTo
    {
        return $this->belongsTo(Papercraft::class);
    }
}
