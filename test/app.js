'use strict';

const koa = require('koa');
const app = module.exports = koa();
const bodyParser = require('koa-bodyparser');
const sniffer = require('../index.js');
const router = require('koa-router')();

router.get('/200', function *() {
    this.body = 'hi jack'
});

router.get('/204', function *() {
    this.status = 204;
});

router.get('/401', function *() {
    this.status = 401;
});

router.get('/500', function *() {
    this.status = 500;
});

const snifferConfig = {
    "apptag" : 'onionsBackend',
    "api" : 'http://10.8.8.8:4600/api/v3_5/httplog'
};

app.use(bodyParser());
app.use(sniffer.logSniffer(snifferConfig));
app.use(router.routes());

app.listen(2333);

console.log('app started on port 3000');