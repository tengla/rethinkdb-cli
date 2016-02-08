'use strict';

const Code = require('code');   // assertion library
const expect = Code.expect;
const Lab = require('lab');
const Commander = require('../index').Commander;
const lab = exports.lab = Lab.script();
const Fs = require('fs');
let commander;

lab.experiment('Commander', () => {

    lab.beforeEach( (done) => {
        commander = new Commander();        
        done();
    });

    lab.afterEach( (done) => {
        commander.close();
        done();
    });

    lab.test('connects', (done) => {
        commander.on('connect', (msg) => {
            expect(msg).to.match(/Connected to/);
            done();
        });
        commander.connect({ db: 'test' });
    });

    lab.test('does not connect', (done) => {
        
        commander.connect = function () {
            this.emit('error', 'mocking this');
        };

        commander.close = () => {};

        commander.on('error', (msg) => {
            expect(msg).to.match(/mocking this/);
            done();
        });

        commander.connect({ db: 'test' });
    });
});
