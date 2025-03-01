#! /bin/bash

echo "Enter your server username (ex: ubuntu)"
read username
echo "Enter server ip address (ex: 11.111.111.11)"
read ip_address
echo "########### connecting to server... ###########"
echo "${username}"
echo "${ip_address}"
ssh -o StrictHostKeyChecking=no -l "${username}" "${ip_address}" "sudo mkdir -p /var/www/pickbazar-laravel; sudo chown -R \$USER:\$USER /var/www; sudo apt install zip unzip";

if [ -d "./api" ]; then
  echo 'Zipping api folder'
  zip -r ./api.zip ./api
fi

if [ -d "./deployment" ]; then
  echo 'Zipping deployment folder'
  zip -r ./deployment.zip ./deployment
fi

if [ -f "./api.zip" ] && [ -f "./deployment.zip" ]; then
    # echo "Enter your api.zip file path"
    # read api_source_path
    echo "Uploading api.zip to server"
    scp "./api.zip" "${username}@${ip_address}:/var/www/pickbazar-laravel"
    echo "uploaded api.zip to server"
    ssh -o StrictHostKeyChecking=no -l "${username}" "${ip_address}" "unzip /var/www/pickbazar-laravel/api.zip -d /var/www/pickbazar-laravel";

    # echo "Enter your deployment.zip file path"
    # read deployment_source_path
    echo 'Uploading deployment.zip to server...'
    scp "./deployment.zip" "${username}@${ip_address}:/var/www/pickbazar-laravel"
    echo 'uploaded deployment.zip to server'
    ssh -o StrictHostKeyChecking=no -l "${username}" "${ip_address}" "unzip /var/www/pickbazar-laravel/deployment.zip -d /var/www/pickbazar-laravel";
else
  echo "Api and deployment zip file missing"
fi

echo "installing google zx for further script"
npm i -g zx

echo "Congrats, All the deployment script and api files uploaded to the server."
