FROM php:8.3-apache
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public COMPOSER_ALLOW_SUPERUSER=1
RUN apt-get update && apt-get install -y --no-install-recommends libicu-dev libjpeg62-turbo-dev libpng-dev libwebp-dev libfreetype6-dev libzip-dev libpq-dev unzip git curl && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp && docker-php-ext-install -j"$(nproc)" bcmath exif gd intl mbstring opcache pdo_pgsql zip && a2enmod rewrite headers expires && sed -ri "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/sites-available/*.conf && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-progress --prefer-dist --optimize-autoloader --no-scripts
COPY . .
RUN composer dump-autoload --no-dev --optimize && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs storage/app/public && chown -R www-data:www-data storage bootstrap/cache && chmod -R ug+rwx storage bootstrap/cache
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint
EXPOSE 80
ENTRYPOINT ["docker-entrypoint"]
CMD ["apache2-foreground"]
