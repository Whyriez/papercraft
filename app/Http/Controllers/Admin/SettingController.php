<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function update(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'whatsapp'  => 'nullable|string',
            'email'     => 'nullable|email',
            'youtube'   => 'nullable|url',
            'tiktok'    => 'nullable|url',
            'instagram' => 'nullable|url',
        ]);

        // Looping data yang divalidasi dan simpan ke database menggunakan updateOrCreate
        foreach ($validated as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return back()->with('success', 'Pengaturan berhasil disimpan!');
    }
}
