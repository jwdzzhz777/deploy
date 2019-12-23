#!/bin/bash
PROJECT_PATH=~/app/chromosome_x
CONFIG_PATH=~/deploy/configpm.json

if [ -d $PROJECT_PATH ];then
cd $PROJECT_PATH
git pull
else
cd ~/app
git clone https://github.com/jwdzzhz777/chromosome_x
cd 'chromosome_x'
fi

yarn install
yarn build

pm2 startOrRestart $CONFIG_PATH
