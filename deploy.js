const http = require('http');
const url = require('url');
const { spawn } = require('child_process');

const { hostname, port, appToken, uid, router, shell, callback } = require('./config');
// 同时只允许一个在部署
let client_deploy_state = 'free';
let server_deploy_state = 'free';
const server = http.createServer((req, res) => {
    const route = url.parse(req.url);
    if (route.pathname === router.client) {
        if (client_deploy_state === 'pending') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain', 'charset=utf-8');
            res.end('当前有部署任务进行中\n');
        }
        console.log('开始客户端部署');
        let sh = spawn('sh', shell.client);
        client_deploy_state = 'pending';
        sh.stdout.on('data', data => console.log(`${data}`));
        sh.stderr.on('data', data => console.error(`${data}`));
        sh.on('close', (code) => {
            client_deploy_state = 'free';
            if (+code === 0) {
                let params = new URLSearchParams(`appToken=${appToken}&content=部署成功&uid=${uid}`);
                http.get(`${callback}/?${params.toString()}`, () => {
                    res.on('data', data => console.log(data));
                    res.on('error', e => console.error(`${e.message}`));
                });
            }
        });
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain', 'charset=utf-8');
    res.end('发送部署请求成功\n');
});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
