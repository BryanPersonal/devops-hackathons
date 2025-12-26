
#### Libvirt Network 

Open vSwitch: advanced solution 

SDN Controller 

VLAN
VXLAN

KVM Switches 

VM connects to the hypervisor Bridge. Open vSwitch connects to the Bridge. 
Extend your existing setup to openvswitch (For big environment like hunderds of hypervisors with thousands of VMs) - ONLY Introduce when it is required
https://doc.opensuse.org/documentation/leap/reference/html/book-reference/cha-network.html#sec-network-openvswitch-libvirt

> 在 Linux 中，网络接口的类型非常多样，可以分为 物理接口 和 虚拟接口 两大类。

| 类别 | 类型/功能 | 英文名称 | OSI 模型层级 | 主要用途 |
|------|---------|---------|------------|---------|
| 物理接口 | 以太网接口 | ethX, enpXsY | L1/L2 | 连接物理网线，提供外部网络接入。 |
| 虚拟接口 | 网桥 | bridge (e.g., br0) | L2 | 实现虚拟交换机功能，连接多个虚拟设备（如 VM/容器）和/或物理设备。 |
| 虚拟接口 | 虚拟以太网对 | veth (Virtual Ethernet Pair) | L2 | 一对相互连接的虚拟网卡，常用于连接两个独立的网络命名空间（如 Docker 容器）。 |
| 虚拟接口 | TUN/TAP | tun / tap | L3/L2 | 用于创建隧道或虚拟网络适配器，常用于 VPN 或 KVM 虚拟机。 |
| 虚拟接口 | MacVLAN/IPVLAN | macvlan/ipvlan | L2/L3 | 允许在单个父接口上创建多个虚拟接口，每个都有独立的 MAC/IP 地址，性能高，常用于容器网络。 |
| 虚拟接口 | 环回接口 | loopback (lo) | L3 | 仅用于本机通信（127.0.0.1）。 |
| 网络功能 | 网络地址转换 | NAT | L3 | 不是接口类型，而是通过 iptables / nftables 的 Masquerade（伪装）规则实现，将私有 IP 地址转换为公有 IP 地址，用于共享主机网络。 |
| 网络功能 | VLAN | vlan | L2 | 虚拟局域网，用于在单个物理接口上划分多个逻辑隔离的网络。 |


- Linux Bridge (网桥)
    - 概念： Linux Bridge（Linux 网桥）在功能上等同于一个二层（L2）网络交换机。 
    - 工作原理：
        - 它可以接入多个网络设备（无论是物理网卡 eth0、还是虚拟网卡 veth 或 tap）。
        - 它学习连接在其上的设备的 MAC 地址，并维护一个 FDB（转发数据库）。
        - 当收到数据帧时，它会根据目标 MAC 地址将数据帧精确地转发到对应的接口，实现设备间的局域网通信。
    - 应用：这是 KVM、lxc 等虚拟化环境中最常用的网络模型，用于让虚拟机或容器像连接在同一个物理交换机上一样进行通信
- Open vSwitch (OVS)
    - 除了原生的 Linux Bridge，在复杂的云计算和 SDN（软件定义网络）环境中，还会使用 Open vSwitch (OVS)。OVS 也是一个功能更强大、支持更多高级交换机协议（如 OpenFlow）的虚拟交换机实现。
Istio Service Mesh

#### Libvirt Storage

Image file to store the vm
BlockDevice to
Hard disk 
An

Per Speed - Blockdevice 
Handling - Image file (popular) easier , snapshot store in the image file, called volume
Storage backend - NetApp  NAS storage like NFS 

Storage Pools 

Term: emulated
UEFI / BIOS


- Emulated graphical card: Virtio is a paravirtual 3D virtual graphics card, used for 3D acceleration for QEMU guestOSes. 
    - 3D acceleration
- QLX is for windows Guest
- Remote display protocol:
    - KVM: VNC or SPICE
    - Chrome Remote Desktop
    - ...

Reference:
https://libvirt.org/drvqemu.html