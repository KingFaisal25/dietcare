<?php

namespace App\Contracts\Repositories;

interface ProgramRepositoryInterface
{
    /**
     * Get all active programs.
     */
    public function getActivePrograms(): array;

    /**
     * Find a program by its slug.
     */
    public function findBySlug(string $slug);

    /**
     * Find a program by ID.
     */
    public function findById(int $id);

    /**
     * Get the active nutritionist program for a client.
     */
    public function getActiveClientProgram(int $clientId);

    /**
     * Create a new program.
     */
    public function create(array $attributes);

    /**
     * Update a program.
     */
    public function update(int $id, array $attributes);
}
