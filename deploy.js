const http = require('http');
const url = require('url');
const { spawn } = require('child_process');

const { hostname, port, appToken, uid, router, shell, callback } = require('./config');
const server = http.createServer((req, res) => {
    const route = url.parse(req.url);
    if (route.pathname === router.client) {
        console.log('开始客户端部署');
        let sh = spawn('sh', shell.client);
        sh.stdout.on('data', data => console.log(`${data}`));
        sh.stderr.on('data', data => console.error(`${data}`));
        sh.on('close', (code) => {
            if (+code === 0) {
                let params = `appToken=${appToken}&content=部署成功&uid=${uid}`;
                http.get(`${callback}/?${encodeURIComponent(params)}`, () => {
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
