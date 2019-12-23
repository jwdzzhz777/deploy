PROJECT_PATH=~/app/chromosome_y

if [ -d $PROJECT_PATH ];then
cd $PROJECT_PATH
npm run stop
npm run clean
## 强制拉取
git reset --hard
git pull
else
cd ~/app
git clone https://github.com/jwdzzhz777/chromosome_y
cd 'chromosome_y'
fi

## 重写配置文件
cat ~/comfig.js > config/config.prod.ts

npm run install
npm run tsc
## 不需要进程守护
npm run start
