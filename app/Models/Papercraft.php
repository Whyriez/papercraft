<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Papercraft extends Model
{
    protected $fillable = [
        'category_id', 'title', 'slug', 'description', 
        'file_path', 'is_published'
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    // Mengambil semua gambar galeri
    public function images(): HasMany
    {
        return $this->hasMany(PapercraftImage::class);
    }

    // Helper: Hanya mengambil 1 gambar utama untuk thumbnail di landing page
    public function primaryImage(): HasOne
    {
        return $this->hasOne(PapercraftImage::class)->where('is_primary', true);
    }
}