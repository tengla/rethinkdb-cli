'use strict';

const Code = require('code');
const expect = Code.expect;
const Lab = require('lab');
const ParseFilter = require('../src/parsefilter');
const lab = exports.lab = Lab.script();

lab.experiment('ParseFilter', () => {

    lab.test('it destructures', (done) => {

        const d = new ParseFilter()
            .destructure('age eq 2');

        expect(d.key).to.equal('age');
        done();
    });

    lab.test('it returns the right ops', (done) => {

        const op = new ParseFilter()
            .exec('name eq \'John Doe\'');
        expect(op).to.be.function();
        done();
    });
});
