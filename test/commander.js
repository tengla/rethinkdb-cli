'use strict';

const Code = require('code');   // assertion library
const expect = Code.expect;
const Lab = require('lab');
const Commander = require('../index').Commander;
const lab = exports.lab = Lab.script();
let commander;

lab.experiment('Commander', () => {

    lab.beforeEach( (done) => {

        commander = new Commander();
        done();
    });

    lab.test('connect', (done) => {

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

    lab.test('it has status \'not connected\'', (done) => {

        commander.conn = null;
        expect(commander.status()).to.equal('Not connected');
        done();
    });

    lab.test('it has status connected', (done) => {

        commander.on('connect', () => {

            expect(commander.status()).to.equal('localhost:28015/test');
            done();
        });
        commander.connect({ db: 'test' });
    });

    lab.test('execString', (done) => {

        commander.on('message', (list) => {

            expect(list).to.be.string();
            done();
        });

        commander.on('connect', (msg) => {

            commander.execString('tableList');
        });

        commander.connect({ db: 'test' });
    });

    lab.test('emit', (done) => {

        expect(commander.emit('bogus', 1,2,3)).to.be.undefined();
        done();
    });

    lab.test('exec', (done) => {

        expect(commander.exec('bogus', 1,2,3)).to.equal(commander);
        done();
    });

    lab.test('defaultResolver', (done) => {

        expect(commander.defaultResolver({ name: 'bogus' })).to.be.undefined();
        done();
    });

    lab.test('defaultRejecter', (done) => {

        expect(commander.defaultRejecter({ name: 'bogus' })).to.be.undefined();
        done();
    });

    lab.test('close', (done) => {

        commander.connect({ db: 'test' });
        commander.on('connect', () => {

            commander.close();
            done();
        });
    });

    lab.test('quit', (done) => {

        commander.operations.quit.call(commander);
        done();
    });

    lab.test('use', (done) => {

        commander.connect({ db: 'test' });

        commander.on('message', (msg) => {

            expect(msg).to.equal('Using test');
            done();
        });

        commander.on('connect', () => {

            commander.operations.use.call(commander, 'test');
        });
    });

    lab.test('help', (done) => {

        commander.operations.help.call(commander);
        done();
    });

    lab.test('tableList', (done) => {

        commander.on('connect', (msg) => {

            expect(commander.operations.tableList.call(commander)).to.equal(commander);
            done();
        });
        commander.connect({ db: 'bogus' });
    });
});
