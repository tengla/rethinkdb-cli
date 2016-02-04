# rethinkdb-cli

### CLI 
```node ./bin/cli.js --help```

### REPL
```node ./bin/repl.js```

#### Available commands 

Commands are as closely mirrored to rethinkdb api as possible

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
