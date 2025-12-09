

`.service` and `.target` design

Sample of `dns-api.target`

```
(dnshm01-sit|dnshm-sit) vsa11829647:~ #
#    cat /usr/lib/systemd/system/dns-api.target
[Unit]
Description=dns-api meta target for the hiddenmaster
Conflicts=rescue.service rescue.target
After=multi-user.target network-online.target keepalived.service
AllowIsolate=yes
# only allow starting if keepalived is running
# as this target should only be started by keepalived
Requisite=keepalived.service
RequiresMountsFor=/var/lib/dns-api /var/lib/named
Wants=named.service dns-api-check-slaves.path dns-api-check-slaves.timer
```
```mermaid
sequenceDiagram
    participant VIP as VIP (192.168.1.100)
    participant Keepalived
    participant dns-api.target
    participant named.service

    Keepalived->>Keepalived: MASTER transition
    Keepalived->>dns-api.target: systemctl start dns-api.target
    dns-api.target->>Keepalived: 检查 Requisite=keepalived.service (active?)
    dns-api.target->>Mounts: 等待 /var/lib/dns-api 挂载
    dns-api.target->>network: 等待 network-online.target
    dns-api.target->>named.service: Wants → start
    named.service-->>VIP: 开始监听 (仅对 slave 开放 AXFR)
    dns-api.target->>dns-api-check-slaves.timer: 启动定时检查
