
Symptoms:
- VM failed by soft rebooting by the GMP (GuestOS VM Orchestrator)

```
2025-05-10T21:28:46.241472+00:00 vsajg91001 joschyd.pl[3962135]: 2025-05-10 21:28:46: [check-chronyd-service] killed
2025-05-10T21:28:46.241523+00:00 vsajg91001 systemd[1]: Stopped Apply settings from /etc/sysconfig/keyboard.
2025-05-10T21:28:46.242135+00:00 vsajg91001 systemd[1]: klog.service: Deactivated successfully.
2025-05-10T21:28:46.242401+00:00 vsajg91001 systemd[1]: Stopped Early Kernel Boot Messages.
2025-05-10T21:28:46.244091+00:00 vsajg91001 dumppyrunner[2946210]: Unmounting dumppy... not mounted
2025-05-10T21:28:46.244933+00:00 vsajg91001 systemd[1]: Stopping EMC NetWorker. A backup and restoration software package....
2025-05-10T21:28:46.245951+00:00 vsajg91001 systemd[1]: Stopping Authorization Manager...
2025-05-10T21:28:46.246648+00:00 vsajg91001 systemd[1]: Stopping Prometheus exporter for machine metrics...
2025-05-10T21:28:46.248939+00:00 vsajg91001 systemd[1]: Stopping BladeLogic Remote System Call Daemon...
2025-05-10T21:50:54.075957+00:00 vsajg91001 systemd[1]: Queued start job for default target Multi-User System.
2025-05-10T21:50:54.076066+00:00 vsajg91001 systemd[1]: haveged.service: Main process exited, code=exited, status=1/FAILURE
2025-05-10T21:50:54.076076+00:00 vsajg91001 systemd[1]: haveged.service: Failed with result 'exit-code'.
2025-05-10T21:50:54.076079+00:00 vsajg91001 systemd[1]: Stopped Entropy Daemon based on the HAVEGE algorithm.
2025-05-10T21:50:54.076081+00:00 vsajg91001 systemd[1]: systemd-journald.service: Deactivated successfully.
2025-05-10T21:50:54.076084+00:00 vsajg91001 systemd[1]: Mounted Kernel Trace File System.
2025-05-10T21:50:54.076086+00:00 vsajg91001 systemd[1]: Finished Create List of Static Device Nodes.
2025-05-10T21:50:54.076089+00:00 vsajg91001 systemd[1]: modprobe@configfs.service: Deactivated successfully.
2025-05-10T21:50:54.076094+00:00 vsajg91001 systemd[1]: Finished Load Kernel Module configfs.
2025-05-10T21:50:54.076098+00:00 vsajg91001 systemd[1]: modprobe@efi_pstore.service: Deactivated successfully.
2025-05-10T21:50:54.076100+00:00 vsajg91001 systemd[1]: Finished Load Kernel Module efi_pstore.
2025-05-10T21:50:54.076104+00:00 vsajg91001 systemd[1]: Finished Remount Root and Kernel File Systems.
2025-05-10T21:50:54.076107+00:00 vsajg91001 systemd[1]: Finished Load Kernel Modules.
2025-05-10T21:50:54.076110+00:00 vsajg91001 systemd[1]: Started sysctl monitoring with BPF.
2025-05-10T21:50:54.076112+00:00 vsajg91001 kernel: [    0.000000][    T0] Linux version 5.14.21-150500.55.100-default (geeko@buildhost) (gcc (SUSE Linux) 7.5.0, GNU ld (GNU Binutils; SUSE Linux Enterprise 15) 2.43.1.20241209-150100.7.52) #1 SMP PREEMPT_DYNAMIC Thu Apr 3 17:03:15 UTC 2025 (a9fe8f3)
2025-05-10T21:50:54.076112+00:00 vsajg91001 systemd[1]: Reached target Swaps.
2025-05-10T21:50:54.076128+00:00 vsajg91001 kernel: [    0.000000][    T0] Command line: BOOT_IMAGE=/boot/vmlinuz-5.14.21-150500.55.100-default root=/dev/mapper/systemVG-LVRoot splash=0 log_buf_len=8M consoleblank=0 nomodeset ipv6.disable=1 fsck.repair=yes transparent_hugepage=never
```

Plaese looks 检查是否某个 service 的 ExecStop 或 ExecStopPost 脚本卡住了（例如 EMC NetWorker、BladeLogic 等外部集成服务经常可能引发问题）。
这个22分钟的间隔表明系统在这段时间没有完成关机流程或挂起了某些操作。系统可能在尝试停止某个服务或卸载某个资源（如网络服务或挂载点）时卡住，最终才被强制重启或通过外部手段恢复（如云平台强制重启）。
```
2025-05-10T21:28:46.248939+00:00 vsajg91001 systemd[1]: Stopping BladeLogic Remote System Call Daemon...
2025-05-10T21:50:54.075957+00:00 vsajg91001 systemd[1]: Queued start job for default target Multi-User System.
```


Other Analysis:
```
Hi Vlad,

There are no eye-catching logs, however, the SAR data suggests, that the VM ran into a congestion around 20:36.
See how the load avg. jumps underneath the ceiling after 20:38

00:00:00      runq-sz  plist-sz   ldavg-1   ldavg-5  ldavg-15   blocked
20:27:00            1      5431      1.62      2.28      2.30         0
20:28:00            3      5434      1.36      2.09      2.23         0
20:29:00            2      5435      2.82      2.55      2.39         0
20:30:00            9      5436      3.20      2.86      2.52         0
20:31:00            2      5450      4.26      3.34      2.71         0
20:32:00           10      5456      4.81      3.85      2.94         0
20:33:00            1      5451      3.98      3.95      3.04         0
20:34:00            1      5451      3.21      3.89      3.08         0
20:35:00            2      5451      2.95      3.84      3.12         0
20:36:00          140      5448     20.41      8.29      4.67         0
20:37:00            2      5430     23.13     10.74      5.71         2
20:38:00            5      5444     47.30     19.75      9.11         4
20:39:00            7      5465     62.77     29.16     13.01         8
20:40:00           15      5461     71.94     37.84     17.00         2
20:41:00           19      5493     80.96     46.55     21.30         0
20:42:00            6      5525     81.82     53.31     25.22         1
20:43:00            9      5548     83.90     59.04     28.94         1
20:44:00           13      5500     85.39     63.89     32.49         0
20:45:00           17      5516     90.62     69.26     36.30         2
.
.
21:12:00            9      5710    131.16    122.82    103.84         8
21:13:00           10      5719    127.48    123.23    105.17         5
21:14:00            9      5730    127.20    123.83    106.51         4
21:15:00           15      5727    130.36    125.18    108.05         0
21:16:00            3      5738    129.38    126.07    109.44         3
21:17:00           10      5712    129.59    126.55    110.64         3
21:18:00            8      5717    130.54    127.39    111.93         1
21:19:00           17      5732    136.86    129.69    113.68         0
21:20:00           28      5727    143.45    132.78    115.74         4
21:21:00           41      5740    156.21    138.21    118.66         6
21:22:00           50      5753    170.96    145.55    122.40         4
21:23:00           58      5754    179.21    152.42    126.21         7
21:24:00           65      5763    189.18    160.08    130.48         3
21:25:00           13      5762    156.05    155.76    130.84         1
21:26:00           24      5775    154.49    155.23    132.22         4
21:27:00           31      5776    159.15    156.42    134.07         7
21:28:00           41      5793    168.50    159.47    136.51         4
21:28:46           53      5367    175.89    162.68    138.68         4
Average:           10      5467      6.98      6.71      5.70         0

This alone would probably explain the slow/stuck reboot. OTOH, this is a 96 core VM,
So even a load avg. of 180 should not lead to a significant slowdown.
As a matter of fact, the shutdown proceduce appears to proceed reasonably fast.
Then it just stops after logging this
2025-05-10T21:28:46.248939+00:00 vsajg91001 systemd[1]: Stopping BladeLogic Remote System Call Daemon...

After this we also don’t have any further SAR data, so if is probably safe to assume, that
After 20:28:46 the VM locked up completely, presumably as a consequence of the congestion
That started ~1h earlier.

-	Looking at the CPU stats, we see a father high IO and sys wait on a number of CPUs
00:00:00        CPU      %usr     %nice      %sys   %iowait    %steal      %irq     %soft    %guest    %gnice     %idle
20:36:00        all      1.31      0.00      0.11      1.85      0.00      0.00      0.04      0.00      0.00     96.69
20:36:00          4      1.15      0.00      0.12     29.58      0.00      0.00      0.08      0.00      0.00     69.06
20:36:00          5      1.25      0.00      0.07     29.69      0.00      0.00      0.03      0.00      0.00     68.96
20:36:00          6      1.20      0.00      0.07      0.00      0.00      0.00      0.02      0.00      0.00     98.72
20:36:00          7      4.07      0.00      0.13      0.00      0.00      0.00      0.00      0.00      0.00     95.80
20:36:00          8      1.33      0.00      0.08     17.22      0.00      0.00      0.00      0.00      0.00     81.36
20:36:00         21      1.19      0.00      0.05      4.04      0.00      0.00      0.00      0.00      0.00     94.73
20:36:00         50      1.40      0.00      0.17     29.69      0.00      0.00      0.00      0.00      0.00     68.74
20:36:00         85      1.02      0.00      0.15     39.21      0.00      0.00      0.00      0.00      0.00     59.63

20:38:00          4      0.18      0.00      0.05     73.78      0.00      0.00      0.02      0.00      0.00     25.97
20:38:00         25      0.15      0.00      0.07     73.78      0.00      0.00      0.00      0.00      0.00     26.01

20:39:00         49      0.08      0.00      0.07     99.85      0.00      0.00      0.00      0.00      0.00      0.00
20:39:00         50      0.07      0.00      0.02     99.92      0.00      0.00      0.00      0.00      0.00      0.00
20:39:00         70     71.10      0.00     28.90      0.00      0.00      0.00      0.00      0.00      0.00      0.00


20:49:00         47      0.75      0.00      0.10     36.52      0.00      0.00      0.00      0.00      0.00     62.63
20:49:00         48     10.88      0.00     89.12      0.00      0.00      0.00      0.00      0.00      0.00      0.00
20:49:00         49     72.02      0.00     27.98      0.00      0.00      0.00      0.00      0.00      0.00      0.00
20:49:00         50     37.83      0.00     15.05      0.00      0.00      0.00      0.00      0.00      0.00     47.13
20:49:00         51     27.27      0.00     10.29      0.00      0.00      0.00      0.00      0.00      0.00     62.44

20:51:00         25     71.48      0.00     28.52      0.00      0.00      0.00      0.00      0.00      0.00      0.00
20:51:00         26      0.69      0.00      0.18      0.00      0.00      0.00      0.00      0.00      0.00     99.13
20:51:00         27     71.68      0.00     28.32      0.00      0.00      0.00      0.00      0.00      0.00      0.00
20:51:00         28     76.52      0.00     23.48      0.00      0.00      0.00      0.00      0.00      0.00      0.00
20:51:00         29     72.00      0.00     28.00      0.00      0.00      0.00      0.00      0.00      0.00      0.00
20:51:00         30     71.50      0.00     28.50      0.00      0.00      0.00      0.00      0.00      0.00      0.00
20:51:00         31     71.73      0.00     28.27      0.00      0.00      0.00      0.00      0.00      0.00      0.00
20:51:00         32      0.94      0.00      0.20      0.00      0.00      0.00      0.00      0.00      0.00     98.86
20:51:00         33     72.35      0.00     27.65      0.00      0.00      0.00      0.00      0.00      0.00      0.00
20:51:00         34     70.13      0.00     29.87      0.00      0.00      0.00      0.00      0.00      0.00      0.00
20:51:00         35     72.33      0.00     27.67      0.00      0.00      0.00      0.00      0.00      0.00      0.00
20:51:00         36     71.37      0.00     28.63      0.00      0.00      0.00      0.00      0.00      0.00      0.00
20:51:00         37     50.34      0.00     23.87      0.00      0.00      0.00      0.00      0.00      0.00     25.79
20:51:00         38     72.23      0.00     27.77      0.00      0.00      0.00      0.00      0.00      0.00      0.00
20:51:00         39     71.93      0.00     28.07      0.00      0.00      0.00      0.00      0.00      0.00      0.00

This correclates with the high load avg. – in addition could point to an infrastructure issue.
This does definitely not belong to CIEA.
It’s either an OS issue or the HV starved the VM.

Any further OS analysis will be inconclusive, though, there are no meaningful logs besides
Sar data., and we do not have a mem dump.

```