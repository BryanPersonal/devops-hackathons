
# GCID KVM

## Organisation

For Emergencies Trainer
- Whatsapp +639274336737
- wurfbaum@b1-systems.de

- obsolete, replaced by teams: https://meet.google.com/eat-gmea-tdu
- Linus explains things: https://www.youtube.com/watch?v=5IfHm6R5le0

## Training material

https://share.b1-systems.de/index.php/s/ss1j6zIkLgSk3c5


## Training participants
nagadeesh.nagaraja@sap.com
vlad.koychev@sap.com
adam.karath@sap.com
nina.guo01@sap.com
furong.lei@sap.com
emma.wang04@sap.com
eisen.wang@sap.com [suresh.ramasamy@sap.com]
bryan.chen01@sap.com
boyu.yang01@sap.com
konstantin.koslowski@sap.com


## Access the labs:

training_url=201918.training.b1-systems.de
(best browser is Chrome)

- [user0] Tom (Trainer)
    guacamole_password=o3TR5p6Atw
    hypervisor-0=100.80.3.85
- [user1] Adam K.
    guacamole_password=Sp8p5PXiVc
    hypervisor-1=100.80.3.66
- [user2] Furong
    guacamole_password=x5WyqStlYz
    hypervisor-2=100.80.1.39
- [user3] Nagadeesh 
    guacamole_password=cN5YPISvlt
    hypervisor-3=100.80.0.78
- [user4] suresh 
    guacamole_password=1UbcibpKWt
    hypervisor-4=100.80.2.240
- [user5] Emma
    guacamole_password=b2YiLrSCGR
    hypervisor-5=100.80.0.248
- [user6] Boyu
    guacamole_password=1Prtxctfsz
    hypervisor-6=100.80.1.78
- [user7] - Nina 
    guacamole_password=w0WZhPRHJZ
    hypervisor-7=100.80.3.76
- [user8] - Bryan
    guacamole_password=s6Suv3gih3
    hypervisor-8=100.80.3.19
- [user9 - Vlad]
    guacamole_password=bCLe3d85Ud
    hypervisor-9=100.80.1.166
- [user10] Konstantin
    guacamole_password=Gb1CQGXfeq
    hypervisor-10=100.80.1.20

Hypervisor root password 
- `b1s`

Connect from local SSH client like putty:
```
ssh userX@201918.training.b1-systems.de
```

key-combo for opening guacamole submenu for copy-paste
- `Crtl-Alt-Shift`

To change language on the CLI use (must be done at each login)
or append to `~/.bashrc` or `~/.profile`
```
export LANG=en_US.UTF-8
```

QEMU Command to start VM

```
/usr/bin/qemu-kvm -name guest=SLE301v15-server1,debug-threads=on -S -object {"qom-type":"secret","id":"masterKey0","format":"raw","file":"/var/lib/libvirt/qemu/domain-1-SLE301v15-server1/master-key.aes"} -machine pc-i440fx-2.3,usb=off,vmport=off,dump-guest-core=off,memory-backend=pc.ram,hpet=off,acpi=on -accel kvm -cpu qemu64 -m size=4194304k -object {"qom-type":"memory-backend-ram","id":"pc.ram","size":4294967296} -overcommit mem-lock=off -smp 4,sockets=4,cores=1,threads=1 -uuid 5b54c8b6-f0bb-4ee7-8d57-92a0c9c3f4a8 -no-user-config -nodefaults -chardev socket,id=charmonitor,fd=30,server=on,wait=off -mon chardev=charmonitor,id=monitor,mode=control -rtc base=utc,driftfix=slew -global kvm-pit.lost_tick_policy=delay -no-down -global PIIX4_PM.disable_s3=1 -global PIIX4_PM.disable_s4=1 -boot strict=on -device {"driver":"ich9-usb-ehci1","id":"usb","bus":"pci.0","addr":"0x6.0x7"} -device {"driver":"ich9-usb-uhci1","masterbus":"usb.0","firstport":0,"bus":"pci.0","multifunction":true,"addr":"0x6"} -device {"driver":"ich9-usb-uhci2","masterbus":"usb.0","firstport":2,"bus":"pci.0","addr":"0x6.0x1"} -device {"driver":"ich9-usb-uhci3","masterbus":"usb.0","firstport":4,"bus":"pci.0","addr":"0x6.0x2"} -device {"driver":"lsi","id":"scsi0","bus":"pci.0","addr":"0xf"} -device {"driver":"virtio-serial-pci","id":"virtio-serial0","bus":"pci.0","addr":"0x5"} -blockdev {"driver":"file","filename":"/home/VMs/SLE301v15/SLE301v15-server1/SLE301v15-server1.qcow2","node-name":"libvirt-7-storage","auto-read-only":true,"discard":"unmap"} -blockdev {"node-name":"libvirt-7-format","read-only":false,"driver":"qcow2","file":"libvirt-7-storage","backing":null} -device {"driver":"virtio-blk-pci","bus":"pci.0","addr":"0x7","drive":"libvirt-7-format","id":"virtio-disk0","bootindex":1} -blockdev {"driver":"file","filename":"/home/VMs/SLE301v15/SLE301v15-server1/SLE301v15-server1-2.qcow2","node-name":"libvirt-6-storage","auto-read-only":true,"discard":"unmap"} -blockdev {"node-name":"libvirt-6-format","read-only":false,"driver":"qcow2","file":"libvirt-6-storage","backing":null} -device {"driver":"virtio-blk-pci","bus":"pci.0","addr":"0xa","drive":"libvirt-6-format","id":"virtio-disk1"} -blockdev {"driver":"file","filename":"/home/VMs/SLE301v15/SLE301v15-server1/SLE301v15-server1-3.qcow2","node-name":"libvirt-5-storage","auto-read-only":true,"discard":"unmap"} -blockdev {"node-name":"libvirt-5-format","read-only":false,"driver":"qcow2","file":"libvirt-5-storage","backing":null} -device {"driver":"virtio-blk-pci","bus":"pci.0","addr":"0xb","drive":"libvirt-5-format","id":"virtio-disk2"} -blockdev {"driver":"file","filename":"/home/VMs/SLE301v15/SLE301v15-server1/SLE301v15-server1-4.qcow2","node-name":"libvirt-4-storage","auto-read-only":true,"discard":"unmap"} -blockdev {"node-name":"libvirt-4-format","read-only":false,"driver":"qcow2","file":"libvirt-4-storage","backing":null} -device {"driver":"virtio-blk-pci","bus":"pci.0","addr":"0xe","drive":"libvirt-4-format","id":"virtio-disk3"} -device {"driver":"ide-cd","bus":"ide.0","unit":0,"id":"ide0-0-0"} -blockdev {"driver":"file","filename":"/home/iso/SLE301v15/SLE-15-Packages-DVD-x86_64-GMC-DVD1.iso","node-name":"libvirt-2-storage","auto-read-only":true,"discard":"unmap"} -blockdev {"node-name":"libvirt-2-format","read-only":true,"driver":"raw","file":"libvirt-2-storage"} -device {"driver":"ide-cd","bus":"ide.0","unit":1,"drive":"libvirt-2-format","id":"ide0-0-1"} -blockdev {"driver":"file","filename":"/home/iso/SLE301v15/SLE-15-Installer-DVD-x86_64-GMC-DVD1.iso","node-name":"libvirt-1-storage","auto-read-only":true,"discard":"unmap"} -blockdev {"node-name":"libvirt-1-format","read-only":true,"driver":"raw","file":"libvirt-1-storage"} -device {"driver":"scsi-cd","bus":"scsi0.0","scsi-id":0,"device_id":"drive-scsi0-0-0","drive":"libvirt-1-format","id":"scsi0-0-0"} -netdev {"type":"tap","fd":"31","vhost":true,"vhostfd":"33","id":"hostnet0"} -device {"driver":"virtio-net-pci","netdev":"hostnet0","id":"net0","mac":"52:54:00:07:e8:e8","bus":"pci.0","addr":"0x3"} -netdev {"type":"tap","fd":"34","vhost":true,"vhostfd":"35","id":"hostnet1"} -device {"driver":"virtio-net-pci","netdev":"hostnet1","id":"net1","mac":"52:54:00:35:3e:13","bus":"pci.0","addr":"0xc"} -netdev {"type":"tap","fd":"36","vhost":true,"vhostfd":"37","id":"hostnet2"} -device {"driver":"virtio-net-pci","netdev":"hostnet2","id":"net2","mac":"52:54:00:c6:2c:20","bus":"pci.0","addr":"0xd"} -chardev pty,id=charserial0 -device {"driver":"isa-serial","chardev":"charserial0","id":"serial0","index":0} -chardev socket,id=charchannel0,fd=29,server=on,wait=off -device {"driver":"virtserialport","bus":"virtio-serial0.0","nr":1,"chardev":"charchannel0","id":"channel0","name":"org.qemu.guest_agent.0"} -chardev spicevmc,id=charchannel1,name=vdagent -device {"driver":"virtserialport","bus":"virtio-serial0.0","nr":2,"chardev":"charchannel1","id":"channel1","name":"com.redhat.spice.0"} -device {"driver":"usb-tablet","id":"input0","bus":"usb.0","port":"1"} -audiodev {"id":"audio1","driver":"spice"} -spice port=5900,addr=127.0.0.1,disable-ticketing=on,image-compression=off,seamless-migration=on -device {"driver":"qxl-vga","id":"video0","max_outputs":1,"ram_size":67108864,"vram_size":67108864,"vram64_size_mb":0,"vgamem_mb":16,"bus":"pci.0","addr":"0x2"} -device {"driver":"intel-hda","id":"sound0","bus":"pci.0","addr":"0x4"} -device {"driver":"hda-duplex","id":"sound0-codec0","bus":"sound0.0","cad":0,"audiodev":"audio1"} -chardev spicevmc,id=charredir0,name=usbredir -device {"driver":"usb-redir","chardev":"charredir0","id":"redir0","bus":"usb.0","port":"2"} -chardev spicevmc,id=charredir1,name=usbredir -device {"driver":"usb-redir","chardev":"charredir1","id":"redir1","bus":"usb.0","port":"3"} -device {"driver":"virtio-balloon-pci","id":"balloon0","bus":"pci.0","addr":"0x8"} -object {"qom-type":"rng-random","id":"objrng0","filename":"/dev/random"} -device {"driver":"virtio-rng-pci","rng":"objrng0","id":"rng0","bus":"pci.0","addr":"0x9"} -sandbox on,obsolete=deny,elevateprivileges=deny,spawn=deny,resourcecontrol=deny -msg timestamp=on
```
very unhandy and uncomfortable!

libvirt should solve that problem
libvirt can be controlled in several ways:
- virsh
- Virt Manager
- OpenStack


check if CPU flags are available for KVM:
```
egrep '(vmx|svm)' /proc/cpuinfo
```

check if required applications are available
```
zypper se kvm
zypper se -t pattern kvm_server
zypper se qemu
qemu-8.2.8-150600.3.25.1.x86_64
zypper se libvirt
```
   
(zypper in -t pattern kvm_server)

Kernel Modules
```
hypervisor-0:~ # lsmod | grep kvm
kvm_intel             430080  0
kvm                  1339392  1 kvm_intel
irqbypass              12288  1 kvm
hypervisor-0:~ # modprobe -r kvm_intel
hypervisor-0:~ # lsmod | grep kvm
hypervisor-0:~ # modprobe -r kvm
hypervisor-0:~ # lsmod | grep kvm

hypervisor-0:~ # modprobe kvm_intel
hypervisor-0:~ # lsmod | grep kvm
kvm_intel             430080  0
kvm                  1339392  1 kvm_intel
irqbypass              12288  1 kvm

if module loading causes problews, check dmesg
dmesg | grep kvm

virt-host-validate
```


interact with libvirt api:
- virsh
- virt-manager (gui)
- Openstack and so on

check if libvirtd is running
```
systemctl status libvirtd
systemctl is-enabled libvirtd
```

Libvirts configuration store (only for localhost, no neighbor Hypervisors!):
`/etc/libvirt`
change there and look around, identify the files and directories

virsh is the command line tool to interact with libvirt

```
virsh --help

virsh list
virsh list --all
 Id   Name                State
------------------------------------
 -    SLE301v15-server1   shut off
 -    SLE301v15-server2   shut off

virsh start SLE301v15-server1
virsh list
 Id   Name                State
-----------------------------------
 1    SLE301v15-server1   running

virsh list --all
 Id   Name                State
------------------------------------
 1    SLE301v15-server1   running
 -    SLE301v15-server2   shut off

virsh shutdown VMName or VM ID 
virsh shutdown SLE301v15-server1

virsh list
 Id   Name   State
--------------------

virsh list --all
 Id   Name                State
------------------------------------
 -    SLE301v15-server1   shut off
 -    SLE301v15-server2   shut off

virsh start SLE301v15-server1
virsh list
 Id   Name                State
-----------------------------------
 1    SLE301v15-server1   running
 
virsh destroy 1
virsh list --all
 Id   Name                State
------------------------------------
 -    SLE301v15-server1   shut off
 -    SLE301v15-server2   shut off
```


connect to vm via ssh

```
virsh list 
 Id   Name                State
------------------------------------
 -    SLE301v15-server1   running
 
zypper install nmap
ip -br a
...
sle301v15-lan    UP             192.168.13.1/24
sle301v15-san1   UP             192.168.14.1/24
sle301v15-san2   UP             192.168.15.1/24

nmap -sn 192.168.13.0/24
Starting Nmap 7.94 ( https://nmap.org ) at 2025-12-15 13:51 UTC
Nmap scan report for 192.168.13.21
Host is up (0.00061s latency).
MAC Address: 52:54:00:07:E8:E8 (QEMU virtual NIC)
Nmap scan report for 192.168.13.1
Host is up.
Nmap done: 256 IP addresses (2 hosts up) scanned in 2.05 seconds

ssh -l tux 192.168.13.21
<enter password>
<profit>
```


GUI Login for VMs: 
```
tux linux
root linux
```

kill process
```
ps -ef | grep SLE301v15-server1
kill -9 PID
```

check logs
```
cd /var/log/libvirt/qemu
less VMLOGFILE
```

see all thread

```
ps -ef | grep SLE301v15-server1
ps -T -p <PID>
```
    

## Overcommitment
    
### Overcommitting virtualized CPUs

The KVM hypervisor supports overcommitting virtualized CPUs. Virtualized CPUs can be overcommitted as far as load limits of virtualized guests allow. Use caution when overcommitting VCPUs as loads near 100% may cause dropped requests or unusable response times.
Virtualized CPUs are overcommitted best when each virtualized guest only has a single VCPU. The Linux scheduler is very efficient with this type of load. KVM should safely support guests with loads under 100% at a ratio of 5 VCPUs Overcommitting single VCPU virtualized guests is not an issue.
You cannot overcommit symmetric multiprocessing guests on more than the physical number of processing cores. For example a guest with four VCPUs should not be run on a host with a dual core processor. Overcommitting symmetric multiprocessing guests in over the physical number of processing cores will cause significant performance degradation.
Assigning guests VCPUs up to the number of physical cores is appropriate and works as expected. For example, running virtualized guests with four VCPUs on a quad core host. Guests with less than 100% loads should function effectively in this setup.
    
### Overcommitting memory
Most operating systems and applications do not use 100% of the available RAM all the time. This behavior can be exploited with KVM to use more memory for virtualized guests than what is physically available.
With KVM, virtual machines are Linux processes. Guests on the KVM hypervisor do not have blocks of physical RAM assigned to them instead they function as processes. Each process is allocated memory when it requests more memory. KVM uses this to allocate memory for guests when the guest operating system requests more or less memory. The guest only uses slightly more physical memory than the virtualized operating system appears to use.
When physical memory is nearly completely used or a process is inactive for some time, Linux moves the process's memory to swap. Swap is usually a partition on a hard disk drive or solid state drive which Linux uses to extend virtual memory. Swap is significantly slower than RAM.
As KVM virtual machines are Linux processes, memory used by virtualized guests can be put into swap if the guest is idle or not in heavy use. Memory can be committed over the total size of the swap and physical RAM. This can cause issues if virtualized guests use their total RAM. Without sufficient swap space for the virtual machine processes to be swapped to the pdflush process starts. pdflush kills processes to free memory so the system does not crash. pdflush may destroy virtualized guests or other system processes which may cause file system errors and may leave virtualized guests unbootable.
    
### Warning
If sufficient swap is not available guest operating systems will be forcibly shut down. This may leave guests inoperable. Avoid this by never overcommitting more memory than there is swap available.

The swap partition is used for swapping underused memory to the hard drive to speed up memory performance. The default size of the swap partition is calculated from amount of RAM and overcommit ratio. It is recommended to make your swap partition larger if you intend to overcommit memory with KVM. A recommended overcommit ratio is 50% (0.5). The formula used is:
`(0.5 * RAM) + (overcommit ratio * RAM) = Recommended swap size`

It is possible to run with an overcommit ratio of ten times the number of virtualized guests over the amount of physical RAM in the system. This only works with certain application loads (for example desktop virtualization with under 100% usage). Setting overcommit ratios is not a hard formula, you must test and customize the ratio for your environment.


Network:
create in the gui a natted network mynetwork, use the default settings, but check them
    
create a isolated network in the cli
vi /root/examplenet.xml
```xml
<network>
  <name>isolatednet</name>
  <uuid>8fa6f0f9-d36e-4541-b165-0a656afcd769</uuid>
  <bridge name='isolated1' stp='on' delay='0'/>
  <mac address='52:54:00:d6:55:79'/>
  <domain name='isolatednet'/>
  <ip address='192.168.16.1' netmask='255.255.255.0'>
  </ip>
</network>
```

virsh net-define --file examplenet.xml

if you do not have `mynetwork`
vi /root/mynetwork.xml
```
<network>
  <name>mynetwork</name>
  <uuid>9a982437-926d-4808-9de0-94b29bc71e53</uuid>
  <forward mode='nat'>
    <nat>
      <port start='1024' end='65535'/>
    </nat>
  </forward>
  <bridge name='virbr1' stp='on' delay='0'/>
  <mac address='52:54:00:19:b5:41'/>
  <domain name='mynetwork'/>
  <ip address='192.168.100.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='192.168.100.128' end='192.168.100.254'/>
    </dhcp>
  </ip>
</network>
```
virsh net-define --file mynetwork.xml
virsh net-autostart mynetwork
virsh net-start mynetwork

use the commands 
    virsh net-list --all
    virsh net-autostart isolatednet
    virsh net-autostart --disable isolatednet
    virsh net-autostart isolatednet

virsh net-start isolatednet
virsh net-list --all
 Name          State    Autostart   Persistent
------------------------------------------------
 default          inactive   no          yes
 sle301v15-lan    active     yes         yes
 sle301v15-san1   active     yes         yes
 sle301v15-san2   active     yes         yes
 isolatednet      active     yes         yes
 mynetwork        active     yes         yes
 

    
Server2 (stopped):

**Beware, you detach one then delete 2 and have no interface left**

virsh start SLE301v15-server2
virsh domiflist SLE301v15-server2
virsh detach-interface SLE301v15-server2 network --mac 52:54:00:75:c1:e4 --persistent --live
cd /etc/libvirt/qemu/
vi SLE301v15-server2.xml
- delete all networks, exept the first one
- change the first one to network mynetwork
    
Delete this part and save:
```
    <interface type='network'>
      <mac address='52:54:00:d4:72:21'/>
      <source network='sle301v15-san1'/>
      <model type='virtio'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x0c' function='0x0'/>
    </interface>
    <interface type='network'>
      <mac address='52:54:00:c2:96:3d'/>
      <source network='sle301v15-san2'/>
      <model type='virtio'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x0d' function='0x0'/>
    </interface>
```   
   
Restart libvirtd and start server2
```
systemctl restart libvirtd
virsh start SLE301v15-server2
```

from Nag:
expected output:
hypervisor-3:~ # virsh domiflist SLE301v15-server2
 Interface   Type      Source      Model    MAC
---------------------------------------------------------------
 vnet15      network   mynetwork   virtio   52:54:00:75:c1:e4
 
 
 

Server1 (was running):
virsh domiflist SLE301v15-server1
Interface   Type      Source           Model    MAC
--------------------------------------------------------------------
 vnet0       network   sle301v15-lan    virtio   52:54:00:07:e8:e8
 vnet1       network   sle301v15-san1   virtio   52:54:00:35:3e:13
 vnet2       network   sle301v15-san2   virtio   52:54:00:c6:2c:20

virsh detach-interface SLE301v15-server1 network --mac 52:54:00:07:e8:e8 --persistent --live
virsh detach-interface SLE301v15-server1 network --mac 52:54:00:35:3e:13 --persistent --live
virsh detach-interface SLE301v15-server1 network --mac 52:54:00:c6:2c:20 --persistent --live
virsh attach-interface SLE301v15-server1 network --model virtio --persistent --source mynetwork

server1 and server2 should now be only attached to mynetwork

from Nag:
expected output
hypervisor-3:~ # virsh domiflist SLE301v15-server1
 Interface   Type      Source      Model    MAC
---------------------------------------------------------------
 vnet16      network   mynetwork   virtio   52:54:00:9f:74:1c

zypper in bridge-utils
brctl show
brctl delif virbr1 vnetxv (use vnet device from server1)
brctl addif isolated1 vnetx
brctl show
Reverse it again


from Nag:
expected output
start:

hypervisor-3:~ # brctl show
bridge            namebridge id       STP enabled     interfaces
isolated1         8000.525400d65579    yes
sle301v15-lan     8000.525400d64579    yes
sle301v15-san1    8000.525400cf5691    yes
sle301v15-san2    8000.525400f931e4    yes
virbr1            8000.52540087ae08    yes              vnet15
                                                        vnet16

after running commands:
hypervisor-3:~ # brctl show
bridge         namebridge id       STP enabled    interfaces
isolated       18000.525400d65579  yes             vnet16
sle301v15-lan  8000.525400d64579   yes
sle301v15-san1 8000.525400cf5691   yes
sle301v15-san2 8000.525400f931e4   yes
virbr1         8000.52540087ae08   yes             vnet15

same with `ip`
```
ip link show master virbr1

18: vnet10: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master virbr1 state UNKNOWN mode DEFAULT group default qlen 1000
    link/ether fe:54:00:76:98:bd brd ff:ff:ff:ff:ff:ff
    
ip link set master isolated1 dev vnet9

ip link show master virbr1
18: vnet10: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master virbr1 state UNKNOWN mode DEFAULT group default qlen 1000
    link/ether fe:54:00:76:98:bd brd ff:ff:ff:ff:ff:ff
    
ip link show master isolated1
17: vnet9: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master virbr1 state UNKNOWN mode DEFAULT group default qlen 1000
    link/ether fe:54:00:d4:72:21 brd ff:ff:ff:ff:ff:ff
```

### add VLAN to this setup:
first create vlan interfaces
for example eth0 is the physical device, we create 3 vlan devices on top of that, lets call them vlan10, vlan20 and vlan30
create for each of the vlan interfaces a libvirt network with a bridge, attach the vlan interfaces to the bridge
bridge10, bridge20 and bridge30 (also 3 networks in libvirt)

for vxlan:
https://documentation.suse.com/smart/virtualization-cloud/html/vxlan/index.html

open vSwitch:
https://doc.opensuse.org/documentation/leap/reference/html/book-reference/cha-network.html#sec-network-openvswitch

## libvirt Pools:

**Beware `pool-create` is for transient pools that are started immediately and do not persist, `pool-define` for permanent ones**

### remove existing pools

```bash
virsh pool-list --all
virsh pool-undefine default
virsh pool-destroy default
virsh pool-undefine default
virsh pool-list --all
```

### remove existing directories

```bash
rm -r /data/iso
rm -r /data/VMs
rm -r /data/config
```

### storage

```bash
mkdir -p /data/myvmstorage
virsh pool-define-as myvmstorage dir - - - - "/data/myvmstorage"
virsh pool-list --all
virsh pool-autostart myvmstorage
virsh pool-start myvmstorage
virsh pool-list --all
```

### install

```bash
mkdir /data/install
virsh pool-define-as install  dir - - - - "/data/install"
virsh pool-autostart install
virsh pool-start install
virsh pool-list --all
```

### stop all VMs

```bash
virsh undefine SLE301v15-server1
virsh undefine SLE301v15-server2
```

### Create a 20G vol in the GUI, type qcow2 name vol1 in pool myvmstrage

```bash
virsh vol-list myvmstorage
qemu-img info /data/myvmstorage/vol1.qcow2
```
delete it again
    
### create a vol on the cli

```bash
virsh vol-create-as --pool myvmstorage --name vol2.qcow2 --capacity 20G --format qcow2
virsh vol-list myvmstorage
qemu-img info /data/myvmstorage/vol2.qcow2
virsh vol-resize vol2.qcow2 --pool myvmstorage --capacity 30G
virsh vol-list myvmstorage
qemu-img info /data/myvmstorage/vol2.qcow2
virsh vol-delete --pool myvmstorage vol2.qcow2
```

## Linux Guest

### copy SLES install iso

```bash
scp hypervisor-0:/data/install/SLES-16.0-Full-x86_64-GM.install.iso /data/install/
virsh vol-list install
virsh pool-refresh install
virsh vol-list install
```

### Install Linux Guest
choose install media from install pool
create new volume in myvmstorage pool
Wizard end screen: change network to `mynetwork`, set masrk to customize installation
in Customize screen change nothing but have a look at the hardware for the VM, specially for disk and NIC (virtio)

During installation change only software (add Gnome) and add user `tux` with password `linux` and set root password to `linux`

## Windows Guest

### VirtIO Drivers for Windows:
https://github.com/virtio-win/virtio-win-pkg-scripts/blob/master/README.md

```bash
scp hypervisor-0:/data/install/Win10_22H2_English_x64v1.iso /data/install/
scp hypervisor-0:/data/install/virtio-win-0.1.285.iso /data/install/
virsh pool-refresh install
virsh vol-list install
```

### Install Windows Guest

- 30GB volume
- Mark Customize settings before install
- Changes for Windows instalation
    - change the network to mynetwork
    - change the disk to type virtio
    - change the network card also to type virtio
    - add Storage, browse to the virtio-iso file, change type from disk to CDROM 
- After pressing Start Installation be fast to press any key in the Windows installer
- Install now Button
    - I dont have a product key
    - Press Custom Install
    - Load Driver
        - Browse
        - Go to CD virtio
        - Press ok or specify path in viostor folder

Start installer from the virtio driver cdrom (X64), instaLL everything
Download Spice-Tools from 
  https://www.spice-space.org/download.html, go down to Guest Section, download (spice-guest-tools)
Start the installer

as root on the hypervisor
zypper in virt-viewer 
virt-viewer --connect qemu:///system sles16
virt-viewer --connect qemu:///system win11

We dont do this:
zypper in openssh-askpass-gnome
virt-viewer --connect qemu+ssh://tux@hypervisor-2.training.lab/system sles1
    (works only if in libvirtd.conf and qemu.conf remote connection is allowed)
    


Serial access to Linux VMs
change VM settings
in VM
systemctl enable --now sshd
vi /etc/default/grub

GRUB_CMDLINE_LINUX_DEFAULT="mitigations=auto quiet security=selinux selinux=1 console=tty0 console=ttyS0"

This 2 parameters need to be added:
console=tty0 console=ttyS0
grub2-mkconfig -o /boot/grub2/grub.cfg
reboot VM

virsh console sles16
to leave virsh serial console: Cntl + ] --- for MAC users CTRL+Option+6
    (on my windows keyboard ctrl+5 works too)
    
virsh domblklist sles16
virsh domiflist sles16
virsh domifaddr sles16 --source agent
virt-xml sles16 --edit --help
 
 
Cloning
virsh shutdown sles16
Create a clone in the GUI and delete it again
virt-clone --original sles16 --auto-clone

qemu-img know formats:
qcow2: QEMU's native and most versatile format (supports snapshots, compression, and encryption).
raw: A simple, unformatted image file (can be used with bare metal via dd).
vdi: VirtualBox Disk Image format.
vmdk: VMware Virtual Machine Disk format.
vpc: Microsoft Virtual PC format (use this argument for .vhd files).
vhdx: Microsoft Hyper-V VHDX format.
qed: QEMU enhanced disk format. 


Cockpit:
zypper in cockpit cockpit-machines
groupadd -g 466 cockpit-ws
useradd -g 466 -c "User for cockpit web service" -d /nonexisting -s /sbin/nologin cockpit-ws

systemctl enable --now cockpit.socket
https://localhost:9090/
login is tux b1s


### change root password with guestfish

zypper in libguestfs guestfs-tools virt-v2v
openssl passwd -6 linux2

copy that hash
choose a linux vm that is not running
find the imagefile for that VM
virsh domblklist sles16
export LIBGUESTFS_BACKEND=direct
guestfish -a /path/to/imagefile
in guestfish execute 
run
list-filesystems
mount /dev-rootdevice /
vi /etc/shadow
replace hash for root user
if you accidentally delete something, here's the whole root line
```
root:$6$6XykAB1f3YbVOoDF$YOlGeKjjHf2w50YOMlwbycETUcgxbtBYtDB71itGz.JMkW2CXMzkzGdfz1lqn9Nb6EjA7i6Iq7OZMyP3rR9dV/:20438::::::
```
save & exit (enter :wq)
start VM
login as tux
do su -
test new root password


### create goldimage 
    
in VM sles16
```bash
passwd --expire root
```

in hypervisor
```bash
virsh shutdown sles16
# find imagename and path of VM
virsh domblklist sles16
virt-sysprep --list-operation
virt-sysprep -d sles16
mkdir /data/gold
virsh undefine sles16
mv /data/myvmstorage/sle15sp7.qcow2 /data/gold/goldimage.qcow2
virsh pool-refresh myvmstorage
``` 
    
### Create a new VM

```bash
cp /data/gold/goldimage.qcow2 /data/myvmstorage/newsles.qcow2
virsh pool-refresh myvmstorage
virt-install --import --name newsles --vcpus 4 --ram 4000 --disk path=/data/myvmstorage/newsles.qcow2,format=qcow2,bus=virtio --os-variant sles16 --network network=mynetwork,model=virtio --autoconsole none
```

login in VM, do `su -` and you are forced to set a new password for root, e.g. `mynewpassword1234`

If you do `sudo su -` instead, followed by `passwd root`, you can set an insecure password if you want. It will still warn you but accept e.g. `linux3` anyway.
    
    
### virt-builder

Create an image from the official repository and use it to create a new vm. Self-hosting a repo is possible.

```
zypper in libguestfs-xfs
cd /data/myvmstorage
virt-builder --list
virt-builder centos-8.2 --format=qcow2 --size=15G -o centos8.2.qcow2 --root-password password:test123
virt-install --import --name centos --vcpus 3 --ram 4096 --disk path=/data/myvmstorage/centos8.2.qcow2,format=raw --os-variant rhel8.2 --network network=mynetwork --autoconsole none
```
Q: is `format=raw` correct? we do use a qcow2 image.

#### if you're adventurous/prefer debian:

```
virt-builder debian-13 --format=qcow2 --size=15G -o /data/myvmstorage/deb13.qcow2,format=qcow2 --root-password password:test123
virt-install --import --name debian13 --vcpus 13 --ram 4096 --disk path=/data/myvmstorage/deb13.qcow2,format=qcow2 --os-variant debian13 --network network=mynetwork --autoconsole none
```

But I had to fix the `/etc/network/interfaces` and change `ens2` to `enp1s0`, followed by `ifup enp1s0` before the interface was used and received an ip.



### Snapshots

choose a VM Linux with qcow2 backend image
 start it
login into VM as user tux, open terminal in VM and do
touch testfile
virsh snapshot-list VMName
virsh snapshot-create-as VMName --name "Snapshot 1" --description "First snapshot" --atomic
virsh snapshot-list VMName
login into VM as user tux, open terminal in VM and do
rm testfile
virsh snapshot-create-as VMName --name "Snapshot 2" --description "First snapshot" --atomic
virsh snapshot-list VMName --tree
to find image
virsh domblklist VMname
qemu-img info -U /path/to/imagefile.qcow2
check snapshots in virtmanager
virsh snapshot-revert VMName --snapshotname "Snapshot 1"
virsh snapshot-list VMName
login into VM as user tux, open terminal in VM and check if testfile ist restored
qemu-img info -U /path/to/imagefile.qcow2

Create Snapshots with openstack
https://gist.github.com/ajayhn/6455c280e8c49ad57614
    
Cloning a VM from a snapshot
https://dev.to/mediocredevops/cloning-kvm-snapshots-1paj


To use KSM, do the following.

Although SLES includes KSM support in the kernel, it is disabled by default. To enable it, run the following command:

# echo 1 > /sys/kernel/mm/ksm/run
￼COPY
Now run several VM Guests under KVM and inspect the content of files pages_sharing and pages_shared, for example:

> while [ 1 ]; do cat /sys/kernel/mm/ksm/pages_shared; sleep 1; done
13522
13523
13519
13518
13520
13520
13528


Automatic NUMA balancing
hypervisor-0:/data/myvmstorage # cat /proc/sys/kernel/numa_balancing
0
hypervisor-0:/data/myvmstorage # echo 0 > /proc/sys/kernel/numa_balancing


Simulate stolen CPU time
On hypervisor
zypper in psmisc
top
On Hypersor create 9 times load:
dd if=/dev/urandom of=/dev/null &
use top on the hypervisor to see load
use top in thew VM also to see load
in VM create a process that takes CPU power for 1 core
dd if=/dev/urandom of=/dev/null &
d d if=/dev/urandom of=/dev/null & 
look in the VM the stolen values in top
kill -9 PID of dd processes in VM
on Hypervisor do
killall -9 dd


Live migration:
- access to the same VM disk files on both sourerce and dest hypervisor
- same network that the VM uses on the source HV must be active n the dest HV
- Live migration is only possible inside of the CPU Vendor family
- with host-passsthrough on CPUs to VM its only possible no migrate between SAME CPUs or lower CPU to higher CPU


Preparation:
undefine all VMs
undefine all networks



I had to use 
virsh undefine win10 --nvram --remove-all-storage
for the win machine.

/etc/exports
/data/share *(rw,async,no_root_squash)


Group1:
Members: Adam, Suresh, Nina
Hypervisors: Hypervisor-1, Hypervisor-04, Hypervisor-7


Group2:
Members: Emma,Boyu,Bryan
Hypervisors: Hypervisor-5,Hypervisor-6, Hypervisor-8



Group3:
Members: Vlad, Konstantin
Hypervisors: Hyper-9, hyper-10

all members of each group:
mkdir /var/lib/libvirt/images/nfs
mount hypervisor-0:/data/share/groupX /var/lib/libvirt/images/nfs -o nolock,nfsvers=3
Replace X with your GroupNumber
    
ls -l /var/lib/libvirt/images/nfs
total 5261400
-rwxrwxrwx 1 root root 21753823232 Feb 27 11:56 slesimage.qcow2

add pool
virsh pool-define-as shared dir - - - - "/var/lib/libvirt/images/nfs"
virsh pool-list
virsh pool-start shared
virsh pool-autostart shared
virsh pool-refresh shared
virsh vol-list shared


add network

vi /root/migratenetwork.xml

```
<network>
  <name>migratenetwork</name>
  <uuid>5da501c5-84ec-41bb-b058-c40d6fc25d1b</uuid>
  <forward mode='nat'>
    <nat>
      <port start='1024' end='65535'/>
    </nat>
  </forward>
  <bridge name='virbr5' stp='on' delay='0'/>
  <mac address='52:54:00:6c:f3:81'/>
  <domain name='migratenetwork'/>
  <ip address='192.168.105.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='192.168.105.128' end='192.168.105.254'/>
    </dhcp>
  </ip>
</network>
```


virsh net-define /root/migratenetwork.xml
virsh net-list --all
virsh net-start migratenetwork
virsh net-autostart migratenetwork



only the first in the group will do that the following steps!!!
define VM 
virt-install --import --name slesmigrate --vcpus 4 --ram 4096 --disk path=/var/lib/libvirt/images/nfs/slesimage.qcow2,format=qcow2 --os-variant sles16 --network network=migratenetwork --autoconsole none
virsh list
the VM should be up now!

the others (not the first one) will do that:
watch virsh list

Migrate command
virsh migrate --live --undefinesource --verbose slesmigrate qemu+ssh://hypervisor-X.training.lab/system
Replace X with Target Hypervisor Number 




https://feedback.training.b1-systems.de/201918
1 very good, 2 good, 3 neutral, 4 bad 5 very bad

Translation
trainer
	Knowledge of the trainer*
	12345

	Involving participants*
	12345

	Answering questions*
	12345

	Explanation of technical concepts*
	12345

	Overall trainer rating*
	12345
comment


Training document
	Content appropriate to the course*
	12345

	Content appropriate to the course duration*
	12345

	Exercises appropriate*
	12345

	Document technically correct*
	12345

	Rating document overall*
	12345

	comment

Learning environment
	Environment appropriate*
	12345

	Technical setup appropriate for the training*
	12345

	Overall environment rating*
	12345

comment

What did you particularly like?
What changes would you recommend we make?
Would you attend a B1 Systems training course again?
