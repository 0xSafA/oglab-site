oglab_site

git clone https://github.com/GreenMoonk/oglab_site.git



php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear

php artisan serve





sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

sudo apt install php8.3-fpm php8.3-mysql -y
sudo apt install php8.3-mbstring php8.3-xml php8.3-bcmath php8.3-simplexml php8.3-intl php8.3-gd php8.3-curl php8.3-zip php8.3-gmp -y

php -v

sudo systemctl restart php8.3-fpm

sudo nginx -t
sudo systemctl restart nginx


cp -a . /Users/aleksandrsafiulin/Documents/GitHub/oglab_site



mysqldump -u root -p oglabcrmdb > oglabcrmdb_backup.sql
mysql -u root -p oglabcrmdb < oglabcrmdb_backup.sql


scp -r root@oglab.com:/oglabcrmdb_backup.sql Distr  
scp -r Distr/oglabcrmdb_backup.sql root@oglab.com:/

sudo chown -R $USER:$USER /var/www/
	

     sudo chown -R www-data:www-data storage
     sudo chown -R www-data:www-data bootstrap/cache

sudo chown -R www-data:www-data /var/www/

sudo chown -R root:root /var/www/oglab_site


# Social Authentication
NEXTAUTH_URL=http://localhost:3000



yarn clean
rm -rf node_modules .next yarn.lock
yarn cache clean




sudo ufw allow ssh
sudo ufw allow 'Nginx HTTP'
sudo ufw allow 'Nginx HTTPS'

sudo ufw enable

# Устанавливаем политику по умолчанию для входящих соединений на отказ
sudo ufw default deny incoming

# Устанавливаем политику по умолчанию для исходящих соединений на разрешение
sudo ufw default allow outgoing

sudo ufw status verbose



php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php -r "unlink('composer-setup.php');"




sudo touch /etc/nginx/sites-available/oglab.com
     sudo nano /etc/nginx/sites-available/oglab.com




sudo ln -s /etc/nginx/sites-available/oglab.com /etc/nginx/sites-
enabled/




sudo ufw status
sudo ufw allow 'Nginx Full'
sudo ufw delete allow 'Nginx HTTP'
sudo ufw status
sudo certbot --nginx -d oglab.com

sudo ufw delete allow 80/tcp
sudo ufw delete allow "Nginx Full"
sudo ufw delete allow "Nginx Full (v6)"


composer install
php artisan key:generate
php artisan marvel:install
php artisan storage:link

sudo chown -R www-data:www-data storage
sudo chown -R www-data:www-data bootstrap/cache

sudo chown -R www-data:www-data ogcrm
sudo chown -R www-data:www-data oglab_site 

