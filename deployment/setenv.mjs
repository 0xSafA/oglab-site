#!/usr/bin/env zx

// Copyright 2021 Google LLC

echo(chalk.green('Started Setup server'))

echo(chalk.blue('#Step 1 - Installing Nginx'))
echo('Running: sudo apt update.. ')
await $`sudo apt update`

echo("Add ppa:ondrej/php");
await $`sudo add-apt-repository ppa:ondrej/php`
await $`sudo apt update`

echo('Running: sudo apt install nginx.. ')
await $`sudo apt install nginx`

echo(chalk.blue('#Step 2: Adjusting the Firewall'))
echo('Check ufw app list')
await $`sudo ufw app list`

echo('Add ssh to the firewall')
await $`sudo ufw allow ssh`
await $`sudo ufw allow OpenSSH`

echo('Enable Nginx on the firewall')
await $`sudo ufw allow 'Nginx HTTP'`

echo('Enable the firewall')
await $`sudo ufw enable`
await $`sudo ufw default deny`

echo('Check the changes status')
await $`sudo ufw status`


echo(chalk.blue('#Step 3 – Checking your Web Server'))
echo('Status of the Nginx')
await $`systemctl status nginx`

echo(chalk.blue('#Step 4 - Install PHP'))
await $`sudo apt install php8.1-fpm php8.1-mysql`;
await $`sudo apt install php8.1-mbstring php8.1-xml php8.1-bcmath php8.1-simplexml php8.1-intl php8.1-mbstring php8.1-gd php8.1-curl php8.1-zip php8.1-gmp`;

await $`php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"`
await $`php -r "if (hash_file('sha384', 'composer-setup.php') === 'e21205b207c3ff031906575712edab6f13eb0b361f2085f1f1237b7126d785e826a450292b6cfd1d64d92e6563bbde02') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"`
await $`php composer-setup.php`
await $`php -r "unlink('composer-setup.php');"`
await $`sudo mv composer.phar /usr/bin/composer`

echo(chalk.blue('#Step 5 - Install MySQL'))
await $`sudo apt install mysql-server`

echo(chalk.blue('#Step 9: Setting Up Server & Project'))
let domainName = await question('What is your domain name? ')
echo(chalk.green(`Your domain name is: ${domainName} \n`))

let whichConfig = await question('What api do you want to use? Enter 1 for REST api or 2 for GraphQL: ')

await $`sudo rm -f /etc/nginx/sites-enabled/pickbazar`
await $`sudo rm -f /etc/nginx/sites-available/pickbazar`
await $`sudo touch /etc/nginx/sites-available/pickbazar`
await $`sudo chmod -R 777 /etc/nginx/sites-available/pickbazar`

if(whichConfig == 1) {
    echo(chalk.blue('Settings Running For REST API'))

    await $`sudo echo 'server {
        listen 80;

        server_name ${domainName};

        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Content-Type-Options "nosniff";

        index index.html index.htm index.php;

        charset utf-8;

        # For API
        location /backend {
            alias /var/www/pickbazar-laravel/api/public;
            try_files $uri $uri/ @backend;
                location ~ \\.php$ {
                include fastcgi_params;
                fastcgi_param SCRIPT_FILENAME $request_filename;
                fastcgi_pass   unix:/run/php/php8.1-fpm.sock;
             }
       }

       location @backend {
          rewrite /backend/(.*)$ /backend/index.php?/$1 last;
       }

       # For FrontEnd -> Rest
       location /{
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        location /admin{
            proxy_pass http://localhost:3002/admin;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        error_page 404 /index.php;

        location ~ \\.php$ {
            fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
            include fastcgi_params;
        }

        location ~ /\\.(?!well-known).* {
            deny all;
        }
    }' > '/etc/nginx/sites-available/pickbazar'`;

} else {
    echo(chalk.blue('Settings For GraphQL API'))

    await $`sudo echo 'server {
        listen 80;

        server_name ${domainName};

        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Content-Type-Options "nosniff";

        index index.html index.htm index.php;

        charset utf-8;

        # For API
        location /backend {
            alias /var/www/pickbazar-laravel/api/public;
            try_files $uri $uri/ @backend;
                location ~ \\.php$ {
                include fastcgi_params;
                fastcgi_param SCRIPT_FILENAME $request_filename;
                fastcgi_pass   unix:/run/php/php8.1-fpm.sock;
             }
        }

        location @backend {
          rewrite /backend/(.*)$ /backend/index.php?/$1 last;
        }

        # For FrontEnd -> GraphQL
        location /{
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        location /admin{
            proxy_pass http://localhost:3004/admin;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        error_page 404 /index.php;

        location ~ \\.php$ {
            fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
            include fastcgi_params;
        }

        location ~ /\\.(?!well-known).* {
            deny all;
        }
    }' > '/etc/nginx/sites-available/pickbazar'`;
}

echo(chalk.blue('\nEnabling the config'))
await $`sudo ln -s /etc/nginx/sites-available/pickbazar /etc/nginx/sites-enabled/`

//below comment will check nginx error
await $`sudo nginx -t`
await $`sudo systemctl restart nginx`


echo(chalk.blue('Securing Nginx with Let\'s Encrypt'))
await $`sudo apt install certbot python3-certbot-nginx`
await $`sudo ufw status`
await $`sudo ufw allow 'Nginx Full'`
await $`sudo ufw delete allow 'Nginx HTTP'`
await $`sudo ufw status`
await $`sudo certbot --nginx -d ${domainName}`

echo(chalk.green('Nginx Setup success!'))
