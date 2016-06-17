'use strict';

Promise = require('bluebird');
const Hoek = require('hoek');

const Qf = function (filter) {

    this.id = (Math.random() * 1000 * Date.now()).toString(36);
    this.filter = filter;
};

Qf.prototype.ops = function (args) {

    const _ = {
        lt: function () {

            return function (doc) {

                return doc(this.key).lt(this.value);
            };
        },
        gt: function () {

            return function (doc) {

                return doc(this.key).gt(this.value);
            };
        },
        eq: function () {

            return function (doc) {

                return doc(this.key).eq(this.value);
            };
        },
        contains: function () {

            return function (doc) {

                return doc(this.key).contains(this.value);
            };
        },
        match: function () {

            return function (doc) {

                return doc(this.key).match(this.value);
            };
        }
    };
    return _[args.ops].call(undefined).bind(args);
};

Qf.prototype.destructure = function (filter) {

    const parts = filter.split(' ');
    return this.normalize({
        key: parts.shift(),
        ops: parts.shift(),
        value: parts.join(' ')
    });
};

Qf.prototype.exec = function (filter) {

    return this.ops(this.destructure(filter));
};

Qf.prototype.normalize = function (_obj) {

    const obj = Hoek.clone(_obj);
    if (typeof obj.value === 'string' && obj.value.match(/^\d+$/)) {
        obj.value = Number(obj.value).valueOf();
    }
    return obj;
};

module.exports = Qf;
