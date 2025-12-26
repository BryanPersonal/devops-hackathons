
- Vmware can setup HA to fail over VM from one hypervisor to another, with KVM and Openstack it simply reboot/re-create the VM. 

- Harvester / OpenShift Virtualization 
https://harvesterhci.io/ 

Non-Uniform Memory Access (NUMA) - Hana need one more NUMA node. E.g 256 Core CPU needs more NUMA 

`virsh node info` to see how much Numa  `numbactl --show`

What is type1 and type2 hypervisor ? 


`virsh vcpupin`：将虚拟 CPU（vCPU）绑定到物理 CPU（pCPU）

KSM will deduplicate the memory pages ???  KSM will save lots of memory  ?  KSM intelligently ? 
Any enterprise Kernel is usually compitable with KSM.  

`ls -l /sys/kernel/mm/ksm/*`
turn KSM on from SLES: `echo 1 > /sys/kernel/mm/ksm/run`

`cat /proc/sys/kernel/numa_balancing` 

`vhost` VS `virtio`



Conclusions:
1. Steal Time (%st) 是衡量云服务器或虚拟机“邻居噪音”的重要指标。如果这个值长期超过 10%，说明物理服务器已经严重超卖（Overcommitted）或者有其他虚拟机在疯狂抢占资源，你的应用性能会因此大幅下降
2. 

```
localhost:/home/tux # systemd-detect-virt
kvm


virt-install --import --name slesmigrate --vcpus 4 --ram 4096 --disk path=/var/lib/libvirt/images/nfs/slesimage.qcow2,format=qcow2 --os-variant sles16 --network network=migratenetwork --autoconsole none
```