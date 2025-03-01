#!/usr/bin/env zx


echo(chalk.blue('admin project build'))

if ("./admin.zip") {
    await $`rm -rf admin.zip`
}

let whichConfig = await question('What api do you want to use? Enter 1 for REST api or 2 for GraphQL: ')

if (whichConfig == 1) {
    echo("Remove node_modules folder")
    await $`rm -rf admin/rest/node_modules`

    echo("Remove .next folder")
    await $`rm -rf admin/rest/.next`

    echo('Install Node For admin')
    await $`yarn --cwd ./admin/rest`

    echo('Build rest admin')
    await $`yarn --cwd ./admin/rest build`

    echo("Remove node_modules folder")
    await $`rm -rf admin/rest/node_modules`

    echo(chalk.blue('#Upload admin file to server'))
    let username = await question('Enter your server username (ex: ubuntu): ')
    let ip_address = await question('Enter server ip address (ex: 11.111.111.11): ')

    echo("########### connecting to server... ###########")

    echo("Zipping admin folder")
    await $`zip -r admin.zip admin`

    echo(chalk.green('admin.zip file created'))

    echo("Removing admin.zip and admin to the server, Please wait...")

    await $`ssh -o StrictHostKeyChecking=no -l ${username} ${ip_address} "rm -rf /var/www/pickbazar-laravel/admin.zip /var/www/pickbazar-laravel/admin";`
    // let front_end_source_path = await question('Enter frontend.zip source path (ex: /home/../pickbazar-laravel/frontend.zip): ')
    let front_end_source_path = "./admin.zip";
    echo("Uploading admin.zip to server, Please wait...")
    await $`scp ${front_end_source_path} ${username}@${ip_address}:/var/www/pickbazar-laravel`

    echo(chalk.green("Uploaded admin.zip to server"))
    await $`ssh -o StrictHostKeyChecking=no -l ${username} ${ip_address} "unzip /var/www/pickbazar-laravel/admin.zip -d /var/www/pickbazar-laravel";`

    echo('Install Node For admin')
    await $`ssh -o StrictHostKeyChecking=no -l ${username} ${ip_address} "yarn --cwd /var/www/pickbazar-laravel/admin/rest";`

    await $`ssh -o StrictHostKeyChecking=no -l ${username} ${ip_address} "pm2 restart all";`;
    echo(chalk.green('Your application build and upload successful'))

} else {
    echo("Remove node_modules folder")
    await $`rm -rf admin/graphql/node_modules`

    echo("Remove .next folder")
    await $`rm -rf admin/graphql/.next`

    echo('Install Node For admin')
    await $`yarn --cwd ./admin/graphql`

    echo('Build gql admin')
    await $`yarn --cwd ./admin/graphql build`

    echo("Remove node_modules folder")
    await $`rm -rf admin/graphql/node_modules`


    echo(chalk.blue('#Upload admin file to server'))
    let username = await question('Enter your server username (ex: ubuntu): ')
    let ip_address = await question('Enter server ip address (ex: 11.111.111.11): ')

    echo("########### connecting to server... ###########")

    echo("Zipping admin folder")
    await $`zip -r admin.zip admin`

    echo(chalk.green('admin.zip file created'))

    echo("Removing admin.zip and admin to the server, Please wait...")

    await $`ssh -o StrictHostKeyChecking=no -l ${username} ${ip_address} "rm -rf /var/www/pickbazar-laravel/admin.zip /var/www/pickbazar-laravel/admin";`
    // let front_end_source_path = await question('Enter frontend.zip source path (ex: /home/../pickbazar-laravel/frontend.zip): ')
    let front_end_source_path = "./admin.zip";
    echo("Uploading admin.zip to server, Please wait...")
    await $`scp ${front_end_source_path} ${username}@${ip_address}:/var/www/pickbazar-laravel`

    echo(chalk.green("Uploaded admin.zip to server"))
    await $`ssh -o StrictHostKeyChecking=no -l ${username} ${ip_address} "unzip /var/www/pickbazar-laravel/admin.zip -d /var/www/pickbazar-laravel";`

    echo('Install Node For admin')
    await $`ssh -o StrictHostKeyChecking=no -l ${username} ${ip_address} "yarn --cwd /var/www/pickbazar-laravel/admin/graphql";`

    await $`ssh -o StrictHostKeyChecking=no -l ${username} ${ip_address} "pm2 restart all";`;
    echo(chalk.green('Your application build and upload successful'))
}


