const http = require('http');
const url = require('url');
const { spawn } = require('child_process');

const { hostname, port, appToken, uid, router, shell, callback } = require('./config');
// 同时只允许一个在部署
let client_deploy_state = 'free';
let server_deploy_state = 'free';

const deploy = (sh, cb = ()=>{}) => {
    sh.stdout.on('data', data => console.log(`${data}`));
    sh.stderr.on('data', data => {
        console.error(`${data}`);
        // 遇到错误退出
        sh.stdin.end();
    });
    sh.on('close', (code) => cb(code));
};

const end = (res, msg) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/palin; charset=utf-8');
    res.end(msg);
};

const msgPush = (res, tip) => {
    let params = new URLSearchParams(`appToken=${appToken}&content=${tip}&uid=${uid}`);
    http.get(`${callback}/?${params.toString()}`, () => {
        res.on('data', data => console.log(data));
        res.on('error', e => console.error(`${e.message}`));
    });
};

const server = http.createServer((req, res) => {
    const route = url.parse(req.url);
    const isClient = route.pathname === router.client;
    const isServer = route.pathname === router.server;

    let sh = null;
    let tip = {};
    if (isClient) {
        if (client_deploy_state === 'pending') return end(res, '当前有部署任务进行中\n');
        client_deploy_state = 'pending';
        tip = {
            start: '客户端部署开始',
            end: '客户端部署成功',
            error: '客户端部署失败'
        };
        sh = spawn('sh', shell.client);
    } else if (isServer) {
        if (server_deploy_state === 'pending') return end(res, '当前有部署任务进行中\n');
        server_deploy_state = 'pending';
        tip = {
            start: '服务端部署开始',
            end: '服务端部署成功',
            error: '服务端部署失败'
        };
        sh = spawn('sh', shell.server);
    } else return end(res, 'what is this?\n');
    console.log(tip.start);
    msgPush(res, tip.start);
    deploy(sh, (code) => {
        isClient && (client_deploy_state = 'free');
        isServer && (server_deploy_state = 'free');
        if (+code === 0) {
            msgPush(res, tip.end);
        } else {
            msgPush(res, tip.error);
        }
    });

    end(res, '发送部署请求成功\n');
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
