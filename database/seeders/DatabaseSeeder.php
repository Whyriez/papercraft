<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            [
                'email' => 'admin@limapp.my.id',
            ],
            [
                'name' => 'Admin Papercraft',
                'password' => Hash::make('123'),
            ]
        );

        $this->call([
            PapercraftSeeder::class,
        ]);
    }
}
