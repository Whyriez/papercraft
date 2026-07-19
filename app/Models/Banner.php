<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Banner extends Model
{
    protected $fillable = ['type', 'papercraft_id', 'title', 'image_path', 'link_url'];

    public function papercraft(): BelongsTo
    {
        return $this->belongsTo(Papercraft::class);
    }
}
