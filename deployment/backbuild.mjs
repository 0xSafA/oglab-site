#!/usr/bin/env zx

import { question } from 'zx';

console.log(chalk.blue('#Step 1 - Database creation'));

let dbname = await question('Please enter the NAME of the new MySQL database! (example: ganjamill): ');
let charset = await question('Please enter the MySQL database CHARACTER SET! (example: latin1, utf8, ...): ') || 'utf8';

console.log('Creating new MySQL database...');
try {
    await $`sudo mysql -e "CREATE DATABASE ${dbname} /*\\!40100 DEFAULT CHARACTER SET ${charset} */;"`;
    console.log('Database successfully created!');
} catch (error) {
    console.log(chalk.yellow(`Database ${dbname} might already exist. Skipping creation.`));
}

console.log('Showing existing databases...');
await $`sudo mysql -e "show databases;"`;

let username = await question('Please enter the NAME of the new MySQL database user! (example: ganjamill_user): ');
let userpass = await question('Please enter the PASSWORD for the new MySQL database user! ');

console.log('Creating new user...');
try {
    await $`sudo mysql -e "CREATE USER IF NOT EXISTS '${username}'@'%' IDENTIFIED BY '${userpass}';"`;
    console.log('User successfully created!');
} catch (error) {
    if (error.message.includes('Your password does not satisfy the current policy requirements')) {
        console.log(chalk.red('Password does not meet MySQL password policy requirements.'));
        console.log('Ensure the password contains at least: 8 characters, 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character.');
        process.exit(1);
    } else {
        console.log(chalk.yellow(`User ${username} might already exist. Continuing...`));
    }
}

console.log(`Granting ALL privileges on ${dbname} to ${username}!`);
try {
    await $`sudo mysql -e "GRANT ALL PRIVILEGES ON ${dbname}.* TO '${username}'@'%';"`;
    await $`sudo mysql -e "FLUSH PRIVILEGES;"`;
    console.log(chalk.green('Privileges successfully granted!'));
} catch (error) {
    if (error.message.includes('You are not allowed to create a user with GRANT')) {
        console.log(chalk.red('Insufficient permissions to grant privileges. Make sure your MySQL user has the GRANT OPTION privilege.'));
        process.exit(1);
    } else {
        console.log(chalk.yellow('Error occurred while granting privileges.'));
    }
}

console.log(chalk.green('Database setup complete!'));
