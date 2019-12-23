const http = require('http');
const url = require('url');
const { spawn } = require('child_process');

const { hostname, port, appToken, uid, router, shell, callback } = require('./config');
// 同时只允许一个在部署
let client_deploy_state = 'free';
let server_deploy_state = 'free';

const deploy = (script, tip = '部署成功', cb = ()=>{}) => {
    let sh = spawn('sh', script);
    sh.stdout.on('data', data => console.log(`${data}`));
    sh.stderr.on('data', data => console.error(`${data}`));
    sh.on('close', (code) => {
        cb(code);
        if (+code === 0) {
            let params = new URLSearchParams(`appToken=${appToken}&content=${tip}&uid=${uid}`);
            http.get(`${callback}/?${params.toString()}`, () => {
                res.on('data', data => console.log(data));
                res.on('error', e => console.error(`${e.message}`));
            });
        }
    });
};

const end = (res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain', 'charset=utf-8');
    res.end('当前有部署任务进行中\n');
};

const server = http.createServer((req, res) => {
    const route = url.parse(req.url);
    if (route.pathname === router.client) {
        if (client_deploy_state === 'pending') return end(res);
        console.log('开始客户端部署');
        let sh = spawn('sh', shell.client);
        deploy(sh, '客户端部署成功', () => client_deploy_state = 'free');
    } else if (route.pathname === router.server) {
        if (server_deploy_state === 'pending') return end(res);
        console.log('开始服务端部署');
        let sh = spawn('sh', shell.server);
        deploy(sh, '服务端部署成功', () => server_deploy_state = 'free');
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain', 'charset=utf-8');
    res.end('发送部署请求成功\n');
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
