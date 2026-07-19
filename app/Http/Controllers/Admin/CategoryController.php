<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::whereNull('parent_id')->with('allChildren')->get();

        return Inertia::render('Admin/Category/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('category_images', 'public');
        }

        Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name).'-'.uniqid(),
            'parent_id' => $request->parent_id,
            'image_path' => $imagePath,
        ]);

        return redirect()->back();
    }

    // 🌟 FUNGSI BARU: UPDATE KATEGORI
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        // Cegah kategori menjadikan dirinya sendiri sebagai parent
        if ($request->parent_id == $category->id) {
            return back()->withErrors(['parent_id' => 'Kategori tidak boleh menjadi induk bagi dirinya sendiri.']);
        }

        $data = [
            'name' => $request->name,
            'parent_id' => $request->parent_id,
        ];

        // Ubah slug hanya jika nama berubah
        if ($request->name !== $category->name) {
            $data['slug'] = Str::slug($request->name).'-'.uniqid();
        }

        if ($request->hasFile('image')) {
            // Hapus gambar lama jika ada
            if ($category->image_path) {
                Storage::disk('public')->delete($category->image_path);
            }
            $data['image_path'] = $request->file('image')->store('category_images', 'public');
        }

        $category->update($data);

        return redirect()->back();
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        if ($category->image_path) {
            Storage::disk('public')->delete($category->image_path);
        }

        $category->delete();

        return redirect()->back();
    }
}
