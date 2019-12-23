const http = require('http');
const url = require('url');
const { spawn } = require('child_process');

const { hostname, port, appToken, uid, router, shell, callback } = require('./config');
// 同时只允许一个在部署
let client_deploy_state = 'free';
let server_deploy_state = 'free';

const deploy = (script, cb = ()=>{}) => {
    let sh = spawn('sh', script);
    sh.stdout.on('data', data => console.log(`${data}`));
    sh.stderr.on('data', data => console.error(`${data}`));
    sh.on('close', (code) => cb(code));
};

const end = (res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain', 'charset=utf-8');
    res.end('当前有部署任务进行中\n');
};

const server = http.createServer((req, res) => {
    const route = url.parse(req.url);
    const isClient = route.pathname === router.client;
    const isServer = route.pathname === router.server;

    let sh = null;
    let tip = '';
    if (isClient) {
        if (client_deploy_state === 'pending') return end(res);
        client_deploy_state = 'pending';
        console.log('开始客户端部署');
        tip = '客户端部署成功';
        sh = spawn('sh', shell.client);
    } else if (isServer) {
        if (server_deploy_state === 'pending') return end(res);
        server_deploy_state = 'pending';
        console.log('开始服务端部署');
        tip = '服务端部署成功';
        sh = spawn('sh', shell.server);
    }
    deploy(sh, (code) => {
        isClient && (client_deploy_state = 'free');
        isServer && (server_deploy_state = 'free');
        if (+code === 0) {
            let params = new URLSearchParams(`appToken=${appToken}&content=${tip}&uid=${uid}`);
            http.get(`${callback}/?${params.toString()}`, () => {
                res.on('data', data => console.log(data));
                res.on('error', e => console.error(`${e.message}`));
            });
        }
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain', 'charset=utf-8');
    res.end('发送部署请求成功\n');
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
