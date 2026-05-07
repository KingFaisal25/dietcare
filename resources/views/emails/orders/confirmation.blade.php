@component('mail::message')
# Order Confirmation

Hi {{ $order->user->name }},

Thank you for your order! Your payment has been successfully processed.

**Order Details:**
- **Order Code:** {{ $order->order_code }}
- **Program:** {{ $order->program->name }}
- **Nutritionist:** {{ $order->nutritionist->name }}
- **Total Amount:** Rp {{ number_format($order->total_amount, 2, ',', '.') }}
- **Paid At:** {{ $order->paid_at->format('d F Y H:i') }}

You can now start your consultation with the nutritionist.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
