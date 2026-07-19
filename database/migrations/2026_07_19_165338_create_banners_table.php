<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['papercraft', 'custom'])->default('papercraft');

            // Untuk tipe 'papercraft'
            $table->foreignId('papercraft_id')->nullable()->constrained('papercrafts')->cascadeOnDelete();

            // Untuk tipe 'custom'
            $table->string('title')->nullable();
            $table->string('image_path')->nullable();
            $table->string('link_url')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};
