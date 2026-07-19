<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Papercraft;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FrontController extends Controller
{
    // Halaman Landing Page
    public function index(Request $request) // <-- Tambahkan Request $request
    {
        $categories = Category::whereNull('parent_id')->with('allChildren')->get();

        // Siapkan query dasar
        $query = Papercraft::with(['primaryImage', 'category'])
            ->where('is_published', true);

        // Jika ada inputan 'search' dari user, filter berdasarkan judul
        if ($request->has('search') && $request->search != '') {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Ambil data, gunakan withQueryString() agar jika user pindah halaman (pagination), keyword search-nya tidak hilang
        $papercrafts = $query->latest()->paginate(12)->withQueryString();

        return Inertia::render('Home', [
            'categories' => $categories,
            'papercrafts' => $papercrafts,
            // Lempar kembali keyword pencarian ke frontend agar teks di input form tidak hilang
            'filters' => $request->only(['search']),
        ]);
    }

    // Halaman Detail Papercraft
    public function show($slug)
    {
        $papercraft = Papercraft::with(['images', 'category.parent.parent'])
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        // Ambil 4 papercraft lain dalam kategori yang sama, kecualikan yang sedang dibuka
        $related = Papercraft::with('primaryImage')
            ->where('category_id', $papercraft->category_id)
            ->where('id', '!=', $papercraft->id)
            ->where('is_published', true)
            ->latest()
            ->take(4)
            ->get();

        return Inertia::render('Papercraft/Detail', [
            'papercraft' => $papercraft,
            'related' => $related, // Kirim ke view
        ]);
    }
}
