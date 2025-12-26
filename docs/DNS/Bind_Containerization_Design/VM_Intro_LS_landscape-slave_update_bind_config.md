

dns-api-landscape-slave-update-bind-config 的调用时机

调用时机总结
场景	触发方式	调用路径	频率
添加 key	自动	dns-api-check-slaves → SSH newkey → sshwrapper → dns-api-landscape-slave-update-bind-config	当有新 key 需要分发时
删除 key	自动	dns-api-check-slaves → SSH rmkey → sshwrapper → dns-api-landscape-slave-update-bind-config	当 key 需要移除时
初始安装	手动	管理员直接执行 sudo dns-api-landscape-slave-update-bind-config	仅一次（安装时）
配置变更	手动	管理员直接执行（如果 key 文件或 primary slaves 列表发生变化）	按需


```
场景 1: 添加 key
─────────────────
hiddenmaster: dns-api-check-slaves
    │
    ├─> 检测到需要添加 key 到 landscape slave
    │
    ├─> SCP 传输 key 文件到 landscape slave
    │
    └─> SSH 执行: "newkey slave-1-view1 /tmp/keyfile"
        │
        └─> landscape slave: dns-api-sshwrapper
            │
            ├─> 安装 key 文件
            │
            ├─> sudo dns-api-landscape-slave-update-bind-config  ← 触发
            │
            └─> sudo rndc reconfig

场景 2: 删除 key
─────────────────
hiddenmaster: dns-api-check-slaves
    │
    ├─> 检测到需要删除 key
    │
    └─> SSH 执行: "rmkey slave-1-view1"
        │
        └─> landscape slave: dns-api-sshwrapper
            │
            ├─> 删除 key 文件
            │
            ├─> sudo dns-api-landscape-slave-update-bind-config  ← 触发
            │
            └─> sudo rndc reconfig
```

脚本的作用
该脚本被调用时会：
1. 读取 /var/lib/dns-api/keys/*.key 中的所有 key 文件
2. 读取 /etc/dns-api/primaryslaves 中的 primary slave 列表
3. 读取 /etc/dns-api/hiddenmaster 中的 hidden master IP
4. 生成以下 BIND 配置文件：
- /var/lib/named/dns-api/allownotify.conf
- /var/lib/named/dns-api/keys.conf
- /var/lib/named/dns-api/catalog.conf
- /var/lib/named/dns-api/catalog-options.conf
- /var/lib/named/dns-api/controls.conf

注意事项
1. 该脚本不会自动定时运行，只在 key 文件变更时被触发
2. 脚本通过 sudo 执行，需要在 dns-api.sudoers 中配置权限
3. 执行后会自动执行 rndc reconfig 重新加载 BIND 配置
4. 如果 key 文件或 primary slaves 列表发生变化，但自动同步未触发，需要手动执行该脚本

总结：该脚本主要在 key 文件添加或删除时自动调用，也会在初始安装或需要手动更新时被调用。