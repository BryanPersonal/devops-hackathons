


```

Hello Alexandar,
please find below the analysis from my colleague:
<------------------------------------------------------>
I've checked the crash dump (triggered manually), starting at 05:06am,
two NFS servers (out of 5 available) stopped responding:
------------------------------------------------------------------------
[Mon Feb 16 05:06:59 CET 2026] nfs: server ms-cis-clmam-eu-de-2-vlab-private-01-01-10-180-240-25.vlab.clmam.gmp.eu-de-2.cloud.sap not responding, still trying
[Mon Feb 16 05:07:52 CET 2026] nfs: server ms-cis-clmam-eu-de-2-vlab-private-01-01-10-180-240-14.vlab.clmam.gmp.eu-de-2.cloud.sap not responding, still trying
------------------------------------------------------------------------

10.180.240.25 (exports /hdb/VAZ/data, /usr/sap/VAZ, /sapmnt, /backup_fs)
10.180.240.14 (exports /hdb/VAZ/backup/log)

At the time of the crash, as expected 99 processes were blocked in
uninterruptible sleep waiting for NFS RPC responses. Among them ~30
HanaWorker threads, ~20 PoolThread, sapstartsrv, sapdbctrl,
node_exporter...

------------------------------------------------------------------------
crash> foreach UN bt | grep -c "rpc_wait"
99

crash> crash> foreach UN bt | head -200

crash> foreach UN bt | head -200
PID: 2620     TASK: ffff8ac48058c000  CPU: 30   COMMAND: "node_exporter"
 #0 [ffffd0740ebfb790] __schedule at ffffffff822a81f4
 #1 [ffffd0740ebfb840] schedule at ffffffff822a9374
 #2 [ffffd0740ebfb850] rpc_wait_bit_killable at ffffffffc0dea82d [sunrpc]
 #3 [ffffd0740ebfb860] __wait_on_bit at ffffffff822a9944
 #4 [ffffd0740ebfb898] out_of_line_wait_on_bit at ffffffff822a9a31
 #5 [ffffd0740ebfb8e8] __rpc_execute at ffffffffc0dee3f4 [sunrpc]
 #6 [ffffd0740ebfb940] rpc_execute at ffffffffc0dee888 [sunrpc]
 #7 [ffffd0740ebfb960] rpc_run_task at ffffffffc0dd1678 [sunrpc]
 #8 [ffffd0740ebfb988] rpc_call_sync at ffffffffc0dd22b0 [sunrpc]
 #9 [ffffd0740ebfb9e8] nfs3_rpc_wrapper at ffffffffc0e51931 [nfsv3]
#10 [ffffd0740ebfba10] nfs3_proc_statfs at ffffffffc0e51bca [nfsv3]
#11 [ffffd0740ebfba50] nfs_statfs at ffffffffc0f098a1 [nfs]
#12 [ffffd0740ebfbac8] statfs_by_dentry at ffffffff81a5cde4
#13 [ffffd0740ebfbae0] vfs_statfs at ffffffff81a5d536
#14 [ffffd0740ebfbaf8] user_statfs at ffffffff81a5d654
#15 [ffffd0740ebfbb38] __do_sys_statfs at ffffffff81a5d6d0
#16 [ffffd0740ebfbbc8] do_syscall_64 at ffffffff82295268
#17 [ffffd0740ebfbf40] entry_SYSCALL_64_after_hwframe at ffffffff82400134
... ....
... ...

crash> foreach UN bt | grep "COMMAND:" | sort | uniq -c | sort -rn
      1 PID: 95605    TASK: ffff8ac72e9b4000  CPU: 32   COMMAND: "TimerThread"
      1 PID: 94912    TASK: ffff8ac4612dc000  CPU: 4    COMMAND: "perl"
      1 PID: 91512    TASK: ffff8b14fc6ac000  CPU: 39   COMMAND: "HanaWorker"
      1 PID: 8633     TASK: ffff8ac48749c000  CPU: 11   COMMAND: "HTTPDispatch"
      1 PID: 84713    TASK: ffff8aca4ce20000  CPU: 20   COMMAND: "systemd"
      1 PID: 58697    TASK: ffff8b16876ac000  CPU: 10   COMMAND: "HanaWorker"
      1 PID: 5704     TASK: ffff8ac449078000  CPU: 12   COMMAND: "sapstartsrv"
      1 PID: 5693     TASK: ffff8ac463f48000  CPU: 20   COMMAND: "sapstartsrv"
      1 PID: 53022    TASK: ffff8b03f0bb0000  CPU: 37   COMMAND: "HanaWorker"
      1 PID: 53021    TASK: ffff8b05da9b4000  CPU: 36   COMMAND: "HanaWorker"
      1 PID: 38636    TASK: ffff8ac8dcb50000  CPU: 3    COMMAND: "HanaWorker"
      1 PID: 37152    TASK: ffff8b17d05f0000  CPU: 22   COMMAND: "HanaWorker"
      1 PID: 35425    TASK: ffff8aca8d9c0000  CPU: 6    COMMAND: "HanaWorker"
      1 PID: 3495     TASK: ffff8ac458ad0000  CPU: 25   COMMAND: "filebeat"
      1 PID: 27302    TASK: ffff8ac9d65bc000  CPU: 29   COMMAND: "HanaWorker"
      1 PID: 2713     TASK: ffff8ac481db0000  CPU: 26   COMMAND: "node_exporter"
      1 PID: 2712     TASK: ffff8b03cb160000  CPU: 23   COMMAND: "node_exporter"
      1 PID: 2620     TASK: ffff8ac48058c000  CPU: 30   COMMAND: "node_exporter"
      .... .... ...
      .... ..... ..
------------------------------------------------------------------------


This looks like either a network issue on the respective affected NFS
subnets, or issues with the NFS servers themselves. Please check whether
there was any network issue, and whether those NFS servers were having
any problems recently. Also please check whether there were other
systems having issues reaching those two NFS servers.


<------------------------------------------------------>
Best regards
Ulf

```


```
SUSE Technical Support
Feb 20, 2026, 10:55 AM UTC
Hello Alexandar,
add he added:
<-------------------------------------------------->
Furthermore, the ARP status for the repective NFS server hosts:
crash> net -a|grep FAILED
ffff8b03cf1a3a00 10.180.240.14   ETHER      d2:39:ea:ad:8e:bd  eth0    FAILED
ffff8b0baa1f8600 10.180.244.71   ETHER      fa:16:3e:29:3a:69  eth0    FAILED
ffff8ac48ee13000 10.180.240.16   ETHER      00:00:00:00:00:00  eth0    FAILED
ffff8ac44c16fa00 10.180.240.36   ETHER      fa:16:3e:22:fb:44  eth0    FAILED
ffff8b03cddcbc00 10.180.242.209  ETHER      fa:16:3e:bc:09:f7  eth0    FAILED

crash> net -a|grep 10.180.240.25
ffff8ac481f98000 10.180.240.25   ETHER      d2:39:ea:ad:94:66  eth0    DELAY

This means that the OS sent ARP requests and received no replies. This
indicates an issue on the L2 network infrastructure, perhaps the VMware
vSwitch, or any distributed firewall or packet filter between the VM's
vNIC and the physical network.

crash> net -a
NEIGHBOUR        IP ADDRESS      HW TYPE    HW ADDRESS         DEVICE  STATE
ffff8ac481f98000 10.180.240.25   ETHER      d2:39:ea:ad:94:66  eth0    DELAY
ffff8ac486965400 100.64.159.233  ETHER      b8:ce:f6:be:18:34  eth2    STALE
ffff8b03cf1a3a00 10.180.240.14   ETHER      d2:39:ea:ad:8e:bd  eth0    FAILED
ffff8b03d2804400 10.180.241.75   ETHER      fa:16:3e:bf:65:15  eth0    INCOMPLETE
ffff8b0ea1110400 100.64.159.192  ETHER      fa:16:3e:8d:33:3a  eth2    STALE
ffff8ac481f27600 10.180.240.56   ETHER      d2:39:ea:af:45:ca  eth0    REACHABLE
ffff8b163251ca00 10.180.240.26   ETHER      d2:39:ea:ad:8e:bd  eth0    STALE
ffff8b0baa1f8600 10.180.244.71   ETHER      fa:16:3e:29:3a:69  eth0    FAILED
ffff8b03cf1a1a00 10.180.240.1    ETHER      fa:16:3e:d7:99:8c  eth0    REACHABLE
ffff8ac48ee13000 10.180.240.16   ETHER      00:00:00:00:00:00  eth0    FAILED
ffff8b03ca5c3c00 100.64.159.200  ETHER      fa:16:3e:78:0c:aa  eth2    STALE
ffff8b163251e200 10.180.240.43   ETHER      d2:39:ea:af:45:ca  eth0    STALE
ffff8b03cc63e200 10.180.243.212  ETHER      fa:16:3e:30:26:e5  eth0    REACHABLE
ffff8ac44c35a600 10.180.33.163   ETHER      d2:39:ea:35:dc:a1  eth1    REACHABLE
ffff8ac44c16fa00 10.180.240.36   ETHER      fa:16:3e:22:fb:44  eth0    FAILED
ffff8b03d281e200 10.180.32.148   ETHER      d2:39:ea:c5:32:4d  eth1    REACHABLE
ffff8ac44c2cea00 100.64.159.210  ETHER      fa:16:3e:0b:52:a3  eth2    STALE
ffff8ac488e09200 0.0.0.0         UNKNOWN    00 00 00 00 00 00  lo      NOARP
ffff8b03cddcbc00 10.180.242.209  ETHER      fa:16:3e:bc:09:f7  eth0    FAILED
ffff8b03ca5c0000 10.180.242.254  ETHER      fa:16:3e:15:d4:a6  eth0    STALE
ffff8ac486965800 10.180.243.48   ETHER      fa:16:3e:5d:28:df  eth0    STALE


Other hosts on the same subnet were REACHABLE (10.180.240.56,
10.180.240.1), the problem was specific to reaching .14 and .25.
systems.

Actually, a tcpdump would have been much more helpful here. Is there one
available from the time of the incident?


<-------------------------------------------------->
Do we have a capture at time of incident? Can you collect one if the issue occurs again?
Best regards
Ulf

-
Please leave the address techsupport@suse.com in TO/CC when replying to this email.

Ulf Volmer

SUSE Premium Support

E-Mail: ulf.volmer@suse.com
Moerserbroicher Weg 200
40470 Düsseldorf
Germany

Office: +49 211 54012911
Mobile: +49 173 5876701

PLEASE NOTE: This e-mail may contain confidential and privileged material for the sole use of the intended recipient. Any review, distribution or other use by anyone else is strictly prohibited. If you are not an intended recipient, please contact the sender and delete all copies. Thank you.

SUSE Software Solutions Germany GmbH, Frankenstraße 146
90461 Nürnberg
Germany (HRB 36809, AG Nürnberg)
Jochen Jaser, Andrew McDonald, Werner Knoblich

```

```
SUSE Technical Support
Feb 20, 2026, 1:08 PM UTC
Hello Alexandar,
> just to confirm, since tcp dupms are requested, this indicates issues on lower levers than OS.

> based on:

> This means that the OS sent ARP requests and received no replies. This

> indicates an issue on the L2 network infrastructure, perhaps the VMware

> vSwitch, or any distributed firewall or packet filter between the VM's

> vNIC and the physical network.

we see in the arp cache on the same interface/subnet functional entries and also entries in DELAY/ICNCOMPLETE state (which ensures that the OS stack is working, so yes, the reason for the FAILED entries must externally.
Best regards
Ulf
-
Please leave the address techsupport@suse.com in TO/CC when replying to this email.

Ulf Volmer

SUSE Premium Support

E-Mail: ulf.volmer@suse.com
Moerserbroicher Weg 200
40470 Düsseldorf
Germany

Office: +49 211 54012911
Mobile: +49 173 5876701

PLEASE NOTE: This e-mail may contain confidential and privileged material for the sole use of the intended recipient. Any review, distribution or other use by anyone else is strictly prohibited. If you are not an intended recipient, please contact the sender and delete all copies. Thank you.

SUSE Software Solutions Germany GmbH, Frankenstraße 146
90461 Nürnberg
Germany (HRB 36809, AG Nürnberg)
Jochen Jaser, Andrew McDonald, Werner Knoblich
```