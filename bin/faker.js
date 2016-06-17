'use strict';

const Joi = require('joi');
const Args = require('minimist')(process.argv.slice(2));
const Colors = require('colors/safe');
const Faker = require('faker');
const Vm = require('vm');
const Fs = require('fs');

(function () {

    if ( !Fs.existsSync('.fakerrc') ) {
        return false;
    }
    const contents = Fs.readFileSync('.fakerrc', 'utf8');
    const rc = JSON.parse(contents);

    Args._ = Args._.length > 0 && Args._ || rc.args;
    Args.name = Args.name || rc.name;
    Args.n = Args.n || rc.n;
})();

const schema = Joi.object().keys({
    n: Joi.number().required(),
    name: Joi.string().required(),
    '_': Joi.array().min(1).required()
}).with('n','_');

const errorMessages = {
    n: Colors.red('number of items must be given'),
    name: Colors.red('fixture name must be given'),
    '_': Colors.red('Faker methods must be given')
};

const usage = [
    'Usage:',
    '',
    'node ./bin/faker.js --name people -n 5 \\',
    '\t\'name=name.findName()\' \\',
    '\t\'age=random.number(34)\' \\',
    '\t\'address=address.streetAddress()\' \\',
    '\t\'city=address.city()\'',
    ''
];

Joi.validate(Args, schema, (err,val) => {

    if (err) {
        const messages = err.details.map( (detail) => {

            return errorMessages[detail.path];
        });

        if (messages.length > 0) {
            console.log('\n' + messages.join('\n') + '\n');
        }

        console.log(usage.join('\n'));
        process.exit(1);
    }
});

const expressions = Args._.map( (arg) => {

    const key = arg.split('=')[0];
    const val = arg.split('=')[1];

    if (val.match(/\(.*\)$/)) {
        return '\'' + key + '\':Faker.' + val;
    }
    return '\'' + key + '\':\'' + val + '\'';
});

const code = 'this.fn=function () { return {' + expressions.join(',') + '}}; this.toJSON();';

const sandbox = Vm.createContext({
    Faker: Faker,
    n: Args.n || 5,
    name: Args.name || 'fixture',
    fn: null,
    toJSON: function () {

        const packed = {};
        packed[this.name] = Array.apply(null, [this.n]).fill(0).map( (item, idx) => {

            return this.fn();
        });
        return JSON.stringify(packed, null, 4);
    }
});

const script = new Vm.Script(code);
const result = script.runInContext(sandbox);
console.log(result);

