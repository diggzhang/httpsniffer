'use strict';

const Koa = require('koa');
const app = module.exports = new Koa();
const bodyParser = require('koa-bodyparser');
const sniffer = require('../index.js');
const router = require('koa-router')();

router.get('/200', async function ( ctx, next) {
    ctx.body = 'hi jack';
});

router.get('/204', async function ( ctx , next) {
    ctx.status = 204;
});

router.get('/401', async function ( ctx, next) {
    ctx.status = 401;
});

router.get('/500', async function ( ctx, next) {
    ctx.status = 500;
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
