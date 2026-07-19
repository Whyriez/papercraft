<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Papercraft;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Models\PapercraftImage;
use Illuminate\Support\Facades\Storage;

class PapercraftController extends Controller
{
    // Menampilkan halaman List Data (Index)
    public function index()
    {
        $papercrafts = Papercraft::with('category', 'primaryImage')->latest()->paginate(10);
        return Inertia::render('Admin/Papercraft/Index', [
            'papercrafts' => $papercrafts
        ]);
    }

    // Menampilkan halaman Form Tambah
    public function create()
    {
        // Ambil kategori parent beserta seluruh sub-kategorinya secara rekursif
        $categories = Category::whereNull('parent_id')->with('allChildren')->get();

        return Inertia::render('Admin/Papercraft/Create', [
            'categories' => $categories
        ]);
    }

    // Memproses data dan upload gambar
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'required|string',
            'images' => 'required|array|min:1',
            'images.*' => 'image|mimes:jpeg,png,jpg|max:4096',
            // Tambahan: Validasi file template (opsional, maks 20MB)
            'template_file' => 'nullable|file|mimes:pdf,zip,rar|max:20480',
        ]);

        // Proses Upload File Template (Jika Ada)
        $filePath = null;
        if ($request->hasFile('template_file')) {
            // Simpan ke storage/app/public/templates
            $uploadedPath = $request->file('template_file')->store('templates', 'public');
            $filePath = 'storage/' . $uploadedPath;
        }

        // 1. Simpan Data Papercraft
        $papercraft = Papercraft::create([
            'title' => $request->title,
            'slug' => Str::slug($request->title) . '-' . uniqid(),
            'category_id' => $request->category_id,
            'description' => $request->description,
            'file_path' => $filePath, // <--- Simpan path file di sini
            'is_published' => true,
        ]);

        // 2. Proses Upload Multiple Images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                $path = $file->store('papercrafts', 'public');

                $papercraft->images()->create([
                    'image_path' => 'storage/' . $path,
                    'is_primary' => $index === 0 ? true : false,
                ]);
            }
        }

        return redirect()->route('admin.papercrafts.index');
    }

    public function edit($id)
    {
        $papercraft = Papercraft::with('images')->findOrFail($id);
        $categories = Category::whereNull('parent_id')->with('allChildren')->get();

        return Inertia::render('Admin/Papercraft/Edit', [
            'papercraft' => $papercraft,
            'categories' => $categories
        ]);
    }

    // Memproses Data Edit (Kerangka)
    public function update(Request $request, $id)
    {
        $papercraft = Papercraft::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'required|string',
            // Gambar tidak wajib diisi saat edit (karena mungkin cuma mau ubah teks)
            'images' => 'nullable|array', 
            'images.*' => 'image|mimes:jpeg,png,jpg|max:4096',
            'template_file' => 'nullable|file|mimes:pdf,zip,rar|max:20480',
        ]);

        // 1. Update File Template (Jika user upload yang baru)
        if ($request->hasFile('template_file')) {
            // Hapus file lama dari storage jika ada
            if ($papercraft->file_path) {
                $oldPath = str_replace('storage/', '', $papercraft->file_path);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }
            
            // Simpan file baru
            $uploadedPath = $request->file('template_file')->store('templates', 'public');
            $papercraft->file_path = 'storage/' . $uploadedPath;
        }

        // 2. Update Teks Data Utama
        $papercraft->title = $request->title;
        $papercraft->category_id = $request->category_id;
        $papercraft->description = $request->description;
        // Catatan: Slug sengaja tidak kita update agar URL SEO tidak rusak/mati
        $papercraft->save();

        // 3. Tambahkan Gambar Baru (Jika user menambahkan gambar)
        if ($request->hasFile('images')) {
            // Cek apakah papercraft ini sudah punya primary image sebelumnya
            $hasPrimary = $papercraft->images()->where('is_primary', true)->exists();
            
            foreach ($request->file('images') as $index => $file) {
                $path = $file->store('papercrafts', 'public');

                $papercraft->images()->create([
                    'image_path' => 'storage/' . $path,
                    // Jika sebelumnya belum punya primary, jadikan gambar pertama ini sebagai primary
                    'is_primary' => (!$hasPrimary && $index === 0) ? true : false,
                ]);
            }
        }

        return redirect()->route('admin.papercrafts.index');
    }

    // Memproses Hapus Data
    public function destroy($id)
    {
        $papercraft = Papercraft::with('images')->findOrFail($id);

        // 1. Hapus semua file gambar fisik dari Storage
        foreach ($papercraft->images as $image) {
            if ($image->image_path) {
                $path = str_replace('storage/', '', $image->image_path);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($path);
            }
        }

        // 2. Hapus file template (PDF/ZIP) dari Storage jika ada
        if ($papercraft->file_path) {
            $path = str_replace('storage/', '', $papercraft->file_path);
            \Illuminate\Support\Facades\Storage::disk('public')->delete($path);
        }

        // 3. Hapus data dari Database (gambar otomatis terhapus karena relasi cascadeOnDelete)
        $papercraft->delete();

        return redirect()->route('admin.papercrafts.index');
    }

    // Menghapus 1 gambar spesifik dari Galeri
    public function destroyImage($id)
    {
        $image = PapercraftImage::findOrFail($id);
        $papercraftId = $image->papercraft_id;
        $wasPrimary = $image->is_primary;

        // 1. Hapus file fisik dari Storage
        if ($image->image_path) {
            $path = str_replace('storage/', '', $image->image_path);
            Storage::disk('public')->delete($path);
        }

        // 2. Hapus data dari database
        $image->delete();

        // 3. Jika yang dihapus adalah gambar Primary, cari gambar lain untuk dijadikan Primary
        if ($wasPrimary) {
            $nextImage = PapercraftImage::where('papercraft_id', $papercraftId)->first();
            if ($nextImage) {
                $nextImage->update(['is_primary' => true]);
            }
        }

        return back();
    }
}
