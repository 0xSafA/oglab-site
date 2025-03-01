# Automation scripts for Pickbazar

#### At first login your server from terminal

```bash
ssh SERVER_USERNAME@SERVERIP
```

#### Upload api and deployment project to Virtual Server form youp PC - RUN on Local PC
To upload the zipped `api` and `deployment` files to server you need to run the below command form your pickbazar project root
> while running below command you will asked for enter your server `username` and `ip address` by entering and a successful connection you will also asked for enter your `api.zip` and `deployment.zip`
> files path and the path will be look like `/home/your_project_folder_path/pickbazar-laravel/api.zip` for api.zip file so forth for `deployment.zip`

```bash
    bash deployment/deployment.sh
````

#### Server Environment setup script - RUN on Virtual Server

```bash
    bash /var/www/pickbazar-laravel/deployment/nodesetup.sh
````

#### Nginx Setup And Settings - RUN on Virtual Server

```bash
    zx /var/www/pickbazar-laravel/deployment/setenv.mjs
````

#### Backend build - RUN on Virtual Server

```bash
    sudo zx /var/www/pickbazar-laravel/deployment/backendbuildscript.mjs
```

#### Frontend build script - RUN on Local PC
Run the below command from your pickbazar-laravel project root

```bash
    zx deployment/frontendbuildscript.mjs
```

#### Frontend run script - RUN on Virtual Server

```bash
    zx /var/www/pickbazar-laravel/deployment/frontendrunscript.mjs
```
