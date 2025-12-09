

INC13150725, INC13192790, INC13229197


Client Errors:
```text
[US4] [hana_a3q_factoryus4] [PROBLEM]: HANA DB Availability
Database not accessible: Data receive failed (socket timeout). : 100.81.53.245:51108 -> hana-a3q-factoryus4-vtdfvhfu.us4.scp.net.ppp:30013 ConnectionID:0 SessionID:0

[US4] [hana_a41_factoryus4] [PROBLEM]: HANA DB Availability
Database not accessible: Data receive failed (socket timeout). : 100.81.53.245:42608 -> hana-a41-factoryus4-iiljm63n.us4.scp.net.ppp:30013 ConnectionID:0 SessionID:0

[US4] [hana_a0j_factoryus4] [PROBLEM]: HANA DB Availability
Database not accessible: Data receive failed (socket timeout). : 100.81.55.178:60046 -> hana-a0j-factoryus4-a78helb0.us4.scp.net.ppp:30013 ConnectionID:0 SessionID:0
```

Findings from OS: 
1. Sys Load was increased around the time that incident got generated.  There were 3 uninterruptible I/O waits.
2. 

持续高 blocked 数量通常意味着：

I/O 系统繁忙或性能差；

某些进程被“卡死”在存储或文件系统操作中；

blocked 表示当时处于 不可中断的 I/O 等待状态（D 状态） 的进程数量。 可在出问题时 ps -eo state,pid,ppid,cmd | grep '^D'


```
vsahanaa4102factoryus401:~ # sar -q -s 03:08 -e 03:17 -f /var/log/sa/sa20250607
Linux 5.14.21-150500.55.100-default (vsahanaa4102factoryus401)  06/07/25        _x86_64_        (48 CPU)

03:08:00      runq-sz  plist-sz   ldavg-1   ldavg-5  ldavg-15   blocked
03:09:00            0      1879      1.51      0.60      0.33         3
03:10:00            1      1901      4.04      1.53      0.67         0
03:11:00            0      1878      3.03      1.76      0.81         2
03:12:00            0      1875      4.66      2.37      1.08         0
03:13:00            0      1873      1.92      2.01      1.04         0
03:14:00            1      1871      0.85      1.68      0.98         0
03:15:00            1      1873      0.40      1.40      0.93         0
03:16:00            0      1872      0.22      1.17      0.88         0
03:17:00            0      1868      0.13      0.97      0.83         0
Average:            0      1877      1.86      1.50      0.84         1


vsahanaa4102factoryus401:/tmp # sar -u -s 03:08 -e 03:20 -f /var/log/sa/sa20250607
Linux 5.14.21-150500.55.100-default (vsahanaa4102factoryus401)  06/07/25        _x86_64_        (48 CPU)

03:08:00        CPU     %user     %nice   %system   %iowait    %steal     %idle
03:09:00        all      0.57      0.00      0.26      2.85      0.00     96.32
03:10:00        all      1.20      0.00      0.55      6.77      0.00     91.48
03:11:00        all      0.38      0.00      0.23      5.98      0.00     93.41
03:12:00        all      0.54      0.00      0.26      5.27      0.00     93.93
03:13:00        all      0.36      0.00      0.16      0.72      0.00     98.76
03:14:00        all      0.36      0.00      0.16      0.01      0.00     99.47
03:15:00        all      0.61      0.00      0.24      0.01      0.00     99.15
03:16:00        all      0.40      0.00      0.21      0.01      0.00     99.39
03:17:00        all      0.37      0.00      0.18      0.01      0.00     99.44
03:18:00        all      0.36      0.00      0.17      0.01      0.00     99.47
03:19:00        all      0.36      0.00      0.16      0.01      0.00     99.47
03:20:00        all      0.43      0.00      0.19      0.01      0.00     99.38
Average:        all      0.49      0.00      0.23      1.80      0.00     97.47



在 03:09 和 03:11 期间，blocked 进程数为 2~3。
与此处 %iowait 的高值（6.77%、5.98%）时间一致，说明当时确实有进程被阻塞在 I/O 操作上

iotop -ao
iostat -xz 1 5

dmesg | grep -i nfs
mount | grep nfs

journalctl --since "03:08" --until "03:17"

```

LEO Updates:
```text
1.
LEO/MOD Update: Overall no issue found on OS layer, ESX Compute hardware, network Neutron router. Network CMS team continue to check the ACI fabric. New findings from Storage layer - see below. Checkpoints will continue from GCID MIM as now its the 3rd recent occurrence since June 3rd. 
 
All the occurrence reported so far
INC13150725 - 3rd June (03:12 - 03:15)
INC13192790 - 5th June (03:14 - 03:16)
INC13229197 - 7th June (Ongoing - MI) - (03:11 - 03:15)
 
New findings: Storage infra team checks 2 storage cluster and find write latency is spiking across all manila share volumes around the time for 3 VMs. Disk performance and IO look ok.
 
Next steps:  updates will be in next CP today at 9 UTC
1) A case is logged with vendor (Netapp), 2010412128 to which performance archive data from the cluster will be uploaded.  From OS side, no NFS error seen.
 
2) After the storage findings, we will know where the potential problem is -- accordingly we can also decide if additional packet capture is needed around 3 UTC next occurrence Tomm. 
 
3) Get confirmation from CISCO CMS that ACI fabric is clean on the endpoint -- so far good (Source IP: 100.81.53.245 & Source IP : 100.81.55.178 in the same project router, Destination IP 100.81.5.8) and (Source IP : 100.81.11.171, Destination IP 100.81.5.83)


2.
CP Update – 3AM UTC 8th June
No new issue observed, DB team confirmed that this issue happens every alternate day at 3 AM. A very short blip. 
NetApp has given a command that need to be executed when issue happens to collect necessary info. “statistics top client show -node <> -sort-key write_ops”
Vault jobs runs at 3AM every day however this may not be related to the issue.
NetApp to do further analysis -
Volume level info needs to be analyzed, corelated and provide findings.
Today’s performance data needs to be analyzed and provide findings
 
Guest OS did not observe any issue today, unlike last 2 days there were some CPU spikes.
Next CP - 3 AM UTC 9th June 2025


3. 
no further reconvene. issue stands resolved nd we have done monitoring from the weekend through today business hours around the time of previous occurence - no recurrence of LOB DB alerts.  If issue re-occurs then MI will be opened freshly. 
 
Workaround prevails: Based on the Grafana logs, the behavior appears to be similar to a previous incident from months ago for a different incident. Upon reviewing the data in Grafana for this incident, Storage team observed patterns indicating active data compression at the time of the issue. Workaround was implemented byStorage team to disable data compression on the storage clusters by 9:08 UTC on saturday, June 7th, when risk was mitigated.
 
GCID Storage team will continue to have the netapp cases for cross-reference and for more strategic fix possibly with newer version of the storage OS

```


CPU 使用率不高 但是iowait% 高说明什么

| 类别     | 典型问题                             |
| ------ | -------------------------------- |
| 存储性能   | 磁盘慢、SAN 延迟、SSD 饱和                |
| 网络存储   | NFS、Manila、GlusterFS 响应慢或卡顿      |
| 大型读写任务 | `tar`/`rsync`/`find`/`cron` 造成压力 |
| 程序异常   | 程序逻辑卡住某个 I/O 操作，比如日志写入卡住         |
| 挂载异常   | 某些挂载点（如 NFS）响应超时或断开              |

✅ 总结一句话：
高 iowait% + 低 CPU 使用率 = 存储或网络 I/O 成瓶颈，CPU 没活干。
你需要重点排查 磁盘 I/O 性能、网络存储状态、以及是否有进程频繁进行重 I/O 操作。


其他 

网络检查 

```
(vadbha009mw) vsa13137597:~ #
# sar -n EDEV -s 05:00 -e 05:10
Linux 5.14.21-150500.55.68-default (vsa13137597)        06/12/25        _x86_64_        (16 CPU)

05:00:00        IFACE   rxerr/s   txerr/s    coll/s  rxdrop/s  txdrop/s  txcarr/s  rxfram/s  rxfifo/s  txfifo/s
05:01:00           lo      0.00      0.00      0.00      0.00      0.00      0.00      0.00      0.00      0.00
05:01:00         eth0      0.00      0.00      0.00      0.00      0.00      0.00      0.00      0.00      0.00
05:01:00         eth1      0.00      0.00      0.00      0.00      0.00      0.00      0.00      0.00      0.00
05:01:00         eth2      0.00      0.00      0.00      0.40      0.00      0.00      0.00      0.00      0.00
05:02:00           lo      0.00      0.00      0.00      0.00      0.00      0.00      0.00      0.00      0.00
```