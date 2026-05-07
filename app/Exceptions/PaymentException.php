<?php

namespace App\Exceptions;

class PaymentException extends BaseException
{
    public function __construct(string $message = "Terjadi kesalahan pada pembayaran.", int $statusCode = 400)
    {
        parent::__construct($message, $statusCode);
    }
}
