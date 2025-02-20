#!/bin/bash

# Function to check if a MySQL command succeeds
mysql_exec() {
  mysql -u root -p -e "$1" 2>/dev/null
}

# Prompt for database name
read -p "Enter the name of the database to create: " db_name

# Check if the database already exists
if mysql_exec "SHOW DATABASES LIKE '$db_name';" | grep -q "$db_name"; then
  echo "Database '$db_name' already exists."
  read -p "Do you want to drop and recreate it? (y/n): " recreate_db
  if [[ "$recreate_db" == "y" ]]; then
    mysql_exec "DROP DATABASE $db_name;"
    echo "Dropped database '$db_name'."
  else
    echo "Exiting without creating database."
    exit 0
  fi
fi

# Create the database
mysql_exec "CREATE DATABASE $db_name;"
echo "Database '$db_name' created successfully."

# Prompt for username
read -p "Enter the name of the user to create: " db_user
read -sp "Enter the password for user '$db_user': " db_password

# Check if the user already exists
if mysql_exec "SELECT User FROM mysql.user WHERE User = '$db_user';" | grep -q "$db_user"; then
  echo -e "\nUser '$db_user' already exists."
  read -p "Do you want to delete and recreate it? (y/n): " recreate_user
  if [[ "$recreate_user" == "y" ]]; then
    mysql_exec "DROP USER '$db_user'@'localhost';"
    echo "Dropped user '$db_user'."
  else
    echo "Exiting without creating user."
    exit 0
  fi
fi

# Create the user and grant all privileges
mysql_exec "CREATE USER '$db_user'@'localhost' IDENTIFIED BY '$db_password';"
mysql_exec "GRANT ALL PRIVILEGES ON $db_name.* TO '$db_user'@'localhost';"
mysql_exec "FLUSH PRIVILEGES;"
echo -e "\nUser '$db_user' created and granted privileges on database '$db_name'."

# Display all MySQL users
echo -e "\nList of MySQL users:"
mysql_exec "SELECT User, Host FROM mysql.user;"

# Display all MySQL databases
echo -e "\nList of MySQL databases:"
mysql_exec "SHOW DATABASES;"

# Final output
echo "MySQL database and user setup complete."
