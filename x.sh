PROJECT_PATH='~/app/chromosome_x'

echo '开始部署'

if [ -d $PROJECT_PATH ];then
cd $PROJECT_PATH
git pull
else
cd '~/app'
git clone https://github.com/jwdzzhz777/chromosome_x
cd 'chromosome_x'
fi

yarn install
yarn build

pm2 startOrRestart configpm.json
