### Concepts:
1. KSM（Kernel Samepage Merging，内核同页合并） 是 Linux 内核提供的一项内存去重（Deduplication）技术，专为虚拟化环境（如 KVM）优化设计，用于节省物理内存。
✅ 一句话定义：
> KSM 会扫描不同进程（尤其是多个 VM 的 QEMU 进程）的内存页，自动合并内容完全相同的匿名内存页（如零页、相同代码段、相同数据），只保留一份物理副本，其余页改为只读映射——从而减少整体物理内存占用。

2. Memory Ballooning 是虚拟化环境中一种动态内存回收技术，允许宿主机（Host）在内存紧张时，从虚拟机（Guest）中安全、按需地回收未使用的内存，从而实现内存超分（over-commitment）并提高资源利用率。 它在 KVM（Kernel-based Virtual Machine） 中通过 `virtio-balloon` 半虚拟化设备 实现，是 KVM 内存管理的核心机制之一。

🌟 一句话记住：
> Memory Ballooning = 宿主机对 VM 说：“你不用的内存，先借我用用，急用时还你”——而 VM 体内的“气球驱动”负责执行这个借贷操作。

| 技术 | 原理 | 速度 | 安全性 | 适用场景 |
|------|------|------|--------|----------|
| Ballooning | Guest 主动释放空闲内存 | ⚡ 快（ms 级） | ✅ 高（需 Guest 配合） | 通用首选，动态调整 |
| KSM | 合并相同内存页 | 🐢 慢（秒~分钟级） | ✅ 中（CPU 开销） | 同构 VM 密集部署 |
| Swap | 换出冷内存到磁盘 | 🐌 慢（I/O 瓶颈） | ❌ 低（可能导致卡死） | 最后手段，应急用 |


QEMU fisrt virtualization - Not real but emulation 

KVM 的 控制平面 和 部分数据平面 依赖 Host Linux 内核的服务与抽象，而非 Guest 与 Host 共用同一个内核实例。

KVM as a kernel module provide CPU and Mem ONLY therefore QEMU comes into the place. 

#### VM ↔ Host 共享内核 → 依赖 seccomp / SELinux / namespaces / cgroups 隔离  如何理解 
 
> KVM Guest 与 Host 在 CPU/内存执行层面 由硬件隔离；但在 管理、I/O、存储 等辅助功能上，必须通过 Linux 内核提供的「进程级隔离机制」
>（namespaces + cgroups + seccomp + MAC）来保护 Host 不被 QEMU 或恶意设备后端攻陷。
>
🔑 核心结论：
>
>  Guest VM 与 Host 在 运行时 是硬件隔离的，但 管理面（QEMU）和 服务面（vhost、filesystem backend）运行在 Host 内核上下文中——这些就是攻击面（attack surface）。因此必须对 QEMU 进程及其依赖的内核路径 做纵深防御。
> 
四大 Linux 机制如何精准封堵这些风险？

1. namespaces → 隔离「视角」 

| namespace | 作用 | 在KVM 中的应用 |
|-----------|---------|--------------|
| pid | 进程ID隔离 | QEMU 可在独立 PID ns 中运行 →`ps` 看不到 host 进程 |
| net | 网络栈隔离 | VM 流量经 `veth` + `bridge`，与 host 网络逻辑分离（类似 Pod 网络）|
| mnt | 挂载点隔离 | 限制 QEMU 只能访问 `/var/lib/libvirt/images`，防任意文件读写 |
| user | UID/GID Mapping | QEMU 以非 root 用户运行，即使逃逸也只能获得低权 host 用户 |
> ✅ 你在用 systemd 管理服务时，PrivateNetwork=yes、ProtectSystem=strict 等指令，就是在启用这些 namespaces。
2. cgroups → 限制「资源」

| 子系统 | 防御目标 |
|-----------|---------|
| `cpu`/`cpuset` | 防止恶意 VM 占满 CPU（如 cryptojacking）   |
| `memory` | 防止 balloon 膨胀或内存泄漏拖垮 host（`MemoryMax=2G`）|
| `blkio` | 限制磁盘 I/O 带宽，避免 VM 打满 SSD 导致 host 卡顿 |
| `pids` | 限制 QEMU 能 fork 的进程数，防 fork bomb |
> ✅ 这与你在 Kubernetes 中设置 resources.limits.cpu: "500m" 同源——K8s 底层就是靠 cgroups 实现。

3. seccomp-bpf → 限制「系统调用」
4. SELinux / AppArmor → 强制访问控制（MAC）

Backgrounds: after broadcom purchased VMware, they raised 3 time of it's oringinal price therefore Customer have to switch to KVM. 


How Does KVM work with memory balloning ? 
Answer: Memory Ballooning（内存气球） 并不是 VMware 专有的技术，而是一种通用的虚拟化内存回收机制，最早由 VMware 提出并广泛应用，但后续被其他主流虚拟化平台（如 KVM/QEMU、Xen、Hyper-V）

File where define VM metadata: `/etc/libvirt/qemu/SLE301v15-server2.xml`

Component: libvirt, QEMU and KVM

KVM 的优势:
 - ✅ 高性能：CPU/内存直通硬件虚拟化，I/O 可通过 virtio + vhost 在内核态处理，避免用户态上下文切换。
 - ✅ 轻量集成：复用 Linux 成熟的调度器、内存管理、安全模型（SELinux/AppArmor）、热插拔、迁移等。
 - ✅ 生态丰富：被 libvirt / OpenStack / Kubernetes (KubeVirt) 深度集成。


`virsh` Interact with `libvirst` so we don't need to execute lengthy command. 
```
/usr/bin/qemu-kvm -name guest=SLE301v15-server1,debug-threads=on -S -object {"qom-type":"secret","id":"masterKey0","format":"raw","file":"/var/lib/libvirt/qemu/domain-1-SLE301v15-server1/master-key.aes"} -machine pc-i440fx-2.3,usb=off,vmport=off,dump-guest-core=off,memory-backend=pc.ram,hpet=off,acpi=on -accel kvm -cpu qemu64 -m size=4194304k -object {"qom-type":"memory-backend-ram","id":"pc.ram","size":4294967296} -overcommit mem-lock=off -smp 4,sockets=4,cores=1,threads=1 -uuid 5b54c8b6-f0bb-4ee7-8d57-92a0c9c3f4a8 -no-user-config -nodefaults -chardev socket,id=charmonitor,fd=30,server=on,wait=off -mon chardev=charmonitor,id=monitor,mode=control -rtc base=utc,driftfix=slew -global kvm-pit.lost_tick_policy=delay -no-down -global PIIX4_PM.disable_s3=1 -global PIIX4_PM.disable_s4=1 -boot strict=on -device {"driver":"ich9-usb-ehci1","id":"usb","bus":"pci.0","addr":"0x6.0x7"} -device {"driver":"ich9-usb-uhci1","masterbus":"usb.0","firstport":0,"bus":"pci.0","multifunction":true,"addr":"0x6"} -device {"driver":"ich9-usb-uhci2","masterbus":"usb.0","firstport":2,"bus":"pci.0","addr":"0x6.0x1"} -device {"driver":"ich9-usb-uhci3","masterbus":"usb.0","firstport":4,"bus":"pci.0","addr":"0x6.0x2"} -device {"driver":"lsi","id":"scsi0","bus":"pci.0","addr":"0xf"} -device {"driver":"virtio-serial-pci","id":"virtio-serial0","bus":"pci.0","addr":"0x5"} -blockdev {"driver":"file","filename":"/home/VMs/SLE301v15/SLE301v15-server1/SLE301v15-server1.qcow2","node-name":"libvirt-7-storage","auto-read-only":true,"discard":"unmap"} -blockdev {"node-name":"libvirt-7-format","read-only":false,"driver":"qcow2","file":"libvirt-7-storage","backing":null} -device {"driver":"virtio-blk-pci","bus":"pci.0","addr":"0x7","drive":"libvirt-7-format","id":"virtio-disk0","bootindex":1} -blockdev {"driver":"file","filename":"/home/VMs/SLE301v15/SLE301v15-server1/SLE301v15-server1-2.qcow2","node-name":"libvirt-6-storage","auto-read-only":true,"discard":"unmap"} -blockdev {"node-name":"libvirt-6-format","read-only":false,"driver":"qcow2","file":"libvirt-6-storage","backing":null} -device {"driver":"virtio-blk-pci","bus":"pci.0","addr":"0xa","drive":"libvirt-6-format","id":"virtio-disk1"} -blockdev {"driver":"file","filename":"/home/VMs/SLE301v15/SLE301v15-server1/SLE301v15-server1-3.qcow2","node-name":"libvirt-5-storage","auto-read-only":true,"discard":"unmap"} -blockdev {"node-name":"libvirt-5-format","read-only":false,"driver":"qcow2","file":"libvirt-5-storage","backing":null} -device {"driver":"virtio-blk-pci","bus":"pci.0","addr":"0xb","drive":"libvirt-5-format","id":"virtio-disk2"} -blockdev {"driver":"file","filename":"/home/VMs/SLE301v15/SLE301v15-server1/SLE301v15-server1-4.qcow2","node-name":"libvirt-4-storage","auto-read-only":true,"discard":"unmap"} -blockdev {"node-name":"libvirt-4-format","read-only":false,"driver":"qcow2","file":"libvirt-4-storage","backing":null} -device {"driver":"virtio-blk-pci","bus":"pci.0","addr":"0xe","drive":"libvirt-4-format","id":"virtio-disk3"} -device {"driver":"ide-cd","bus":"ide.0","unit":0,"id":"ide0-0-0"} -blockdev {"driver":"file","filename":"/home/iso/SLE301v15/SLE-15-Packages-DVD-x86_64-GMC-DVD1.iso","node-name":"libvirt-2-storage","auto-read-only":true,"discard":"unmap"} -blockdev {"node-name":"libvirt-2-format","read-only":true,"driver":"raw","file":"libvirt-2-storage"} -device {"driver":"ide-cd","bus":"ide.0","unit":1,"drive":"libvirt-2-format","id":"ide0-0-1"} -blockdev {"driver":"file","filename":"/home/iso/SLE301v15/SLE-15-Installer-DVD-x86_64-GMC-DVD1.iso","node-name":"libvirt-1-storage","auto-read-only":true,"discard":"unmap"} -blockdev {"node-name":"libvirt-1-format","read-only":true,"driver":"raw","file":"libvirt-1-storage"} -device {"driver":"scsi-cd","bus":"scsi0.0","scsi-id":0,"device_id":"drive-scsi0-0-0","drive":"libvirt-1-format","id":"scsi0-0-0"} -netdev {"type":"tap","fd":"31","vhost":true,"vhostfd":"33","id":"hostnet0"} -device {"driver":"virtio-net-pci","netdev":"hostnet0","id":"net0","mac":"52:54:00:07:e8:e8","bus":"pci.0","addr":"0x3"} -netdev {"type":"tap","fd":"34","vhost":true,"vhostfd":"35","id":"hostnet1"} -device {"driver":"virtio-net-pci","netdev":"hostnet1","id":"net1","mac":"52:54:00:35:3e:13","bus":"pci.0","addr":"0xc"} -netdev {"type":"tap","fd":"36","vhost":true,"vhostfd":"37","id":"hostnet2"} -device {"driver":"virtio-net-pci","netdev":"hostnet2","id":"net2","mac":"52:54:00:c6:2c:20","bus":"pci.0","addr":"0xd"} -chardev pty,id=charserial0 -device {"driver":"isa-serial","chardev":"charserial0","id":"serial0","index":0} -chardev socket,id=charchannel0,fd=29,server=on,wait=off -device {"driver":"virtserialport","bus":"virtio-serial0.0","nr":1,"chardev":"charchannel0","id":"channel0","name":"org.qemu.guest_agent.0"} -chardev spicevmc,id=charchannel1,name=vdagent -device {"driver":"virtserialport","bus":"virtio-serial0.0","nr":2,"chardev":"charchannel1","id":"channel1","name":"com.redhat.spice.0"} -device {"driver":"usb-tablet","id":"input0","bus":"usb.0","port":"1"} -audiodev {"id":"audio1","driver":"spice"} -spice port=5900,addr=127.0.0.1,disable-ticketing=on,image-compression=off,seamless-migration=on -device {"driver":"qxl-vga","id":"video0","max_outputs":1,"ram_size":67108864,"vram_size":67108864,"vram64_size_mb":0,"vgamem_mb":16,"bus":"pci.0","addr":"0x2"} -device {"driver":"intel-hda","id":"sound0","bus":"pci.0","addr":"0x4"} -device {"driver":"hda-duplex","id":"sound0-codec0","bus":"sound0.0","cad":0,"audiodev":"audio1"} -chardev spicevmc,id=charredir0,name=usbredir -device {"driver":"usb-redir","chardev":"charredir0","id":"redir0","bus":"usb.0","port":"2"} -chardev spicevmc,id=charredir1,name=usbredir -device {"driver":"usb-redir","chardev":"charredir1","id":"redir1","bus":"usb.0","port":"3"} -device {"driver":"virtio-balloon-pci","id":"balloon0","bus":"pci.0","addr":"0x8"} -object {"qom-type":"rng-random","id":"objrng0","filename":"/dev/random"} -device {"driver":"virtio-rng-pci","rng":"objrng0","id":"rng0","bus":"pci.0","addr":"0x9"} -sandbox on,obsolete=deny,elevateprivileges=deny,spawn=deny,resourcecontrol=deny -msg timestamp=on


very unhandy and uncomfortable!

```

```
(introscope) cc02v013520:~ #
# lsmod | grep -E 'balloon|vmmemctl'
vmw_balloon            28672  0
vmw_vmci              114688  2 vmw_balloon,vmw_vsock_vmci_transport

# check if CPU flags are available for KVM:
egrep '(vmx|svm)' /proc/cpuinfo

```


| 虚拟化平台 | 技术名称 | 实现方式/驱动 | 说明/备注 |
|-----------|---------|--------------|----------|
| VMware ESXi | Memory Ballooning | vmmemctl（VMware Tools / Open VM Tools） | 最早实现，成熟稳定 |
| KVM/QEMU | Ballooning | virtio-balloon（virtio 驱动） | 需 Guest 加载 virtio_balloon 模块 |

CPU Overcommitment
| 比例 | 适用场景 | 风险提示
|-----------|---------|--------------|
| 1:1 (禁止超分) | 数据库/Java 应用, 内存敏感型（Redis, SAP） | 零争抢，性能可预测 |
| 2:1 ~ 3:1 | 通用 Web/App | 少量 steal time，可接受 |
| 3:1 ~ 4:1 | 通用云服务器（如 Web/App）| 偶发延迟抖动；需监控 steal |

📌 公式建议：
> 总 vRAM ≤ 物理 RAM × 1.1 + Swap × 0.5 （留 10% buffer + swap 作为应急垫）
>
> 分配给所有虚拟机（VMs）的 vCPU 总数 : 宿主机物理 CPU 核心总数 = 3 : 1



Scenario: monitoring the CPU %steal usage. 

Memory Overcommitment - To design the pre-condition on how the overcommitment will react.

Memory Ballooning 
Setup Swap space and monitor the usage of it.
#### 宿主机（Host）层面：Linux + KVM 如何使用 swap？
> Linux 默认行为：渐进式、部分换出
> 
> 当物理内存（RAM）使用率升高，达到一定水位（由 vm.swappiness 控制），内核的 kswapd 后台线程开始回收内存：
>> 优先回收未修改的 page cache（如文件缓存）→ 无需写磁盘
>>
>> 其次换出长时间未访问的匿名页（anonymous pages） → 写入 swap

