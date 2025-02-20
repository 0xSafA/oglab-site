#!/usr/bin/env zx

const fs = require('fs');
const ora = require('ora');
const logStream = fs.createWriteStream('build.log', { flags: 'a' });
const log = (message) => {
    console.log(message);
    logStream.write(`${new Date().toISOString()} - ${message}\n`);
};

log(chalk.blue('Front end project build'));
console.time('Build Time');

log(chalk.blue('#Step 1: Setting Up Project Configuration'));
let domainName = await question('What is your domain name? (default: example.com): ') || 'example.com';
log(chalk.green(`Your domain name is: ${domainName} \n`));

log(chalk.blue('#Step 2 - Config Next Admin App For /admin Sub Directory'));
try {
    if (fs.existsSync('admin/rest/next.config.js')) {
        await $`cp admin/rest/next.config.js ./admin/rest/temp.js`;
        await $`awk '{sub(/i18n,/, "i18n,basePath:\`/admin\`,"); print $0}' ./admin/rest/temp.js > ./admin/rest/next.config.js`;
        await $`rm -rf ./admin/rest/temp.js`;
    }

    if (fs.existsSync('admin/graphql/next.config.js')) {
        await $`cp ./admin/graphql/next.config.js ./admin/graphql/temp.js`;
        await $`awk '{sub(/i18n,/, "i18n,basePath:\`/admin\`,"); print $0}' ./admin/graphql/temp.js > ./admin/graphql/next.config.js`;
        await $`rm -rf ./admin/graphql/temp.js`;
    }
} catch (error) {
    log(chalk.yellow('Error configuring Next.js for admin.')); 
}

log(chalk.blue('#Step 3 - Installing Frontend Project Dependencies'));
log('Please wait while the dependencies are being installed...');
const spinner = ora('Installing dependencies...').start();

try {
    await $`yarn`;
    spinner.succeed('Dependencies installed!');
} catch (error) {
    spinner.fail('Dependency installation failed.');
    process.exit(1);
}

let whichConfig = await question('What API do you want to use? Enter 1 for REST API or 2 for GraphQL: ');

async function configureEnv(envPath, replacements) {
    if (fs.existsSync(envPath)) {
        for (let [search, replace] of Object.entries(replacements)) {
            await $`awk '{gsub(/${search}/,"${replace}"); print $0}' ${envPath} > tmp && mv tmp ${envPath}`;
        }
    } else {
        log(chalk.yellow(`${envPath} does not exist.`));
    }
}

try {
    if (whichConfig == 1) {
        log('Configuring REST API environment');
        await configureEnv('./shop/.env', {
            'NEXT_PUBLIC_REST_API_ENDPOINT=.".+"$': `NEXT_PUBLIC_REST_API_ENDPOINT="https://${domainName}/backend"`,
            'NEXT_PUBLIC_ADMIN_URL=.+': `NEXT_PUBLIC_ADMIN_URL="https://${domainName}/admin"`,
            'FRAMEWORK_PROVIDER=.".+"$': 'FRAMEWORK_PROVIDER="rest"',
        });

        await configureEnv('./admin/rest/.env', {
            'NEXT_PUBLIC_REST_API_ENDPOINT=.".+"$': `NEXT_PUBLIC_REST_API_ENDPOINT="https://${domainName}/backend"`,
            'NEXT_PUBLIC_SHOP_URL="http://localhost:3003"': `NEXT_PUBLIC_SHOP_URL="https://${domainName}"`,
        });

        if (fs.existsSync('./shop/tsconfig.rest.json')) {
            await $`cp ./shop/tsconfig.rest.json ./shop/tsconfig.json`;
        }
    } else {
        log('Configuring GraphQL API environment');
        await configureEnv('./shop/.env', {
            'NEXT_PUBLIC_GRAPHQL_API_ENDPOINT=.".+"$': `NEXT_PUBLIC_GRAPHQL_API_ENDPOINT="https://${domainName}/backend/graphql"`,
            'NEXT_PUBLIC_ADMIN_URL=.+': `NEXT_PUBLIC_ADMIN_URL="https://${domainName}/admin"`,
            'FRAMEWORK_PROVIDER=.".+"$': 'FRAMEWORK_PROVIDER="graphql"',
        });

        await configureEnv('./admin/graphql/.env', {
            'NEXT_PUBLIC_GRAPHQL_API_ENDPOINT=.".+"$': `NEXT_PUBLIC_GRAPHQL_API_ENDPOINT="https://${domainName}/backend/graphql"`,
            'NEXT_PUBLIC_SHOP_URL="http://localhost:3001"': `NEXT_PUBLIC_SHOP_URL="https://${domainName}"`,
            'NEXT_PUBLIC_API_ROOT=.".+"$': `NEXT_PUBLIC_API_ROOT="https://${domainName}/backend"`,
        });

        if (fs.existsSync('./shop/tsconfig.graphql.json')) {
            await $`cp ./shop/tsconfig.graphql.json ./shop/tsconfig.json`;
        }
    }
} catch (error) {
    log(chalk.yellow('Error configuring environment variables.')); 
}

if (fs.existsSync('./node_modules')) {
    if (whichConfig == 1) {
        log('Building for REST API');
        await $`yarn build:shop-rest`;
        await $`yarn build:admin-rest`;
    } else {
        log('Building for GraphQL API');
        await $`yarn build:shop-gql`;
        await $`yarn build:admin-gql`;
    }
} else {
    log(chalk.red('Dependencies are missing. Please run "yarn" to install them.')); 
    process.exit(1);
}

log(chalk.green('Build process completed successfully!'));
log(`
Summary:
- Domain: ${domainName}
- API Type: ${whichConfig == 1 ? 'REST' : 'GraphQL'}
- Environment files updated.
`);
console.timeEnd('Build Time');
