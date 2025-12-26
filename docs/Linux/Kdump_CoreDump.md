
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

```

Installl kdump
# zypper in kdump
Tune /etc/sysconfig/kdump
Here’s the full set, the changed settings in bold
KDUMP_KERNELVER=“”

# 16 turned out to be the sweet spot between memory consumption and performance
KDUMP_CPUS=16
KDUMP_COMMANDLINE=""
KDUMP_COMMANDLINE_APPEND=""
KDUMP_AUTO_RESIZE="false"
KEXEC_OPTIONS=""
KDUMP_IMMEDIATE_REBOOT="true"
KDUMP_TRANSFER=“"

# /basmnt/tempdata
KDUMP_SAVEDIR="nfs://10.180.32.148/share_9095c713_caf9_4e8e_a6c3_c7fd6ac98cdc/kdump"
KDUMP_KEEP_OLD_DUMPS=0
KDUMP_FREE_DISK_SIZE=24

# default is 0, with that you cannot see any progress on the console
KDUMP_VERBOSE=7
KDUMP_DUMPLEVEL=31
KDUMP_DUMPFORMAT="compressed"
KDUMP_CONTINUE_ON_ERROR="false"
KDUMP_REQUIRED_PROGRAMS=""
KDUMP_PRESCRIPT=""
KDUMP_POSTSCRIPT=“"

# this needs to match the interface over which the NFS share is accessed
KDUMP_NETCONFIG="eth1:auto"
KDUMP_NET_TIMEOUT=10
KDUMP_SMTP_SERVER=""
KDUMP_SMTP_USER=""
KDUMP_SMTP_PASSWORD=""
KDUMP_NOTIFICATION_TO=""
KDUMP_NOTIFICATION_CC=""
KDUMP_HOST_KEY=""
KDUMP_SSH_IDENTITY=""

3. Make the memory reservation in /etc/default/grub
GRUB_CMDLINE_LINUX="splash=0 log_buf_len=8M consoleblank=0 nomodeset ipv6.disable=1 crashkernel=512M fsck.repair=yes"
 
4. Update grub.conf: 
  grub2-mkconfig -o /boot/grub2/grub.cfg


Create kdump initrd
mkdumprd -f

6. Enable kdump service
      systemctl enable kdump

7. Reboot   

8. Checks after reboot

# dmesg | grep -i 'crashkernel reserved'
[    0.076435] crashkernel reserved: 0x00000000a0000000 - 0x00000000c0000000 (512 MB)

# systemctl status kdump
● kdump.service - Load kdump kernel and initrd
     Loaded: loaded (/usr/lib/systemd/system/kdump.service; enabled; preset: disabled)
     Active: active (exited) since Thu 2025-11-20 03:42:26 UTC; 48s ago
    Process: 9872 ExecStart=/usr/lib/kdump/load.sh --update (code=exited, status=0/SUCCESS)
   Main PID: 9872 (code=exited, status=0/SUCCESS)
        CPU: 291ms


```