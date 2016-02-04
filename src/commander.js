'use strict';

const R = require('rethinkdb');
const Colors = require('colors');

const Commander = function (config) {
    this.conn = null;
    this.observers = {};
    this.store = {};
};

Commander.prototype.operations = require('./operations');

Commander.prototype.execString = function (line) {

    const args = line.split(' ');
    const cmd  = args.splice(0,1)[0];

    if (cmd === 'set') {
        const ivar = args.splice(0,1)[0];
        const data = eval(args.join(' '));
        this.store[ivar] = data;
        this.fire('message', [JSON.stringify(this.store, null, 4)]);
        return this;
    }
    return this.exec(cmd, args);
};

Commander.prototype.defaultResolver = function (result) {
    this.fire('message', [JSON.stringify(result, null, 4)]);
};

Commander.prototype.defaultRejecter = function (err) {
    this.fire('error', [err.msg]);
};

Commander.prototype.exec = function (cmd, args) {

    const op = this.operations[cmd];

    if ( op ) {
        op.bind(this).apply(null, args);
    } else {
        this.fire('error', ['No such operation: \'' + cmd.red + '\'']);
    }

    return this;
};

Commander.prototype.status = function () {
    let message = 'Not connected';
    if (this.conn) {
        message = this.conn.host + ':' + this.conn.port
        message = message + (this.conn.db ? ('/' + this.conn.db) : '');
    }
    return message;
};

Commander.prototype.connect = function (config) {
    R.connect(config).then( (c) => {
        this.conn = c;
        this.fire('connect', ['Connected to ' + this.status()]);
    }, (err) => {
        this.fire('error', [err.message]);
    });
    return this;
};

Commander.prototype.on = function (name, callback) {
    this.observers[name] = callback;
    return this;
};

Commander.prototype.fire = function (name, args) {
    const method = this.observers[name];
    if (!method) {
        return null;
    }
    method.apply(null,args);
};

Commander.prototype.close = function () {
    return this.conn.close();
};

module.exports = Commander;