https://jira.tools.sap/browse/CIEA-20583
https://github.tools.sap/cia-docker-images/sci-lbtools
https://github.tools.sap/cia-docker-images/k8s-cust-node/
https://my.f5.com/manage/s/article/K13433
https://jira.tools.sap/browse/CIEA-16916



Use F5 feature + iptables to forward the nodeid:port from Pod back to F5 device
```
阶段        表/链                    动作
─────────────────────────────────────────────────────────────
请求入      raw/PREROUTING           NOTRACK (跳过 conntrack)
    ↓
DNAT        nat/PREROUTING           K8s kube-proxy 做的 NodePort DNAT
    ↓
Pod 处理    Pod 内部                 DNS 服务生成响应
    ↓
响应出      mangle/PREROUTING        打 fwmark 0x1
    ↓
路由决策    ip rule                  fwmark 0x1 → lookup table 100
    ↓
SNAT伪装    nat/POSTROUTING          源地址改为 NodeIP:NodePort
    ↓
F5 收到     ──→  源IP端口匹配，conntrack 开心
```


```
NODE_IP="10.180.82.116"
NODEPORT=32202
LB_IP="10.180.78.31"
IFACE="ens33"

# 1) raw: DNS 请求去 pod 网段不走 conntrack
iptables -t raw -A PREROUTING \
  -p udp -d 100.64.0.0/12 --dport 53 \
  -j NOTRACK -m comment --comment S4_DNSVIEW_CC
# 2) mangle: DNS 响应打 mark=1，后续走 table 100
iptables -t mangle -A PREROUTING \
  -p udp -s 100.64.0.0/12 --sport 53 ! -d 100.64.0.0/12 \
  -j MARK --set-mark 1 -m comment --comment S4_DNSVIEW_CC
# 3) nat: DNS 响应做 SNAT 到 NodeIP:NodePort
iptables -t nat -A POSTROUTING \
  -p udp -s 100.64.0.0/12 --sport 53 ! -d 100.64.0.0/12 \
  -j SNAT --to-source ${NODE_IP}:${NODEPORT} \
  -m comment --comment S4_DNSVIEW_CC
# 4) 策略路由：mark=1 的包查表100
ip rule add fwmark 0x1 lookup 100
# 5) 表100默认路由指向 LB/VIP（或你环境指定网关）
ip route replace default via ${LB_IP} dev ${IFACE} table 100

iptables -t raw -L PREROUTING -n -v | rg S4_DNSVIEW_CC
iptables -t mangle -L PREROUTING -n -v | rg S4_DNSVIEW_CC
iptables -t nat -L POSTROUTING -n -v | rg S4_DNSVIEW_CC
ip rule list | rg "fwmark 0x1"
ip route show table 100

# Regarding changes from openstack
openstack loadbalancer listener set --tag ccloud_special_l4_deactivate_snat <LISTENER_ID>
openstack loadbalancer listener unset --tag ccloud_special_l4_deactivate_snat <LISTENER_ID>

networking:
    type: cilium
    providerConfig:
      loadBalancingMode: dsr
      apiVersion: cilium.networking.extensions.gardener.cloud/v1alpha1
      hubble:
        enabled: true
      kind: NetworkConfig
      overlay:
        enabled: true
      tunnel: geneve
    pods: 100.64.0.0/12
    nodes: 10.184.182.32/27
    services: 100.104.0.0/13
    ipFamilies:
      - IPv4

回滚

sudo iptables -t raw -D PREROUTING -p udp -d 100.64.0.0/12 --dport 53 -j NOTRACK -m comment --comment S4_DNSVIEW_CC
sudo iptables -t mangle -D PREROUTING -p udp -s 100.64.0.0/12 --sport 53 ! -d 100.64.0.0/12 -j MARK --set-mark 1 -m comment --comment S4_DNSVIEW_CC
sudo iptables -t nat -D POSTROUTING -p udp -s 100.64.0.0/12 --sport 53 ! -d 100.64.0.0/12 -j SNAT --to-source ${NODE_IP}:${NODEPORT} -m comment --comment S4_DNSVIEW_CC
sudo ip rule del fwmark 0x1 lookup 100
sudo ip route flush table 100

```