#!/usr/bin/env zx


echo(chalk.blue('shop project build'))

if ("./shop.zip") {
    await $`rm -rf shop.zip`
}

echo("Remove node_modules folder")
await $`rm -rf shop/node_modules`

echo("Remove .next folder")
await $`rm -rf shop/.next`

echo('Install Node For shop')
await $`yarn --cwd ./shop`

let whichConfig = await question('What api do you want to use? Enter 1 for REST api or 2 for GraphQL: ')

if (whichConfig == 1) {
    echo('Build rest shop')
    await $`yarn --cwd ./shop build:rest`

} else {
    echo('Build gql shop')
    await $`yarn --cwd ./shop build:gql`
}



echo(chalk.blue('#Upload shop file to server'))
let username = await question('Enter your server username (ex: ubuntu): ')
let ip_address = await question('Enter server ip address (ex: 11.111.111.11): ')

echo("########### connecting to server... ###########")

echo("Remove node_modules folder")
await $`rm -rf shop/node_modules`

echo("Zipping shop folder")
await $`zip -r shop.zip shop`

echo(chalk.green('shop.zip file created'))

echo("Removing shop.zip and shop to the server, Please wait...")

await $`ssh -o StrictHostKeyChecking=no -l ${username} ${ip_address} "rm -rf /var/www/pickbazar-laravel/shop.zip /var/www/pickbazar-laravel/shop";`
// let front_end_source_path = await question('Enter frontend.zip source path (ex: /home/../pickbazar-laravel/frontend.zip): ')
let front_end_source_path = "./shop.zip";
echo("Uploading shop.zip to server, Please wait...")
await $`scp ${front_end_source_path} ${username}@${ip_address}:/var/www/pickbazar-laravel`

echo(chalk.green("Uploaded shop.zip to server"))
await $`ssh -o StrictHostKeyChecking=no -l ${username} ${ip_address} "unzip /var/www/pickbazar-laravel/shop.zip -d /var/www/pickbazar-laravel";`

echo('Install Node For shop')
await $`ssh -o StrictHostKeyChecking=no -l ${username} ${ip_address} "yarn --cwd /var/www/pickbazar-laravel/shop";`

await $`ssh -o StrictHostKeyChecking=no -l ${username} ${ip_address} "pm2 restart all";`;
echo(chalk.green('Your application build and upload successful'))
