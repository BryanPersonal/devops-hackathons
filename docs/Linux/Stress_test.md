

```
iperf3 -c 10.180.112.139 -P 8 -t 300

[ ID] Interval           Transfer     Bitrate         Retr
[  5]   0.00-300.00 sec  92.8 GBytes  2.66 Gbits/sec  150945             sender
[  5]   0.00-300.03 sec  92.8 GBytes  2.66 Gbits/sec                  receiver
[  7]   0.00-300.00 sec  76.5 GBytes  2.19 Gbits/sec  137764             sender
[  7]   0.00-300.03 sec  76.5 GBytes  2.19 Gbits/sec                  receiver
[  9]   0.00-300.00 sec  67.1 GBytes  1.92 Gbits/sec  127412             sender
[  9]   0.00-300.03 sec  67.1 GBytes  1.92 Gbits/sec                  receiver
[ 11]   0.00-300.00 sec  99.5 GBytes  2.85 Gbits/sec  153948             sender
[ 11]   0.00-300.03 sec  99.5 GBytes  2.85 Gbits/sec                  receiver
[ 13]   0.00-300.00 sec   103 GBytes  2.96 Gbits/sec  155473             sender
[ 13]   0.00-300.03 sec   103 GBytes  2.96 Gbits/sec                  receiver
[ 15]   0.00-300.00 sec  94.2 GBytes  2.70 Gbits/sec  153223             sender
[ 15]   0.00-300.03 sec  94.2 GBytes  2.70 Gbits/sec                  receiver
[ 17]   0.00-300.00 sec  74.6 GBytes  2.13 Gbits/sec  133609             sender
[ 17]   0.00-300.03 sec  74.6 GBytes  2.13 Gbits/sec                  receiver
[ 19]   0.00-300.00 sec  80.9 GBytes  2.32 Gbits/sec  143795             sender
[ 19]   0.00-300.03 sec  80.9 GBytes  2.32 Gbits/sec                  receiver
[SUM]   0.00-300.00 sec   689 GBytes  19.7 Gbits/sec  1156169             sender
[SUM]   0.00-300.03 sec   689 GBytes  19.7 Gbits/sec                  receiver
```



1. 16 
2. 0
3. 26  Rollback from Dst - ethtool -G eth0 rx 1024 rx-jumbo 512 tx 512
4. 31-5   Rollback from Source - ethtool -G eth0 rx 1024 rx-jumbo 512 tx 512