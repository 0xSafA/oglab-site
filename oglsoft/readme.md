php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

sudo systemctl restart php8.1-fpm
php -v

sudo systemctl restart nginx

de,en,fr,he,ru,th,zh



/oglab_site/
yarn build:shop-rest
yarn build:admin-rest
pm2 restart 'all'

Let's work, learn and relax together! 

{
  "heading": "OG Lab Menu",
  "subheading": "Farmers and Dispesnaries b2b Partner Network"
}