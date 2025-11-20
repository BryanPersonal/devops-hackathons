
Concepts:
1. Core dump is a file containing a process's address space (memory) when the process terminates unexpectedly. Core dumps may be produced on-demand (such as a debugger), or automatically upon termination.  - Arch Linux Wiki
Man gcore - Generate a core file of a running program 


#### Intro: Kdump section



```
Several important configurations

1. 
# Immediately reboot after saving the core in the kdump kernel?
#
# See also: kdump(5).
#
KDUMP_IMMEDIATE_REBOOT="true"

2. 

cc01v012364:~ # kdumptool calibrate
Total: 2031
Low: 0
High: 339
MinLow: 0
MaxLow: 576
MinHigh: 0
MaxHigh: 576

3. change Grucrashkernel= 350 m

(vadb02nza) cc02v019827:~ #
# grep -v "#" /etc/sysconfig/kdump | sort -r |grep -v '""'
KDUMP_VERBOSE=7
KDUMP_SAVEDIR="nfs://10.180.32.148/share_9095c713_caf9_4e8e_a6c3_c7fd6ac98cdc/kdump"
KDUMP_NET_TIMEOUT=10
KDUMP_NETCONFIG="eth1:auto"
KDUMP_KEEP_OLD_DUMPS=0
KDUMP_IMMEDIATE_REBOOT="true"
KDUMP_FREE_DISK_SIZE=24
KDUMP_DUMPLEVEL=31
KDUMP_DUMPFORMAT="compressed"
KDUMP_CPUS=16
KDUMP_CONTINUE_ON_ERROR="true"
KDUMP_AUTO_RESIZE="false"


# v. It would calculate 400MB for 32core

```