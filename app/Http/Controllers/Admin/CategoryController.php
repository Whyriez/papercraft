<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    // Menampilkan halaman Manajemen Kategori
    public function index()
    {
        // Ambil data rekursif untuk Tree View & Dropdown
        $categories = Category::whereNull('parent_id')->with('allChildren')->get();
        
        return Inertia::render('Admin/Category/Index', [
            'categories' => $categories
        ]);
    }

    // Memproses Tambah Kategori
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
        ]);

        Category::create([
            'name' => $request->name,
            // Tambahkan uniqid agar slug aman dari duplikasi
            'slug' => Str::slug($request->name) . '-' . uniqid(),
            'parent_id' => $request->parent_id,
        ]);

        // Karena kita pakai form di halaman yang sama, cukup kembali ke halaman sebelumnya
        return redirect()->back();
    }

    // Memproses Hapus Kategori
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        
        // Karena di migration kita pakai cascadeOnDelete(), 
        // hapus parent otomatis akan menghapus semua sub-kategorinya.
        $category->delete();

        return redirect()->back();
    }
}