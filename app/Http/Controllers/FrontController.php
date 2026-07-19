<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Models\Category;
use App\Models\Papercraft;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FrontController extends Controller
{
    public function index(Request $request)
    {
        // Ambil kategori beserta childnya untuk sidebar
        $categories = Category::whereNull('parent_id')->with('children.children')->get();

        // Cek apakah user mem-filter data
        $isFiltered = $request->filled('search') || $request->filled('category') || $request->filled('all');

        $payload = [
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'all']),
            'isFiltered' => $isFiltered,
            'banners' => Banner::with('papercraft.primaryImage', 'papercraft.category')->latest()->get(),
        ];

        if ($isFiltered) {
            // MODE 1: FILTER KATEGORI, SEARCH, ATAU SEMUA KATEGORI (PAGINATED)
            $query = Papercraft::with(['primaryImage', 'category'])->where('is_published', true);

            // ==========================================
            // FILTER PENCARIAN YANG LEBIH PINTAR
            // ==========================================
            if ($request->filled('search')) {
                $searchTerm = $request->search;

                // 1. Cari kategori yang namanya mirip dengan kata kunci
                $matchedCategories = Category::with('children.children')
                    ->where('name', 'like', '%'.$searchTerm.'%')
                    ->get();

                // 2. Kumpulkan semua ID kategori tersebut beserta turunannya
                $searchCategoryIds = [];
                foreach ($matchedCategories as $cat) {
                    $searchCategoryIds[] = $cat->id;
                    foreach ($cat->children as $child) {
                        $searchCategoryIds[] = $child->id;
                        foreach ($child->children as $grandchild) {
                            $searchCategoryIds[] = $grandchild->id;
                        }
                    }
                }

                // 3. Terapkan filter: Cari di Judul ATAU di ID Kategori yang cocok
                $query->where(function ($q) use ($searchTerm, $searchCategoryIds) {
                    $q->where('title', 'like', '%'.$searchTerm.'%');

                    if (! empty($searchCategoryIds)) {
                        $q->orWhereIn('category_id', $searchCategoryIds);
                    }
                });
            }

            // ==========================================
            // FILTER KLIK KATEGORI DARI SIDEBAR
            // ==========================================
            if ($request->filled('category')) {
                $category = Category::with('children.children')->where('slug', $request->category)->firstOrFail();
                $payload['activeCategory'] = $category;

                $categoryIds = [$category->id];

                foreach ($category->children as $child) {
                    $categoryIds[] = $child->id;
                    foreach ($child->children as $grandchild) {
                        $categoryIds[] = $grandchild->id;
                    }
                }

                $query->whereIn('category_id', $categoryIds);
            }

            // Gunakan pagination
            $payload['papercrafts'] = $query->latest()->paginate(12)->withQueryString();
        } else {
            // MODE 2: HALAMAN AWAL DEFAULT (SHOWCASE TANPA PAGINATION)

            $payload['latestPapercrafts'] = Papercraft::with(['primaryImage', 'category'])
                ->where('is_published', true)
                ->latest()
                ->limit(3)
                ->get();

            $payload['categorySections'] = Category::whereNull('parent_id')
                ->with(['papercrafts' => function ($q) {
                    $q->where('is_published', true)->latest()->limit(4);
                }, 'papercrafts.primaryImage', 'papercrafts.category'])
                ->get()
                ->filter(fn ($cat) => $cat->papercrafts->isNotEmpty())
                ->values();
        }

        return Inertia::render('Home', $payload);
    }

    public function show($slug)
    {
        $papercraft = Papercraft::with(['images', 'category.parent.parent'])
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        $related = Papercraft::with('primaryImage')
            ->where('category_id', $papercraft->category_id)
            ->where('id', '!=', $papercraft->id)
            ->where('is_published', true)
            ->latest()
            ->take(4)
            ->get();

        return Inertia::render('Papercraft/Detail', [
            'papercraft' => $papercraft,
            'related' => $related,
        ]);
    }
}
