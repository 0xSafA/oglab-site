#!/bin/bash

# Update the package index
sudo apt update

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Install Apache, MySQL, and PHP 8.1
if command_exists apache2 && command_exists mysql && php -v | grep -q "PHP 8.1"; then
  read -p "Apache, MySQL, and PHP 8.1 are already installed. Reinstall? (y/n): " reinstall
  if [[ "$reinstall" != "y" ]]; then
    echo "Skipping Apache, MySQL, and PHP installation."
  else
    sudo apt install -y apache2 mysql-server php8.1 libapache2-mod-php8.1
  fi
else
  sudo apt install -y apache2 mysql-server php8.1 libapache2-mod-php8.1
fi

# Install PHP extensions
PHP_EXTENSIONS=(php8.1-curl php8.1-simplexml php8.1-dom php8.1-mbstring php8.1-gd)
for ext in "${PHP_EXTENSIONS[@]}"; do
  if ! php -m | grep -q "${ext#php8.1-}"; then
    sudo apt install -y "$ext"
  else
    echo "$ext is already installed."
  fi
done

# Install Composer
EXPECTED_VERSION="2.2.0"
PHP_COMPOSER_VERSION=$(composer --version 2>/dev/null | grep -oP '\d+\.\d+\.\d+')

if [ -z "$PHP_COMPOSER_VERSION" ] || [ "$PHP_COMPOSER_VERSION" \< "$EXPECTED_VERSION" ]; then
  read -p "Composer is not installed or outdated. Install/Update? (y/n): " install_composer
  if [[ "$install_composer" == "y" ]]; then
    curl -sS https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer
  fi
else
  echo "Composer $PHP_COMPOSER_VERSION is already installed."
fi

# Install Node.js and Yarn
if command_exists node && command_exists yarn; then
  read -p "Node.js and Yarn are already installed. Reinstall? (y/n): " reinstall_node_yarn
  if [[ "$reinstall_node_yarn" == "y" ]]; then
    sudo apt remove --purge -y nodejs yarn
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    sudo npm install -g yarn
  fi
else
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt install -y nodejs
  sudo npm install -g yarn
fi

# Enable Apache modules and restart the service
sudo a2enmod rewrite
sudo systemctl restart apache2

# Start and secure MySQL installation
sudo systemctl start mysql
sudo mysql_secure_installation

# Verify installation
php -v
composer --version
apache2 -v
mysql --version
node -v
yarn -v

echo "Installation complete. PHP 8.1, Apache, MySQL, Composer, Node.js, Yarn, and required extensions are installed."
