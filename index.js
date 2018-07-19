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
    return function *logSniffer(next) {

        let err = null;
        // filter HEAD method requests
        if (this.request.method == 'HEAD'
                || /orderProcessor\/users\/query$/.test(this.request.href)
                || /notifications/.test(this.request.href)
                || /cosplay/.test(this.request.href)
                || /task/.test(this.request.href)
                || /teacherShows/.test(this.request.href)
                || /course-tree/.test(this.request.href)
                || /parents/.test(this.request.href)
                || /login/.test(this.request.href)
                || /signup/.test(this.request.href)
        ) {
            yield *next;
        } else {
            try {
                yield *next;
            } catch (e) {
                err = e;
                throw err;
            } finally {
                let logMsg = {
                    apptag: apptag,
                    url: this.request.href,
                    method: this.request.method,
                    status: this.status,
                    request: this.request.body,
                    response: this.response.body,
                    ua: this.header['user-agent'],
                    device: this.header['device'],
                    eventTime: this.header['eventtime'],
                    apiTime: Date.now()
                };

                if (err) {
                    logMsg['response'] = err.message;
                    logMsg['status'] = err.status || 500;
                }

                if (typeof this.header['remoteip'] != undefined) {
                    logMsg['ip'] = this.header['remoteip'];
                } else if (this.get('X-Forwarded-For') != '') {
                    let forwardedIpsStr = this.get('X-Forwarded-For');
                    let forwardedIp = forwardedIpsStr.split(',')[0];
                    logMsg['ip'] = forwardedIp;
                } else {
                    logMsg['ip'] = undefined;
                }

                if (this.header['authorization'] != undefined) {
                    logMsg['token'] = this.header['authorization'];
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
