module.exports = {
    hostname: '0.0.0.0',
    port: 7500,
    appToken: '',
    uid: '',
    router: {
        client: '/deploy/x',
        server: '/deploy/y'
    },
    shell: {
        client: ['x.sh'],
        server: ['y.sh']
    },
    callback: 'http://wxpusher.zjiecode.com/api/send/message'
}
