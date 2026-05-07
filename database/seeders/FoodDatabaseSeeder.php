<?php

namespace Database\Seeders;

use App\Models\Food;
use Illuminate\Database\Seeder;
use Illuminate\Support\LazyCollection;
use Illuminate\Support\Facades\DB;

class FoodDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $csvPath = database_path('data/foods_indonesia.csv');
        
        if (!file_exists($csvPath)) {
            $this->command->error("CSV file not found at: {$csvPath}");
            return;
        }

        DB::table('foods')->truncate();

        LazyCollection::make(function () use ($csvPath) {
            $file = fopen($csvPath, 'r');
            $header = fgetcsv($file);
            
            while (($row = fgetcsv($file)) !== false) {
                yield array_combine($header, $row);
            }
            
            fclose($file);
        })->chunk(100)->each(function ($chunk) {
            Food::insert($chunk->toArray());
        });

        $this->command->info('Food database seeded successfully!');
    }
}
