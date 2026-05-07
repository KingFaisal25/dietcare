<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background-color: #16a361; padding: 40px 20px; text-align: center; color: #ffffff; }
        .content { padding: 40px 30px; line-height: 1.6; color: #333333; }
        .footer { background-color: #f9fbfb; padding: 20px; text-align: center; font-size: 12px; color: #888888; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #16a361; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>NutriPro</h1>
        </div>
        <div class="content">
            <h2 style="margin-top: 0;">{{ $title }}</h2>
            <p>{{ $messageText }}</p>
            <p>Terus pantau perkembangan gizi dan kesehatanmu bersama NutriPro.</p>
            <a href="{{ config('app.frontend_url') }}" class="btn">Buka Aplikasi</a>
        </div>
        <div class="footer">
            <p>&copy; 2024 NutriPro Diet Care. Seluruh Hak Cipta.</p>
        </div>
    </div>
</body>
</html>
