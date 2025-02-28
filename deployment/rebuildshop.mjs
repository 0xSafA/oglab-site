#!/usr/bin/env zx


echo(chalk.blue('shop project build'))


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


echo('Install Node For shop')
await $`ssh -o StrictHostKeyChecking=no -l ${username} ${ip_address} "yarn --cwd /var/www/oglab_site/shop";`

await $`ssh -o StrictHostKeyChecking=no -l ${username} ${ip_address} "pm2 restart all";`;
echo(chalk.green('Your application build and upload successful'))
