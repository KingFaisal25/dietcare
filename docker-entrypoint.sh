#!/bin/sh
set -eu
cd /var/www/html
mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs storage/app/public bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R ug+rwx storage bootstrap/cache
if [ -n "${PORT:-}" ] && [ "${PORT}" != "80" ]; then
    sed -i "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf
    sed -i "s/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf
fi
php artisan storage:link --force >/dev/null 2>&1 || true
if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then php artisan migrate --force; fi
php artisan config:cache
php artisan route:cache
php artisan view:cache
exec "$@"
