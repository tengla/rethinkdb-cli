'use strict';

const Code = require('code');   // assertion library
const expect = Code.expect;
const Lab = require('lab');
const Readfile = require('../index').Readfile;
const lab = exports.lab = Lab.script();
const Fs = require('fs');

lab.experiment('Readfile', () => {

    lab.before( (done) => {

        const data = JSON.stringify({
            people: {
                name: 'John Doe',
                age: 29
            }
        }, null, 4);

        Fs.writeFile('./fud.json', data, 'utf8', (err) => {

            done(err);
        });
    });

    lab.after( (done) => {

        Fs.unlink('./fud.json', done);
    });

    lab.test('it reads', (done) => {

        Readfile('./fud.json').then( (data) => {

            expect(data.people.name).to.equal('John Doe');
            expect(data.people.age).to.equal(29);
            done();
        }, done);
    });

    lab.test('it doesn\'t read when file is not present', (done) => {

        Readfile('./no-file.json').then( () => {}, (err) => {

            expect(err.code).to.equal('ENOENT');
            done();
        });
    });
});
