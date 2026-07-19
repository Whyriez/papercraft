<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Papercraft;
use App\Models\PapercraftImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PapercraftController extends Controller
{
    // Menampilkan halaman List Data (Index)
    public function index(Request $request)
    {
        // Ambil data papercraft beserta relasi kategori (hingga level parent) dan gambar utama
        $query = Papercraft::with(['category.parent.parent', 'primaryImage'])->latest();

        // Filter: Pencarian (Search)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        // Filter: Kategori
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter: Status
        if ($request->filled('status')) {
            $isPublished = $request->status === 'published' ? true : false;
            $query->where('is_published', $isPublished);
        }

        // withQueryString() agar pagination tidak menghilangkan filter url saat pindah halaman
        $papercrafts = $query->paginate(10)->withQueryString();

        // Ambil kategori untuk opsi di dropdown filter
        $categories = Category::whereNull('parent_id')->with('allChildren')->get();

        return Inertia::render('Admin/Papercraft/Index', [
            'papercrafts' => $papercrafts,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'status']),
        ]);
    }

    // Menampilkan halaman Form Tambah
    public function create()
    {
        $categories = Category::whereNull('parent_id')->with('allChildren')->get();

        return Inertia::render('Admin/Papercraft/Create', [
            'categories' => $categories,
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
            'template_file' => 'nullable|file|mimes:pdf,zip,rar|max:20480',
        ]);

        $filePath = null;
        if ($request->hasFile('template_file')) {
            $uploadedPath = $request->file('template_file')->store('templates', 'public');
            $filePath = 'storage/'.$uploadedPath;
        }

        $papercraft = Papercraft::create([
            'title' => $request->title,
            'slug' => Str::slug($request->title).'-'.uniqid(),
            'category_id' => $request->category_id,
            'description' => $request->description,
            'file_path' => $filePath,
            'is_published' => $request->boolean('is_published'),
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                $path = $file->store('papercrafts', 'public');

                $papercraft->images()->create([
                    'image_path' => 'storage/'.$path,
                    'is_primary' => $index === 0 ? true : false,
                ]);
            }
        }

        return redirect()->route('admin.papercrafts.index')->with('success', 'Papercraft berhasil ditambahkan!');
    }

    public function edit($id)
    {
        $papercraft = Papercraft::with('images')->findOrFail($id);
        $categories = Category::whereNull('parent_id')->with('allChildren')->get();

        return Inertia::render('Admin/Papercraft/Edit', [
            'papercraft' => $papercraft,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, $id)
    {
        $papercraft = Papercraft::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'required|string',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg|max:4096',
            'template_file' => 'nullable|file|mimes:pdf,zip,rar|max:20480',
        ]);

        if ($request->hasFile('template_file')) {
            if ($papercraft->file_path) {
                $oldPath = str_replace('storage/', '', $papercraft->file_path);
                Storage::disk('public')->delete($oldPath);
            }

            $uploadedPath = $request->file('template_file')->store('templates', 'public');
            $papercraft->file_path = 'storage/'.$uploadedPath;
        }

        $papercraft->title = $request->title;
        $papercraft->category_id = $request->category_id;
        $papercraft->description = $request->description;
        $papercraft->is_published = $request->boolean('is_published');
        $papercraft->save();

        if ($request->hasFile('images')) {
            $hasPrimary = $papercraft->images()->where('is_primary', true)->exists();

            foreach ($request->file('images') as $index => $file) {
                $path = $file->store('papercrafts', 'public');

                $papercraft->images()->create([
                    'image_path' => 'storage/'.$path,
                    'is_primary' => (! $hasPrimary && $index === 0) ? true : false,
                ]);
            }
        }

        return redirect()->route('admin.papercrafts.index')->with('success', 'Papercraft berhasil diupdate!');
    }

    public function destroy($id)
    {
        $papercraft = Papercraft::with('images')->findOrFail($id);

        foreach ($papercraft->images as $image) {
            if ($image->image_path) {
                $path = str_replace('storage/', '', $image->image_path);
                Storage::disk('public')->delete($path);
            }
        }

        if ($papercraft->file_path) {
            $path = str_replace('storage/', '', $papercraft->file_path);
            Storage::disk('public')->delete($path);
        }

        $papercraft->delete();

        return redirect()->route('admin.papercrafts.index')->with('success', 'Papercraft berhasil dihapus!');
    }

    public function destroyImage($id)
    {
        $image = PapercraftImage::findOrFail($id);
        $papercraftId = $image->papercraft_id;
        $wasPrimary = $image->is_primary;

        if ($image->image_path) {
            $path = str_replace('storage/', '', $image->image_path);
            Storage::disk('public')->delete($path);
        }

        $image->delete();

        if ($wasPrimary) {
            $nextImage = PapercraftImage::where('papercraft_id', $papercraftId)->first();
            if ($nextImage) {
                $nextImage->update(['is_primary' => true]);
            }
        }

        return back()->with('success', 'Gambar berhasil dihapus!');
    }
}
