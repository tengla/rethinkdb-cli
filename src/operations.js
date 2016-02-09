'use strict';

const R = require('rethinkdb');

const queryFilter = function (query, filter) {

    if (!filter) {
        return query;
    }

    filter = filter.split(':');

    const key = filter[0];
    const val = filter[1];
    const _filter = {};

    if (!isNaN(val)) {
        _filter = {};
        _filter[key] = Number(val).valueOf();
        return query.filter(_filter);
    }

    if (val.match(/[\.\+\?\*\^\$]/)) {
        return query.filter( (doc) => {

            return doc(key).match(val);
        });
    }

    _filter[key] = val;
    return query.filter(_filter);
};

module.exports = {

    changes: function (name) {

        R.table(name).changes().run(this.conn).then( (cursor) => {

            cursor.each((err,item) => {

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
        }, () => {

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

    table: function (name, filter, count, limit, skip) {

        if (!name) {
            this.emit('error', 'I need a table name to do that');
            return this;
        }

        let query = R.table(name);

        query = queryFilter(query,filter);

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

    tableList: function () {

        R.tableList().run(this.conn).then( (list) => {

            const message = list.length > 0 ? this.conn.db + ' has ' + list.join(', ') : this.conn.db + ' is empty';
            this.emit('message', message);
        }, (err) => {

            this.emit('error', err.msg);
        });
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

        return this.emit('quit');
    }
};
