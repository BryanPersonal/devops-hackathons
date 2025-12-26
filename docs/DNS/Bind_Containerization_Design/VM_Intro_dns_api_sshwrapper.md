
```
hiddenmaster: dns-api-check-slaves
    │
    ├─> SSH 连接到 primary slave
    │   └─> 执行: "sudo dns-api view list"
    │       └─> primary slave: dns-api-sshwrapper
    │           └─> 执行: sudo dns-api view list
    │
    ├─> SSH 连接到 primary slave
    │   └─> 执行: "sudo dns-api key add --from /tmp/keyfile view keyname"
    │       └─> primary slave: dns-api-sshwrapper
    │           └─> 执行: sudo dns-api key add ...
    │
    ├─> SCP 传输 key 文件到 landscape slave
    │   └─> landscape slave: dns-api-sshwrapper
    │       └─> 处理 SCP 接收
    │
    ├─> SSH 连接到 landscape slave
    │   └─> 执行: "newkey slave-1-view1 /tmp/keyfile"
    │       └─> landscape slave: dns-api-sshwrapper
    │           ├─> 安装 key 文件
    │           ├─> sudo dns-api-landscape-slave-update-bind-config
    │           └─> sudo rndc reconfig
    │
    ├─> SSH 连接到 landscape slave
    │   └─> 执行: "listkeys"
    │       └─> landscape slave: dns-api-sshwrapper
    │           └─> 列出所有 key 文件
    │
    └─> SSH 连接到 primary/landscape slave
        └─> 执行: "role"
            └─> slave: dns-api-sshwrapper
                └─> 执行: sudo dns-api role get
```

