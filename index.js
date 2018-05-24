"use strict";

/*
 * request     - use for request to api
 */
const request = require('request').defaults({
    json: true
});

/*
 * http sniffer function
 */
module.exports.logSniffer = function (proxy) {

    let apptag = proxy['apptag'] || "defaultBackend";
    let api = proxy['api'] || "http://localhost:4600/api/v3_5/httplog";
    return async function logSniffer( ctx, next) {

        let err = null;
        // filter HEAD method requests
        if (ctx.request.method == 'HEAD'
                || /orderProcessor\/users\/query$/.test(ctx.request.href)
                || /notifications/.test(ctx.request.href)
                || /cosplay/.test(this.request.href)
                || /task/.test(this.request.href)
                || /teacherShows/.test(this.request.href)
        ) {
            await next();
        } else {
            try {
                await next();
            } catch (e) {
                err = e;
                throw err;
            } finally {
                let logMsg = {
                    apptag: apptag,
                    url: ctx.request.href,
                    method: ctx.request.method,
                    status: ctx.status,
                    request: ctx.request.body,
                    response: ctx.response.body,
                    ua: ctx.header['user-agent'],
                    device: ctx.header['device'],
                    eventTime: ctx.header['eventtime'],
                    apiTime: Date.now()
                };

                if (err) {
                    logMsg['response'] = err.message;
                    logMsg['status'] = err.status || 500;
                }

                if (typeof ctx.header['remoteip'] != undefined) {
                    logMsg['ip'] = ctx.header['remoteip'];
                } else if (ctx.get('X-Forwarded-For') != '') {
                    let forwardedIpsStr = ctx.get('X-Forwarded-For');
                    let forwardedIp = forwardedIpsStr.split(',')[0];
                    logMsg['ip'] = forwardedIp;
                } else {
                    logMsg['ip'] = undefined;
                }

                if (ctx.header['authorization'] != undefined) {
                    logMsg['token'] = ctx.header['authorization'];
                } else {
                    logMsg['token'] = undefined;
                }

                request({
                    method: 'POST',
                    url: api,
                    body: logMsg,
                    headers: {"connection": "keep-alive"}
                }, function (error) {
                    if (error) {
                        console.error("httpSnifferRequest:" + error);
                    }
                });
            }
        }

    };
};
