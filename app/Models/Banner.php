<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $fillable = ['type', 'papercraft_id', 'title', 'image_path', 'link_url'];

    public function papercraft()
    {
        return $this->belongsTo(Papercraft::class);
    }
}
