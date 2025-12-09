

####Linux Bridging Network. (在 Kubernetes 中一般不推荐直接使用 CNI 插件配置为 bridge network（桥接网络）模式用于生产环境的 Pod 网络)

Concept: A Linux bridge is a kernel module that behaves like a network switch, forwarding packets between interfaces that are connected to it. It's usually used for forwarding packets on routers, on gateways, or between VMs and network namespaces on a host.
https://developers.redhat.com/articles/2022/04/06/introduction-linux-bridging-commands-and-features#vlan_filter  
Use case: Docker Bridge Network

__Epic 1: Pod2Pod Communication__ 


- Create bridge network in each node and setting them up
    - `ip link add v-net-0 type bridge`   # to each node  10.244.1.0|1|2/24 (In same LAN)
    - `ip link set dev v-net-0 up`  # to each node
- Create veth pair and attach to veth pair
    - `ip link add ...`
    - `ip link set ...`
- Assign IP Address
    - `ip -n <namespace> addr add ...`
    - `ip -n <namespace> route add ...`