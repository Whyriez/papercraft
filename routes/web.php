<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\PapercraftController;
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
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Route CRUD Admin Papercraft
    Route::resource('admin/papercrafts', PapercraftController::class)->names('admin.papercrafts');

    Route::delete('admin/papercraft-images/{id}', [PapercraftController::class, 'destroyImage'])->name('admin.papercraft-images.destroy');

    Route::resource('admin/categories', CategoryController::class)
        ->only(['index', 'store', 'destroy'])
        ->names('admin.categories');

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    
});