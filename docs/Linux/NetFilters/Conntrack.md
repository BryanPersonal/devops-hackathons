#### 什么是conntrack (连接跟踪)
Conntrack（Connection Tracking，连接跟踪）是Linux内核网络栈（Netfilter框架）中的一项核心机制。它用于监控、记录和管理网络连接的状态，使内核能够识别属于同一个数据流（Flow）的所有数据包，而不仅仅是将它们视为独立的单个报
- 核心原理
    - 连接记录 (Connection Entry)： 当网络数据包经过Linux服务器时，conntrack会检查它并生成一条包含通信源地址、目的地址、协议类型（如TCP、UDP）、源端口和目的端口等四元组或五元组信息的连接记录。
    - 状态维护： 它维护一个连接跟踪表（Conntrack Table），用于存储这些活跃的连接记录。
    - 双向跟踪： Conntrack不只记录入站数据包，它也会记录对应的出站响应数据包，从而能够跟踪完整双向流量

| 协议   | conntrack 会记录什么         |
| ---- | ----------------------- |
| TCP  | SYN / ESTABLISHED / FIN |
| UDP  | “伪连接”（基于超时）             |
| ICMP | request / reply         |

Q: Why DNS shouldn't traverse conntrack?
A: DNS is high QPS traffic 
DNS 特点：
- UDP
- 短连接（甚至无连接）
- 请求量巨大 
Commands
```
conntrack -L 
nodesh-i577081-sn1--sit-pocdev-tmp-worker-ls4lq-z1-85f4f-prr89:/ # conntrack -L -p udp --dport 53

1. 有代表的一行数据分析
udp      17 1 src=10.180.82.116 dst=10.180.82.2 sport=56086 dport=53 packets=1 bytes=112 src=10.180.82.2 dst=10.180.82.116 sport=53 dport=56086 packets=1 bytes=196 mark=0 use=1

2. 定位这里的IP  10.180.82.116 是Node地址
如何定位10.180.82.2 ？ 先定位是否是node VM中的IP， 若不是通过MAC前缀来定位 
nodesh-i577081-sn1--sit-pocdev-tmp-worker-ls4lq-z1-85f4f-prr89:/ # ip neigh | grep 10.180.82.2 10.180.82.2 dev ens33 lladdr fa:16:3e:58:16:c9 REACHABLE

fa:16:3e:xx:xx:xx 这个前缀非常有代表性 这是：OpenStack Neutron（虚拟机网卡）的典型 MAC 前缀

3. 然后返现这是DHCP IP？？
29ad76a7-a972-446...		shoot--sn1--sit-pocdev-tmp	
10.180.82.2
shoot--sn1--sit-pocdev-tmp
network:dhcp
dhcpe36550aa-b95e...	ACTIVE
在 OpenStack 里，DHCP agent 通常同时提供 DNS 功能
Node 在问 DHCP/DNS（dnsmasq）
```


```
解读下一条基于LB member开放端口检索出的数据
udp      17 10 src=10.180.78.104 dst=10.180.82.116 sport=25693 dport=32202 packets=1 bytes=28 [UNREPLIED] src=100.64.0.21 dst=240.243.13.39 sport=53 dport=22537 packets=0 bytes=0 mark=0 use=1

# 这是一个LB
I577081 @ eu-de-2 > cis > sni-dev-k8s > openstack port list --device-owner network:f5selfip |grep 78.104
| 9944a4d3-27b3-45c2-9dd3-797f3b02c037 | local-eu-de-2-lb012a-04.cc.eu-de-2.cloud.sap-7f0c4958-2b9a-4601-8434-3918e0c1d718      | fa:16:3e:69:dc:bd | ip_address='10.180.78.104', subnet_id='7f0c4958-2b9a-4601-8434-3918e0c1d718' | ACTIVE |



I577081 @ eu-de-2 > cis > sni-dev-k8s > openstack port list --device-owner network:f5selfip | grep 7f0c4958-2b9a-4601-8434-3918e0c1d718
| 1c6ea9c3-aca6-4903-b352-aa484f9114e8 | local-eu-de-2-lb013b-02.cc.eu-de-2.cloud.sap-7f0c4958-2b9a-4601-8434-3918e0c1d718      | fa:16:3e:8a:ff:cc | ip_address='10.180.78.50', subnet_id='7f0c4958-2b9a-4601-8434-3918e0c1d718'  | ACTIVE |
| 37070666-d4f4-435b-a305-139635e3199d | local-eu-de-2-lb012a-03.cc.eu-de-2.cloud.sap-7f0c4958-2b9a-4601-8434-3918e0c1d718      | fa:16:3e:20:87:30 | ip_address='10.180.78.38', subnet_id='7f0c4958-2b9a-4601-8434-3918e0c1d718'  | ACTIVE |
| 9944a4d3-27b3-45c2-9dd3-797f3b02c037 | local-eu-de-2-lb012a-04.cc.eu-de-2.cloud.sap-7f0c4958-2b9a-4601-8434-3918e0c1d718      | fa:16:3e:69:dc:bd | ip_address='10.180.78.104', subnet_id='7f0c4958-2b9a-4601-8434-3918e0c1d718' | ACTIVE |
| b5b70167-4bfb-4ea2-9eae-796b41351daf | local-eu-de-2-lb012b-04.cc.eu-de-2.cloud.sap-7f0c4958-2b9a-4601-8434-3918e0c1d718      | fa:16:3e:a0:13:48 | ip_address='10.180.78.248', subnet_id='7f0c4958-2b9a-4601-8434-3918e0c1d718' | ACTIVE |
| d98b4476-0dc3-4192-9faa-e596c2cf2752 | local-eu-de-2-lb013a-02.cc.eu-de-2.cloud.sap-7f0c4958-2b9a-4601-8434-3918e0c1d718      | fa:16:3e:f8:58:24 | ip_address='10.180.78.109', subnet_id='7f0c4958-2b9a-4601-8434-3918e0c1d718' | ACTIVE |
| ee89c8dc-8cbe-4e7a-99cf-8cbd4532fdad | local-eu-de-2-lb012b-03.cc.eu-de-2.cloud.sap-7f0c4958-2b9a-4601-8434-3918e0c1d718      | fa:16:3e:23:ea:ea | ip_address='10.180.78.163', subnet_id='7f0c4958-2b9a-4601-8434-3918e0c1d718' | ACTIVE |

结论 在openstack/SCI GUI 定位不了某个Loadbalancer对应的F5设备的port selfip。 在node上去捕捉对应lb member 开放的端口可以看到

OpenStack (Octavia)
  只管理：
    - VIP
    - listener
    - pool

但不记录：
    - VIP 实际落在哪个 F5 device


结论： 每个LB在不指定AZ的情况下会有两个F5 port IP （self ip） 
- local-eu-de-2-lb012a-04.cc.eu-de-2.cloud.sap-<UUID>
- local-eu-de-2-lb012b-04.cc.eu-de-2.cloud.sap-<UUID>

对应 LB 的所有Pool中 会根据AZ/F5 设备Port IP上来决定指向node的端口，同一个zone/F5下的端口一样。比如有三个Pool，两个F5 device IP，则会有两种node的端口，例如 32202和30248 （30000-33000 FIXME？）
- 端口53 和 端口9119， 端口53  

```

Q: conntrack 有实际作用吗？
A: 有，且十分重要 

👉 没有 conntrack = 纯无状态（stateless）网络
意味着：
- 每个包独立处理
- 系统不知道“这是请求还是响应”
- NAT 无法工作

Q: iptables 配置mark有什么作用
A: iptables 里的 **mark（包标记）**是一个非常“底层但威力很大”的机制，本质上就是： 
> 给数据包打一个“标签（整数）”，让后续网络处理逻辑根据这个标签做不同决策
它本身不改变数据包内容，也不直接决定放行/拒绝，而是：
👉 给后续模块提供“条件依据”


Key to the success!~~!!!!
```
NODE_IP="10.180.82.116"
NODEPORT=32202
LB_IP="100.114.88.133"  ip route get LB_IP (LB Ingress IP)
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

现在你可以看到请求源IP为LB IP了！！

```

You must enable dsr from LB ?? Difference between cilium and calico ??
```
  networking:
    type: cilium
    providerConfig:
      loadBalancingMode: dsr
      apiVersion: cilium.networking.extensions.gardener.cloud/v1alpha1
      hubble:
        enabled: true
      kind: NetworkConfig
      overlay:
        enabled: false
      tunnel: geneve
    pods: 100.64.0.0/12
    nodes: 10.180.82.0/24
    services: 100.104.0.0/13
    ipFamilies:
      - IPv4
```