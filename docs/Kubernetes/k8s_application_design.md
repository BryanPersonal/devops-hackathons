


### Pod

1. 优雅关闭 per container

```jsx title="Lifecycle Hook"
  lifecycle:
    preStop:
      exec:
        command:
        - "pkill"
        - "saslauthd"
```

2. 健康检查 (readiness probe / startup probe / healthy probe)

```

```

3. 



### Logging design 

兼容container的特性，摆脱systemd logger.
bind在哪里切换workdir？From / to `/var/lib/named` `named.conf`

:::danger Question

如何让日志打到docker或容器内?

:::
核心原则: 日志输出到stdout/stderr __应用不能把日志写到文件里__（如 /var/log/named.log)

```
exec /usr/sbin/named -u named -fg -c "${NAMED_CONF}" ${NAMED_ARGS:+ "$NAMED_ARGS"}
  - 用 named 进程替代当前 shell 进程（PID 1）
  - 这样，named 成为容器的主进程（PID 1）
  - 它的 stdout / stderr 直接成为容器的 stdout / stderr
  - Docker 就可以捕获这些日志，并正确地管理这个进程（比如转发信号）
```

```
RUN cp /usr/libexec/bind/named.prep /usr/local/lib/bind/named.prep; \
    sed -i -e 's|logger "Warning: \$1"|echo "Warning: \$1" >&2|' /usr/local/lib/bind/named.prep
```
Analysis:

目的：将日志输出从 logger（依赖 systemd）改为直接输出到 标准错误流（stderr），适配容器环境。
sed 命令：替换脚本中的日志命令，确保警告信息通过 echo 输出到 stderr。

