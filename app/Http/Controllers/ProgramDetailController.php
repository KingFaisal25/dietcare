<?php

namespace App\Http\Controllers;

use App\Models\Program;
use Illuminate\Http\Request;

class ProgramDetailController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/public/programs/{slug}
     * Return data program berdasarkan slug.
     */
    public function show(string $slug)
    {
        $program = Program::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (! $program) {
            return $this->error('Program tidak ditemukan.', 404);
        }

        return $this->success('Data program berhasil diambil.', [
            'program' => [
                'id'               => $program->id,
                'name'             => $program->name,
                'slug'             => $program->slug,
                'description'      => $program->description,
                'price'            => $program->price,
                'duration_days'    => $program->duration_days,
                'max_consultations'=> $program->max_consultations,
                'features'         => $program->features,
            ],
        ]);
    }

    /**
     * GET /api/public/programs
     * Return semua program aktif untuk listing.
     */
    public function index()
    {
        $programs = Program::where('is_active', true)
            ->orderBy('price')
            ->get()
            ->map(fn (Program $p) => [
                'id'            => $p->id,
                'name'          => $p->name,
                'slug'          => $p->slug,
                'description'   => $p->description,
                'price'         => $p->price,
                'duration_days' => $p->duration_days,
                'features'      => $p->features,
            ]);

        return $this->success('Daftar program berhasil diambil.', [
            'programs' => $programs,
        ]);
    }
}
