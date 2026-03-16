

Initial Setup

0. pre-check systemd nfs special write config
1. `dns-api role set hiddemaster` or `dns-api role get`
2. `dns-api set hm <vip> <vip_fqdn>` E.g `dns-api hiddenmaster set 10.180.64.244 dnshm-sit.sni-dev.sni.int.sap`
3. `dns-api view add global`  # This must be done to initialize `global.catalog` zone content to gurantee the check script `/usr/lib/saas-bind9/keepalived-track-named` state.
    - Double check metazone data `/etc/dns-api/templates/hiddenmaster/zone.tt` before adding the view or zone. 
4. Known bug: You must initize a `testzone` after creating `global.catalog` under `global` view.
5. `global.catalog` should become an authoritative zone now. 


Known issues:

Post initial setup: 
```
(ps02-sit) vsa14793796:~ #
# dns-api role set primaryslave
named.conf.include.tt from /etc/dns-api/templates/primaryslave: undefined variable: views.keys.sort


Issue: dns-api primaryslave add <Ip> doesn't work

Coz this is generated on the fly/etc/dns-api/id_rsa.pub


(dnshm01-sit|dnshm-sit) vsa14793779:/etc/dns-api/templates/hiddenmaster #
# dns-api zone add global testzone2
server reload successful
rndc: 'addzone' failed: bad zone
dns_zone_loadnew failed: bad zone

# bind logs 
13-Mar-2026 01:18:16.079 general: notice: running
13-Mar-2026 01:18:16.095 general: info: received control channel command 'showzone hellotest.internal in global'
13-Mar-2026 01:18:16.131 general: info: received control channel command 'addzone hellotest.internal in global { type master; file "dyn/global/hellotest.internal"; };
'
13-Mar-2026 01:18:16.135 general: error: zone hellotest.internal/IN/global: NS 'dns01-sit.sni-dev.sni.int.sap.hellotest.internal' has no address records (A or AAAA)
13-Mar-2026 01:18:16.135 general: error: zone hellotest.internal/IN/global: NS 'dns02-sit.sni-dev.sni.int.sap.hellotest.internal' has no address records (A or AAAA)
13-Mar-2026 01:18:16.135 zoneload: error: zone hellotest.internal/IN/global: not loaded due to errors.
13-Mar-2026 01:18:16.135 general: info: addzone failed; reverting.

原因可以归纳为两点：NS 被当成相对名，以及 BIND 对 NS 的校验规则。
1. BIND 报错在说什么
BIND 要求：每个 NS 记录里写的那台“名字服务器”必须有 A 或 AAAA（glue），要么在本 zone，要么在父 zone。
你看到的错误是：
NS 'dns01-sit.sni-dev.sni.int.sap.hellotest.internal' has no address records (A or AAAA)
说明 BIND 认为本 zone 的 NS 是这两台：
dns01-sit.sni-dev.sni.int.sap.hellotest.internal
dns02-sit.sni-dev.sni.int.sap.hellotest.internal
而 zone 里没有对应的 A/AAAA，所以 zone 加载失败，于是 addzone failed; reverting。
2. 为什么 NS 会变成 xxx.hellotest.internal
关键在“有没有结尾的点”：
在 zone hellotest.internal 里，$ORIGIN 是 hellotest.internal.
如果 NS 写成 没有结尾点的名字，例如：
dns01-sit.sni-dev.sni.int.sap
BIND 会把它当作相对名，自动补上当前 zone 的 origin，变成：
dns01-sit.sni-dev.sni.int.sap.hellotest.internal
这就和你贴的报错里的名字一致了。
所以你看到的日志，说明实际加载的 zone 里，NS 很可能是相对名（没写 FQDN + 结尾点），而不是你 zone.tt 里那种带点的 FQDN。


```