PROJECT_PATH=~/app/chromosome_y

if [ -d $PROJECT_PATH ];then
cd $PROJECT_PATH
npm run stop
npm run clean
## 强制拉取
git reset --hard
git pull
npm install
else
cd ~/app
git clone https://github.com/jwdzzhz777/chromosome_y
cd 'chromosome_y'
npm install

## 初始化数据库
cat ~/migrations.json > database/config.json
NODE_ENV=production npx sequelize db:migrate
fi

## 重写配置文件
cat ~/config.js > config/config.prod.ts
npm run tsc
## 不需要进程守护
npm run start
