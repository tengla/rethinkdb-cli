'use strict';

const R = require('rethinkdb');
const Colors = require('colors/safe');

const Commander = function (config) {

    this.conn = null;
    this.observers = {};
    this.store = {};
};

Commander.prototype.close = function () {

    return this.conn.close();
};

Commander.prototype.connect = function (config) {

    R.connect(config).then( (c) => {

        this.conn = c;
        this.emit('connect', 'Connected to ' + this.status());
    }, (err) => {

        this.emit('error', err.message);
    });
    return this;
};

Commander.prototype.operations = require('./operations');

Commander.prototype.defaultResolver = function (result) {

    this.emit('message', JSON.stringify(result, null, 4));
};

Commander.prototype.defaultRejecter = function (err) {

    this.emit('error', err.msg);
};

Commander.prototype.exec = function () {

    const cmd = arguments[0];
    const args = Array.prototype.slice.call(arguments, 1);
    const op = this.operations[cmd];

    if ( op ) {
        op.bind(this).apply(null, args);
    }
    else {
        this.emit('error', 'No such operation: \'' + Colors.red(cmd) + '\'');
    }

    return this;
};

Commander.prototype.execString = function (line) {

    const args = line.split(' ');

    return this.exec.call(this, args);
};

Commander.prototype.emit = function () {

    const name = arguments[0];
    const args = Array.prototype.slice.call(arguments,1);
    const method = this.observers[name];
    if (!method) {
        return null;
    }
    method.apply(null,args);
};

Commander.prototype.on = function (name, callback) {

    this.observers[name] = callback;
    return this;
};

Commander.prototype.status = function () {

    let message = 'Not connected';
    if (this.conn) {
        message = this.conn.host + ':' + this.conn.port;
        message = message + (this.conn.db ? ('/' + this.conn.db) : '');
    }
    return message;
};

module.exports = Commander;
