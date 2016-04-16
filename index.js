"use strict";

/*
 * on-finished - execute a callback when a request closes, finishes, or errors
 * moment      - get unix timestamp
 * compare-urls- compare 2 urls
 * request     - use for request to api
 */
const onFinished = require("on-finished");
const moment = require('moment');
const compareUrls = require('compare-urls');
var request = require('request').defaults({
    json: true
});

let promiseRequest = function *(url, msg) {
    let promiseReq = function () {
        return new Promise(function(resolve, reject) {
            request({method:'POST', url: url, body: msg}, function(error, response, body) {

                if(error){
                    reject(error);
                    return;
                }

                if(response.statusCode >= 400){
                    var statusCodeError = new Error(options.method + ' ' + options.url + ' failed with status code ' + response.statusCode);
                    statusCodeError.name = 'StatusCodeError';
                    statusCodeError.statusCode = response.statusCode;
                    statusCodeError.request = options;
                    statusCodeError.response = body;

                    reject(statusCodeError);
                    return;
                }

                resolve(body);
            });
        });
    };

    return yield promiseReq();
};

/*
 * http sniffer function
 */
module.exports.logSniffer = function (proxy) {

    let defaultUrl = proxy['blackurl'] || "https://api.yangcong345.com/";
    let apptag = proxy['apptag'] || "defaultBackend";
    let api = proxy['api'] || "http://localhost:4600/api/v3_5/httplog";
    return function *logSniffer(next) {

        let sendAsEvent = compareUrls(this.request.href, defaultUrl);

        if (sendAsEvent) {
            yield *next;
        } else {
            let err;
            let onResponseFinished = function () {
                let logMsg = {
                    apptag: apptag,
                    url: this.request.href,
                    method: this.request.method,
                    status: this.status,
                    request: this.request.body,
                    response: this.response.body,
                    ua: this.header['user-agent'],
                    eventTime: moment().valueOf(),
                };

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

                try {
                    promiseRequest(api, logMsg).next();
                } catch (e) {
                    err = e;
                }

            };

            try {
                yield *next;
            } catch(e) {
                err = e;
            }finally {
                onFinished(this.response.res, onResponseFinished.bind(this));
            }

            if (err) {
                throw new err;
            }
        }
    };
};