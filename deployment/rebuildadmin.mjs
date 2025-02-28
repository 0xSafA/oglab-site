#!/usr/bin/env zx


echo(chalk.blue('admin project build'))


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

   
    echo('Install Node For admin')
    await $`ssh -o StrictHostKeyChecking=no -l ${username} ${ip_address} "yarn --cwd /var/www/oglab_site/admin/rest";`

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


    echo('Install Node For admin')
    await $`ssh -o StrictHostKeyChecking=no -l ${username} ${ip_address} "yarn --cwd /var/www/oglab_site/admin/graphql";`

    await $`ssh -o StrictHostKeyChecking=no -l ${username} ${ip_address} "pm2 restart all";`;
    echo(chalk.green('Your application build and upload successful'))
}


