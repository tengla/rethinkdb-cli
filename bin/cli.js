'use strict';

const Assert = require('assert');
const GetOpt = require('node-getopt');
const Recli = require('../index');
const Readfile = Recli.Readfile;
const Command = Recli.Commander;

const Opts = [
    ['l' ,'ls'                , 'list dbs'],
    ['T' , 'tablelist'        , 'list tables'],
    ['C' , 'tablecreate='     , 'create table'],
    [''  , 'tabledrop='       , 'drop table'],
    ['t' , 'table='           , 'list table content'],
    [''  , 'filter='          , 'filter by attribute:value [optional]'],
    [''  , 'get='             , 'get object by id [optional]'],
    [''  , 'count'            , 'count [optional]'],
    [''  , 'limit='           , 'limit [optional]'],
    [''  , 'skip='            , 'skip [optional]'],
    [''  , 'changes'          , 'listen to table changes'],
    [''  , 'indexcreate='     , 'create index on table'],
    [''  , 'indexdrop='       , 'drop index from table'],
    [''  , 'indexstatus'      , 'index status from table'],
    ['I' , 'insert='          , 'insert, with reference to json file'],
    ['u' , 'update='          , 'update table. Use with --get and --json'],
    [''  , 'json='            , 'json data'],
    ['D' , 'delete='          , 'delete table contents'],
    [''  , 'return-changes'   , 'return changes [optional]'],
    [''  , 'dbcreate='        , 'create db'],
    [''  , 'dbdrop='          , 'drop db'],
    ['h'  , 'help'            , 'display this help'],
    ['v' , 'version'          , 'show version'],
    [''  , 'verbose'          , 'be verbose'],
    [''  , 'db='              , 'db name'],
    [''  , 'host='            , 'hostname'],
    [''  , 'port='            , 'port number'],
    [''  , 'auth_key='        , 'authentication key']
];

const Config = function (options) {

    return {
        db: options.db || 'test',
        host: options.host,
        port: options.port,
        auth_key: options.auth_key
    };
};

const opts = GetOpt.create(Opts)
    .bindHelp();

const commander = new Command();

commander.on('connect', (msg) => {

    if (getOpt.options.verbose) {
        console.log(msg);
    }
    runner(getOpt.options,getOpt.argv);
});

commander.on('message', (msg) => {

    console.log(msg);
    commander.close();
});

commander.on('change', (tableName, item) => {

    console.log(tableName + ' changed :', item);
});

commander.on('error', (err) => {

    console.log(err);
    commander.close();
});

const getOpt = opts.parseSystem();

if (getOpt.options.version) {
    Readfile('./package.json').then( (pkg) => {

        console.log('Version ' + pkg.version);
    });
}
else if (Object.keys(getOpt.options).length < 1 ) {
    opts.showHelp();
}
else {
    commander.connect(Config(getOpt.options));
}

const ensureTable = function (table) {

    try {
        Assert.ok(table);
    }
    catch (err) {
        console.error('Table is not set. Use --table switch');
        commander.close();
        return false;
    }
    return true;
};

const runner = function (options,args) {

    if (options.dbcreate) {
        return commander.exec('dbCreate', options.dbcreate);
    }

    if (options.dbdrop) {
        return commander.exec('dbDrop', options.dbdrop);
    }

    if (options.ls) {
        return commander.exec('dbList');
    }

    if (options.tablelist) {
        return commander.exec('tableList');
    }

    if (options.indexdrop) {
        return commander.exec('indexDrop', options.table, options.indexdrop);
    }

    if (options.indexcreate) {
        return commander.exec('indexCreate', options.table, options.indexcreate);
    }

    if (options.indexstatus) {
        return ensureTable(options.table) &&
            commander.exec('indexStatus', options.table);
    }

    if (options.changes) {
        return commander.exec('changes', options.table);
    }

    if (options.table && options.get) {

        return commander.exec('get', options.table, options.get);
    }

    if (options.table) {
        return commander.exec('table', options.table,options.filter,options.count,options.limit, options.skip);
    }

    if (options.tablecreate) {
        return commander.exec('tableCreate', options.tablecreate);
    }

    if (options.tabledrop) {
        return commander.exec('tableDrop', options.tabledrop);
    }

    if (options.delete) {
        return commander.exec('delete', options.delete);
    }

    if (options.insert) {
        return Readfile(options.insert).then( (data) => {

            commander.exec('insert', data, options['return-changes']);
        }, (err) => {

            commander.emit('error',err.msg);
        });
    }

    if (options.update && options.get && options.json) {
        return commander.exec('update',options.update,options.get,options.json);
    }

    console.log('Noop. Did you want something?');
    commander.close();
};
