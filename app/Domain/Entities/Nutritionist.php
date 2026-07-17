<?php
namespace App\Domain\Entities;

/**
 * Domain Entity representing a Nutritionist.
 */
class Nutritionist
{
    public int $id;
    public string $name;
    public string $email;
    public string $certification;
    public string $role = 'nutritionist';

    public function __construct(int $id, string $name, string $email, string $certification)
    {
        $this->id = $id;
        $this->name = $name;
        $this->email = $email;
        $this->certification = $certification;
    }
}
?>
