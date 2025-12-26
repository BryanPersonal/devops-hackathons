


https://en.opensuse.org/Portal:Container/Image/bind

To-do: https://github.com/containers/skopeo/blob/main/install.md

docker run -d --rm -v /srv/bind:/data --name bind -p 53:53/tcp -p 53:53/udp registry.opensuse.org/opensuse/bind

https://build.opensuse.org/package/show/openSUSE:Slowroll:Base/bind-image

RMT - Containerization.
https://documentation.suse.com/sles/15-SP6/html/SLES-all/book-rmt.html

Discussion: https://github.com/SUSE/bci/discussions

#### Conceptional understanding:
- .jnl 文件是 BIND 用于 事务日志（Journal File） 的特定机制
-  bind主数据目录以及子目录解释
    - `dyn`：动态区域文件，属主为 named
    - `master`：静态主区域文件，属主为 root
    - `slave`：从区域文件，属主为 named

- ❌ 高危配置：rndc-key 通常用于控制 BIND 服务，而非动态更新（建议使用独立的 TSIG 密钥）

- zone transfer 
    - pre-requisite (network tcp/udp 53 port)
    - zone transfer method 
        - AXFR/IXFR
        - notify 
    - zone transfer security 
        - TSIG
        - GSS-TSIG
    - zone transfer configuration 
        - allow-transfer
        - allow-notify
        - masters/slaves

- 热加载 rndc reload VS rndc reconfig ??
- rndc retransfer 强制slave忽略SOA serial号，强制从主服务器重新传输区域数据
- rndc sync -clean 强制清除所有临时文件
- _default.nzf 是BIND 实现动态Zone管理的核心文件
- 只有在 BIND 的配置中显式声明 allow-new-zones yes; 后，才能通过 rndc addzone 动态添加或删除 Zone
- `view any`视图匹配所有客户端：通过 match-clients `{ any; }` 匹配所有未被其他视图覆盖的客户端请，可将  zone "." zone "localhost" 和 zone "0.0.127.in-addr.arpa" 放在`any` 视图中
    - 仅递归服务需要 根区域 `(.)`, 提供根DNS服务器列表(named.root), 用于递归查询。 权威服务器通常不需要
    - localhost 区域 解析 localhost 到 127.0.0.1，用于本地服务通信。
    - 0.0.127.in-addr.arpa 区域反向解析 127.0.0.1，用于本地日志或工具验证。
- testtest
tmp--> 
BIND 的其他临时文件类型
除 .jnl 文件外，BIND 还可能生成其他类型的临时文件，具体取决于配置和使用场景：

缓存文件

BIND 默认将 DNS 缓存数据存储在内存中，但某些场景（如大流量递归解析）可能启用磁盘缓存，生成临时缓存文件，通常位于 /var/cache/bind 目录。
动态区域文件（Dynamic Zone）

使用动态区域更新时，BIND 可能生成临时文件保存未提交的更新，并在提交后合并到主区域文件。
上传或转储文件

例如，通过 rndc 命令触发配置重载或区域转储时，可能生成临时中间文件，通常以 .tmp 或随机命名后缀存在。
--> 
监控 .jnl 文件状态：若 .jnl 文件长期存在或体积异常增大，可能表明密钥更新失败或存在未合并的事务，需通过 rndc sync -clean 手动清理 
13
。
隔离临时文件权限：确保 BIND 运行用户（如 named）对临时目录有读写权限，同时限制其他用户访问，避免安全风险 



