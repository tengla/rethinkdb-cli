'use strict';

const Joi = require('joi');
const Args = require('minimist')(process.argv.slice(2));
const Colors = require('colors/safe');
const Faker = require('faker');

const schema = Joi.object().keys({
    n: Joi.number().required(),
    name: Joi.string().required(),
    '_': Joi.array().min(1).required()
}).with('n','_');

const errorMessages = {
    n: Colors.red('number of items must be given'),
    name: Colors.red('object name must be given'),
    '_': Colors.red('Faker methods must be given'),
};

const usage = [
    'Usage:',
    '',
    'node ./bin/faker.js --name people -n 5 \\',
    '\t\'name=Faker.name.findName()\' \\',
    '\t\'age=Faker.random.number(34)\' \\',
    '\t\'address=Faker.address.streetAddress()\' \\',
    '\t\'city=Faker.address.city()\'',
    ''
];

Joi.validate(Args, schema, (err,val) => {

    if (err) {
        const messages = err.details.map( (detail) => {

            return errorMessages[detail.path];
        });
        console.log('\n' + messages.join('\n') + '\n');
        console.log(usage.join('\n'));
        process.exit(1);
    }
});

const objects = Array.apply(null, [Args.n]).fill(0).map( (item, idx) => {
    const object = {};
    Args._.forEach( (arg) => {
        let parts = arg.split('=');
        object[parts[0]] = eval(parts[1]);
    });
    return object;
});

const pack = {};

pack[Args.name] = objects;

console.log(JSON.stringify(pack,null,4));
