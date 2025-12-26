libvirt should solve that problem
Libvirt can be controlled in several ways:
- virsh
- Virt Manager
- OpenStack


check if CPU flags are available for KVM:
egrep '(vmx|svm)' /proc/cpuinfo

zypper se kvm
zypper se -t pattern kvm_server
zypper se qemu
qemu-8.2.8-150600.3.25.1.x86_64
zypper se libvirt
   
(zypper in -t pattern kvm_server)

Kernel Modules
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


interact with libvirt api:
virsh virt-manager, also Openstack and so on

systemctl status libvirtd
systemctl is-enabled libvirtd

Libvirts configuration store (only for localhost, no neighbor Hypervisors!):
/etc/libvirt
change there and look around, identify the files and directories

virsh is the command line tool to interact with libvirt


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


### connect to vm via ssh
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
tux linux
root linux

kill process
kill -9 PIDps 

cd /var/log/libvirt/qemu
less VMLOGFILE

ps -ef | grep SLE301v15-server1
ps -T -p <PID>
    

Overcommitment
    
Overcommitting virtualized CPUs
The KVM hypervisor supports overcommitting virtualized CPUs. Virtualized CPUs can be overcommitted as far as load limits of virtualized guests allow. Use caution when overcommitting VCPUs as loads near 100% may cause dropped requests or unusable response times.
Virtualized CPUs are overcommitted best when each virtualized guest only has a single VCPU. The Linux scheduler is very efficient with this type of load. KVM should safely support guests with loads under 100% at a ratio of 5 VCPUs Overcommitting single VCPU virtualized guests is not an issue.
You cannot overcommit symmetric multiprocessing guests on more than the physical number of processing cores. For example a guest with four VCPUs should not be run on a host with a dual core processor. Overcommitting symmetric multiprocessing guests in over the physical number of processing cores will cause significant performance degradation.
Assigning guests VCPUs up to the number of physical cores is appropriate and works as expected. For example, running virtualized guests with four VCPUs on a quad core host. Guests with less than 100% loads should function effectively in this setup.
    
Overcommitting memory
Most operating systems and applications do not use 100% of the available RAM all the time. This behavior can be exploited with KVM to use more memory for virtualized guests than what is physically available.
With KVM, virtual machines are Linux processes. Guests on the KVM hypervisor do not have blocks of physical RAM assigned to them instead they function as processes. Each process is allocated memory when it requests more memory. KVM uses this to allocate memory for guests when the guest operating system requests more or less memory. The guest only uses slightly more physical memory than the virtualized operating system appears to use.
When physical memory is nearly completely used or a process is inactive for some time, Linux moves the process's memory to swap. Swap is usually a partition on a hard disk drive or solid state drive which Linux uses to extend virtual memory. Swap is significantly slower than RAM.
As KVM virtual machines are Linux processes, memory used by virtualized guests can be put into swap if the guest is idle or not in heavy use. Memory can be committed over the total size of the swap and physical RAM. This can cause issues if virtualized guests use their total RAM. Without sufficient swap space for the virtual machine processes to be swapped to the pdflush process starts. pdflush kills processes to free memory so the system does not crash. pdflush may destroy virtualized guests or other system processes which may cause file system errors and may leave virtualized guests unbootable.
    
Warning
If sufficient swap is not available guest operating systems will be forcibly shut down. This may leave guests inoperable. Avoid this by never overcommitting more memory than there is swap available.

The swap partition is used for swapping underused memory to the hard drive to speed up memory performance. The default size of the swap partition is calculated from amount of RAM and overcommit ratio. It is recommended to make your swap partition larger if you intend to overcommit memory with KVM. A recommended overcommit ratio is 50% (0.5). The formula used is:
(0.5 * RAM) + (overcommit ratio * RAM) = Recommended swap size

It is possible to run with an overcommit ratio of ten times the number of virtualized guests over the amount of physical RAM in the system. This only works with certain application loads (for example desktop virtualization with under 100% usage). Setting overcommit ratios is not a hard formula, you must test and customize the ratio for your environment.
 