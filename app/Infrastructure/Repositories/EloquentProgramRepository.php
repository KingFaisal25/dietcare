<?php

namespace App\Infrastructure\Repositories;

use App\Contracts\Repositories\ProgramRepositoryInterface;
use App\Models\NutritionistProgram;
use Illuminate\Support\Facades\DB;

class EloquentProgramRepository implements ProgramRepositoryInterface
{
    /**
     * {@inheritDoc}
     */
    public function getActivePrograms(): array
    {
        return DB::table('programs')
            ->where('is_active', true)
            ->get()
            ->toArray();
    }

    /**
     * {@inheritDoc}
     */
    public function findBySlug(string $slug)
    {
        return DB::table('programs')
            ->where('slug', $slug)
            ->first();
    }

    /**
     * {@inheritDoc}
     */
    public function findById(int $id)
    {
        return DB::table('programs')
            ->where('id', $id)
            ->first();
    }

    /**
     * {@inheritDoc}
     */
    public function getActiveClientProgram(int $clientId)
    {
        return NutritionistProgram::query()
            ->where('client_id', $clientId)
            ->whereIn('status', ['active', 'pending'])
            ->orderByDesc('start_date')
            ->first();
    }

    /**
     * {@inheritDoc}
     */
    public function create(array $attributes)
    {
        return DB::table('programs')->insertGetId($attributes);
    }

    /**
     * {@inheritDoc}
     */
    public function update(int $id, array $attributes)
    {
        return DB::table('programs')
            ->where('id', $id)
            ->update($attributes);
    }
}
