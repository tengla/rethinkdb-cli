# rethinkdb-cli

A CLI runner and REPL for [Rethinkdb](https://github.com/rethinkdb/rethinkdb)

### CLI 

```
node ./bin/cli.js --help
Usage: node cli.js

  -l, --ls              list dbs
  -T, --tablelist       list tables
  -C, --tablecreate=    create table
      --tabledrop=      drop table
  -t, --table=          list table content
  -I, --insert=         insert, with reference to json file
  -D, --delete=         delete table contents
      --filter=         filter by attribute:value
      --return-changes  return changes
      --dbcreate=       create db
      --dbdrop=         drop db
  -h, --help            display this help
  -v, --version         show version
      --verbose         be verbose
      --db=             db name
      --host=           hostname
      --port=           port number
      --auth_key=       authentication key
```

### REPL
```node ./bin/repl.js```

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
node ./bin/faker.js --name people -n 5 \
  'name=Faker.name.findName()' \
  'age=Faker.random.number(34)' \
  'address=Faker.address.streetAddress()' \
  'city=Faker.address.city()' > people.json
```
