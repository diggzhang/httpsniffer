'use strict';
const app = require('./app');
const request = require('supertest').agent(app.listen());
const assert = require('assert');
const mocha = require('mocha');
const coMocha = require('co-mocha');
coMocha(mocha);


describe('/200', function() {
    it('GET /200', function *() {
        let res = yield request
            .get('/200')
            .expect(200)
    })
});

describe('/204', function() {
    it('GET /204', function *() {
        let res = yield request
            .get('/204')
            .expect(204)
    })
});

describe('/401', function() {
    it('GET /401', function *() {
        let res = yield request
            .get('/401')
            .expect(401)
    })
});

describe('/404', function() {
    it('GET /404', function *() {
        let res = yield request
            .get('/404')
            .expect(404)
    })
});

describe('/500', function() {
    it('GET /500', function *() {
        let res = yield request
            .get('/500')
            .expect(500)
    })
});