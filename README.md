# rethinkdb-cli

A CLI runner and REPL for [Rethinkdb](https://github.com/rethinkdb/rethinkdb)

Work in progress, but it's still of use. Expect to see a wrinkle here and there, especially in the REPL. Shout out. Or fork, fix and pull a request.

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
node ./bin/faker.js --name people -n 3 \
  'name=Faker.name.findName()' \
  'age=Faker.random.number(34)' \
  'address=Faker.address.streetAddress()' \
  'city=Faker.address.city()' > people.json
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
node ./bin/cli.js --host localhost --db test -t people --filter city:'Hilda.*$'
```

You might have a few million records. Narrow it down some.
```
node ./bin/cli.js --host localhost --db test -t people --limit 100 --skip 500000
```

Now you might want to clear the whole table.
```
node ./bin/cli.js --host localhost --db test -D people
```

### Author

Thomas Tinnesand Eng

### Licence

[ISC](https://opensource.org/licenses/ISC)
