<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Papercraft;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PapercraftSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Setup Kategori Dinamis
        $cosplay = Category::create([
            'name' => 'Cosplay',
            'slug' => Str::slug('Cosplay'),
        ]);

        // --- Sub: Helmet ---
        $helmet = $cosplay->children()->create([
            'name' => 'Helmet',
            'slug' => Str::slug('Cosplay Helmet'),
        ]);

        $helmetAnimal = $helmet->children()->create([
            'name' => 'Animal',
            'slug' => Str::slug('Helmet Animal'),
        ]);

        $helmetCharacter = $helmet->children()->create([
            'name' => 'Character',
            'slug' => Str::slug('Helmet Character'),
        ]);

        // --- Sub: Mask ---
        $mask = $cosplay->children()->create([
            'name' => 'Mask',
            'slug' => Str::slug('Cosplay Mask'),
        ]);

        $mask->children()->createMany([
            ['name' => 'Animal', 'slug' => Str::slug('Mask Animal')],
            ['name' => 'Character', 'slug' => Str::slug('Mask Character')],
        ]);

        // --- Sub: Suit ---
        $suit = $cosplay->children()->create([
            'name' => 'Suit',
            'slug' => Str::slug('Cosplay Suit'),
        ]);

        // 2. Setup Sampel Data Papercrafts beserta Gambarnya
        $foxHelmet = Papercraft::create([
            'category_id' => $helmetAnimal->id,
            'title' => 'Fox Helmet Low Poly',
            'slug' => Str::slug('Fox Helmet Low Poly'),
            'description' => 'Helm rubah dengan gaya low poly, cocok untuk pemula.',
            'is_published' => true,
        ]);

        // Insert multiple images untuk Fox Helmet
        $foxHelmet->images()->createMany([
            ['image_path' => 'samples/fox-helmet-front.jpg', 'is_primary' => true],  // Ini jadi thumbnail
            ['image_path' => 'samples/fox-helmet-side.jpg', 'is_primary' => false], // Ini masuk galeri detail
            ['image_path' => 'samples/fox-helmet-back.jpg', 'is_primary' => false], // Ini masuk galeri detail
        ]);

        $ironManHelmet = Papercraft::create([
            'category_id' => $helmetCharacter->id,
            'title' => 'Iron Man Mark 85 Helmet',
            'slug' => Str::slug('Iron Man Mark 85 Helmet'),
            'description' => 'Helm Iron Man skala 1:1, membutuhkan ketelitian tinggi.',
            'is_published' => true,
        ]);

        // Insert multiple images untuk Iron Man
        $ironManHelmet->images()->createMany([
            ['image_path' => 'samples/ironman-front.jpg', 'is_primary' => true],
            ['image_path' => 'samples/ironman-open.jpg', 'is_primary' => false],
        ]);
    }
}
