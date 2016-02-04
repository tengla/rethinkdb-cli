'use strict';

const Readline = require('readline');
const Commander = require('../index').Commander;

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
  .connect({ db: process.argv[2] });

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
    command.exec(cmd);
});

command.on('quit', Quit);

rl.on('SIGINT', Quit);
