'use strict';

const R = require('rethinkdb');
const Colors = require('colors/safe');
const ParseFilter = require('./parsefilter');

const Commander = function () {

    this.conn = null;
    this.observers = {};
};

Commander.prototype.close = function () {

    return this.conn.close();
};

Commander.prototype.connect = function (config) {

    R.connect(config).then( (c) => {

        this.conn = c;
        this.emit('connect', 'Connected to ' + this.status());
    });
    return this;
};

Commander.prototype.operations = {

    changes: function (name) {

        R.table(name).changes().run(this.conn).then( (cursor) => {

            cursor.each( (err,item) => {

                if (err) {
                    return this.emit('error', err.msg);
                }
                this.emit('change', name, item);
            });
        }, this.defaultRejecter);
        return this;
    },

    get: function (name,id) {

        R.table(name).get(id).run(this.conn).then(
            this.defaultResolver.bind(this),
            this.defaultRejecter.bind(this)
        );
        return this;
    },

    dbList: function () {

        R.dbList().run(this.conn).then( (list) => {

            const message = this.conn.host + ' has dbs \'' + list.join('\', \'') + '\'';
            this.emit('message', message);
        }, (err) => {

            this.emit('error', err.msg);
        });
        return this;
    },

    dbCreate: function (name) {

        R.dbCreate(name).run(this.conn).then( (result) => {

            this.emit('message', JSON.stringify(result, null, 4));
        }, (err) => {

            this.emit('error', err.msg);
        });
        return this;
    },

    dbDrop: function (name) {

        R.dbDrop(name).run(this.conn).then(this.defaultResolver.bind(this), this.defaultRejecter.bind(this));
        return this;
    },

    delete: function (name) {

        R.table(name).delete().run(this.conn).then(
            this.defaultResolver.bind(this),
            this.defaultRejecter.bind(this)
        );
        return this;
    },

    indexCreate: function (table,name) {

        R.table(table).indexCreate(name).run(this.conn).then(
            this.defaultResolver.bind(this),
            this.defaultRejecter.bind(this)
        );
        return this;
    },

    indexDrop: function (table,name) {

        R.table(table).indexDrop(name).run(this.conn).then(
            this.defaultResolver.bind(this),
            this.defaultRejecter.bind(this)
        );
        return this;
    },

    indexStatus: function (table) {

        R.table(table).indexStatus().run(this.conn).then(
            this.defaultResolver.bind(this),
            this.defaultRejecter.bind(this)
        );
        return this;
    },

    insert: function (object,returnChanges) {

        if (!object) {
            this.emit('error', 'No objects specified for \'' + name + '\'');
            return this;
        }

        const tables = Object.keys(object);

        const promises = tables.map( (table) => {

            return R.table(table).insert(object[table],{ returnChanges: returnChanges }).run(this.conn);
        });

        Promise.all(promises).then(
            this.defaultResolver.bind(this),
            this.defaultRejecter.bind(this)
        );

        return this;
    },

    table: function (name, filter, count, limit, skip) {

        if (!name) {
            this.emit('error', 'I need a table name to do that');
            return this;
        }

        let query = R.table(name);

        if (filter) {

            const fn = new ParseFilter().exec(filter);
            query = query.filter(fn);
        }

        if (count) {
            query = query.count().run(this.conn).then(
                this.defaultResolver.bind(this),
                this.defaultRejecter.bind(this)
            );
            return this;
        }

        if (skip && limit) {

            skip = Number(skip).valueOf();
            limit = Number(limit).valueOf();

            query = query.slice(skip, skip + limit);
        }
        else if (limit) {
            query = query.limit(Number(limit).valueOf());
        }

        query.run(this.conn).then( (cursor) => {

            cursor.toArray().then(
                this.defaultResolver.bind(this),
                this.defaultRejecter.bind(this)
            );
        }, this.defaultRejecter.bind(this));

        return this;
    },

    tableCreate: function (name) {

        R.tableCreate(name)
            .run(this.conn)
            .then(
                this.defaultResolver.bind(this),
                this.defaultRejecter.bind(this)
            );
        return this;
    },

    tableDrop: function (name) {

        R.tableDrop(name)
            .run(this.conn)
            .then(
                this.defaultResolver.bind(this),
                this.defaultRejecter.bind(this)
            );
        return this;
    },

    tableList: function () {

        R.tableList().run(this.conn).then( (list) => {

            const message = list.length > 0 ? '\n' + this.conn.db
                + ' has tables:\n\n\t \''
                + list.join('\', \'')
                + '\'\n' : this.conn.db + ' is empty';

            return this.emit('message', message);
        }, (err) => {

            return this.emit('error', err.msg);
        });
        return this;
    },

    update: function (table,id,json) {

        const data = JSON.parse(json);
        R.table(table)
            .get(id)
            .update(data, { returnChanges: true })
            .run(this.conn)
            .then(
                this.defaultResolver.bind(this),
                this.defaultRejecter.bind(this)
            );
        return this;
    },

    use: function (name) {

        this.conn.use(name);
        this.emit('message', 'Using ' + name);
    },

    help: function () {

        const message = 'Possible commands are '
            + Object.keys(this.operations).join(', ');

        this.emit('message', message);
    },

    quit: function () {

        this.emit('quit');
    }
};

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
    return this.exec.apply(this, args);
};

Commander.prototype.emit = function () {

    const name = arguments[0];
    const args = Array.prototype.slice.call(arguments,1);
    const method = this.observers[name];
    return method && method.apply(null,args);
};

Commander.prototype.on = function (name, callback) {

    this.observers[name] = callback;
    return this;
};

Commander.prototype.status = function () {

    try {
        return this.conn.host + ':' + this.conn.port + '/' + this.conn.db;
    }
    catch (err) {
        return 'Not connected';
    }
};

module.exports = Commander;
