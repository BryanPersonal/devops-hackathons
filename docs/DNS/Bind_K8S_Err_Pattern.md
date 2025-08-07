

Err Pattern

### NO.1
```
│ named 11-Jul-2025 08:21:55.352 errno2result.c:123:isc___errno2result(): unexpected error:                                                                                                                                                                                                                                                        ││ named 11-Jul-2025 08:21:55.352 file.c                                                                                                                                                                                                                                                                 ││ named 11-Jul-2025 08:21:55.352 dumping master file: rename: dyn/dyn.example.com.zone: unexpected error 


bind-master-1:/var/lib/named/dyn # ls -ltra
total 48
-rw-r--r-- 1 nobody nobody  805 Jul 11 06:35 dyn.example.com.jnl
-rw-r--r-- 1 nobody nobody  397 Jul 11 06:49 tmp-U8uY3Odlzo
-rw-r--r-- 1 nobody nobody  397 Jul 11 07:03 tmp-Kdbgtfr9jp
-rw-r--r-- 1 nobody nobody  397 Jul 11 07:16 tmp-afqnvrvecs
-rw-r--r-- 1 nobody nobody  397 Jul 11 07:29 tmp-FCEGHOfHyn
-rw-r--r-- 1 nobody nobody  397 Jul 11 07:43 tmp-1L6E2U9Umf
-rw-r--r-- 1 nobody nobody  397 Jul 11 07:57 tmp-jOWxtSS9p0
-rw-r--r-- 1 root   root    386 Jul 11 08:10 dyn.example.com.zone
-rw-r--r-- 1 nobody nobody  397 Jul 11 08:21 tmp-j4I8KRot6K
drwxr-xr-x 6 nobody nobody 4096 Jul 11 08:34 ..
drwxr-xr-x 2 named  named  4096 Jul 11 08:36 .
-rw-r--r-- 1 nobody nobody  397 Jul 11 08:36 tmp-XxOO3nQ90e
```

dumping master file 
这指的是 BIND（named）尝试将内存中的 zone 数据写入磁盘，也称为 "zone dump" 或 "zone save"。
写入的目标就是你配置中指定的 zone 文件，例如：

| 触发行为                   | 说明                                    |
| ---------------------- | ------------------------------------- |
| `rndc freeze` / `thaw` | 会强制 dump zone 文件                      |
| `rndc sync`            | 显式要求写入内存中的 zone 到磁盘                   |
| 有动态更新发生（如 nsupdate）    | 在 `allow-update` 情况下，更新后自动 dump zone  |
| 自动周期性刷新（定时触发）          | BIND 会根据配置定期保存 `.zone`（如 SOA refresh） |
| 退出 named               | 在优雅退出前，可能会 dump zone                  |
| Master 接收 Slave 请求时    | 有时会刷新 zone 并 dump                     |

### NO.2
手动更改权限后 权限又会被自动改掉

永远不要直接将 .zone 文件通过 ConfigMap 只读方式挂入 dyn/ 目录
使用 initContainer+PVC+非 root 用户写入 .zone 是最安全的办法
```
❌ 原因 3：Kubernetes ConfigMap 无法保证属主或权限（尤其在 NFS 场景）
ConfigMap 是以 root:root 拥有者挂载的

使用 NFS（如 Manila）时，chown 会失败，文件系统变成只读：

chown: changing ownership of 'dyn.example.com.zone': Read-only file system
无法使用 securityContext.fsGroup 修复（对 ConfigMap 无效）

这会导致 BIND 启动失败或运行中 crash-loop。
```


```
          volumeMounts:
          #   - name: zone-configmap
          #     mountPath: /var/lib/named/dyn/dyn.example.com.zone
          #     subPath: dyn.example.com.zone  # mount the file only not the whole dir
```