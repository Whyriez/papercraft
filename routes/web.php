<?php

use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\PapercraftController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FrontController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| AREA PUBLIK (Tanpa Login)
|--------------------------------------------------------------------------
*/

Route::get('/', [FrontController::class, 'index'])->name('home');
Route::get('/papercraft/{slug}', [FrontController::class, 'show'])->name('papercraft.show');

// Route Otentikasi
Route::get('/login', [AuthController::class, 'showLogin'])->name('login')->middleware('guest');
Route::post('/login', [AuthController::class, 'authenticate']);

/*
|--------------------------------------------------------------------------
| AREA ADMIN (Wajib Login)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {

    // Halaman Utama Dashboard
    Route::get('/dashboard', function () {
        $banners = \App\Models\Banner::with('papercraft.primaryImage', 'papercraft.category')->latest()->get();
        $papercrafts = \App\Models\Papercraft::latest()->get();

        return Inertia::render('Dashboard', [
            'banners' => $banners,
            'papercrafts' => $papercrafts,
        ]);
    })->name('dashboard');

    // Route CRUD Admin Papercraft
    Route::resource('admin/papercrafts', PapercraftController::class)->names('admin.papercrafts');

    Route::delete('admin/papercraft-images/{id}', [PapercraftController::class, 'destroyImage'])->name('admin.papercraft-images.destroy');

    Route::put('/admin/categories/{id}', [CategoryController::class, 'update'])->name('admin.categories.update');
    Route::resource('admin/categories', CategoryController::class)
        ->only(['index', 'store', 'destroy'])
        ->names('admin.categories');

    Route::post('/admin/banners', [BannerController::class, 'store'])->name('admin.banners.store');
    Route::delete('/admin/banners/{id}', [BannerController::class, 'destroy'])->name('admin.banners.destroy');

    Route::post('/admin/settings', [SettingController::class, 'update'])->name('settings.update');

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});
