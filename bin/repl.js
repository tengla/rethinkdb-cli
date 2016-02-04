'use strict';

const Readline = require('readline');
const Commander = require('../index').Commander;
const Joi = require('joi');
const Color = require('colors');
const Args = require('minimist')(process.argv.slice(2));

const schema = Joi.object().keys({
    db: Joi.string().required(),
    host: Joi.string().required(),
    port: Joi.number(),
    '_': Joi.array()
}).with('db','host','_');

const errorMessages = {
    db: 'No db specified'.red,
    host: 'No host specified'.red
};

const usage = [
    'Usage node repl.js',
    '',
    'DB OPTIONS:',
    '',
    '--host <host> --port <port> --db <name> --auth_key <auth_key>'
];

Joi.validate(Args, schema, function(err,val) {
    if (err) {
        const messages = err.details.map ( (detail) => {
            return errorMessages[detail.path];
        });
        console.log('\n' + messages.join('\n') + '\n');
        console.log(usage.join('\n'));
        process.exit(1);
    }
});

const Config = function (args) {

    const keys = ['host','port','db','auth_key'];
    const conf = {};
    keys.forEach( (k) => {
        conf[k] = args[k];
    });
    return conf;
};

const rl = Readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer: (line) => {
        const completions = 'delete table tables quit'.split(' ');
        const hits = completions.filter((c) => { return c.indexOf(line) == 0 });
        return [hits.length ? hits : completions, line];
    }
});

const command = new Commander()
  .connect(Config(Args));

const Quit = () => {
    console.log('\nbye ...\n');
    command.close();
    rl.close();
};

const defaultPrompt = (p) => {
    rl.setPrompt(p + ' > ');
    rl.prompt(true);
};

command.on('message', (message) => {
    console.log(message);
    defaultPrompt(command.status());
});

command.on('error', (err) => {
    console.error(err);
    defaultPrompt(command.status());
});

command.on('connect', (message) => {
    console.error(message);
    defaultPrompt(command.status());
});

rl.on('line', (cmd) => {
    cmd = cmd.trim();
    command.execString(cmd);
});

command.on('quit', Quit);

rl.on('SIGINT', Quit);
