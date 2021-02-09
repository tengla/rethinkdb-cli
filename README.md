# rethinkdb-cli

NodeJS CLI runner and REPL for [Rethinkdb](https://github.com/rethinkdb/rethinkdb)

Work in progress, but it's still highly usable. Shout out, fork, fix and do pull request.

### CLI 

```
node ./bin/cli.js --help
Usage: node cli.js

  -l, --ls              list dbs
  -T, --tablelist       list tables
  -C, --tablecreate=    create table
      --tabledrop=      drop table
  -t, --table=          list table content
      --filter=         filter by 'key operator value'
      --get=            get object by id [optional]
      --count           count [optional]
      --limit=          limit [optional]
      --skip=           skip [optional]
      --changes         listen to table changes
      --indexcreate=    create index on table
      --indexdrop=      drop index from table
      --indexstatus     index status from table
  -I, --insert=         insert, with reference to json file
  -u, --update=         update table. Use with --get and --json
      --json=           json data
  -D, --delete=         delete table contents
      --return-changes  return changes [optional]
      --dbcreate=       create db
      --dbdrop=         drop db
  -h, --help            display this help
  -v, --version         show version
      --verbose         be verbose
      --db=             db name
      --host=           hostname
      --port=           port number
      --username=       username
      --password=       password
      --auth_key=       authentication key (alternative authentication)
```

### REPL
```
node ./bin/repl.js
```

Commands reflects rethinkdb api as much as possible

Example: 

```
node ./bin/repl.js --db test --host 192.168.99.101
Connected to 192.168.99.101:28015/test
192.168.99.101:28015/test > tableList
test has artists, people
```

```
node ./bin/repl.js --db test --host 192.168.99.101
Connected to 192.168.99.101:28015/test
192.168.99.101:28015/test > table artists
[
    {
        "id": "308c0d95-9540-4a1c-93f5-85b84fdb35cc",
        "name": "Wild Man Fischer"
    },
    {
        "id": "26d4bb72-46fd-4181-90d6-29269a3d629e",
        "name": "Frank Zappa"
    },
    {
        "id": "6dd6e268-55fb-4dd4-9d21-7b38336c97ca",
        "name": "Bon Jovi"
    }
]
```

#### To generate a fixture with the help of [Faker](https://github.com/FotoVerite/Faker.js)

This might prove helpful when you want to fill a table with lots of fake data.
```
node ./bin/faker.js --name people -n 3 \
  'name=name.findName()' \
  'age=random.number(34)' \
  'address=address.streetAddress()' \
  'city=address.city()' > people.json
```

That would yield something like:
```
{
    "people": [
        {
            "name": "Lillie Barton",
            "age": 24,
            "address": "951 Wuckert Vista",
            "city": "East Karli"
        },
        {
            "name": "Geovanni Orn",
            "age": 1,
            "address": "006 Isai Parkway",
            "city": "West Jacques"
        },
        {
            "name": "Ms. Frances Eichmann",
            "age": 22,
            "address": "3448 Vandervort Fort",
            "city": "Hilda land"
        }
    ]
}
```

Create a table.
```
node ./bin/cli.js --host localhost --db test --tablecreate people
```

Now insert the fixture.
```
node ./bin/cli.js --host localhost --db test -I people.json
```

Then do a query.
```
node ./bin/cli.js --host localhost --db test -t people
```

You can filter too.
```
node ./bin/cli.js --host localhost --db test -t people --filter 'city match Hilda.*$'
```

You might have a few million records. Narrow it down some.
```
node ./bin/cli.js --host localhost --db test -t people --limit 100 --skip 500000
```

Now you might want to clear the whole table.
```
node ./bin/cli.js --host localhost --db test -D people
```

Or simply delete a single record by id.
```
node ./bin/cli.js --host localhost --db test -D people --delete-id=036fb25b-f225-4b99-9f60-8267424b9ba0
```

Update a row.
```
node ./bin/cli.js --host localhost --db test -u people --get '123' --json '{"name":"Jane Doe"}'
```

### Author

Thomas Tinnesand Eng

### Travis
[![Build Status](https://travis-ci.org/athlite/rethinkdb-cli.svg?branch=master)](https://travis-ci.org/athlite/rethinkdb-cli)

### Licence

[ISC](https://opensource.org/licenses/ISC)
