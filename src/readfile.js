'use strict';

const Fs = require('fs');

const readfile = function (filename) {

    return new Promise( (resolve,reject) => {

        Fs.readFile(filename, 'utf8', (err,data) => {

            if (err) {
                return reject(err);
            }
            resolve(JSON.parse(data));
        });
    });
};

module.exports = readfile;
