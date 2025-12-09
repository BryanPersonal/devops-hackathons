


✅ 总结检查思路：
On a VM, an example could be: `tcpdump -n -s 0 -i eth0 -w /tmp/${HOSTNAME}.pcap host <IP of vfiler>` 
`date +%T:%N; df -h`


From SUSE Case - https://scc.suse.com/support/cases/01590773
```
So, for the issue during vmotion, we do not have any data except sar. 
 
We would need tcpdump with nfs debug(rpcdebug -m rpc -s all; rpcdebug -m nfs -s all) captured during vmotion.
 
Please check if nfs debug is enabled:
# zcat /proc/config.gz | grep NFS_DEBUG
 
Should return 
CONFIG_NFS_DEBUG=y
 
Set:
# rpcdebug -v -m rpc -s all
# rpcdebug -v -m nfs -s all
 
Start tcpdump and initiate a vmotion. After that send the tcpdump as well as a new supportconifg and /var/log
 
Unset rpcdebug
# rpcdebug -v -m rpc -c all
# rpcdebug -v -m nfs -c all
 
 
For the df hang engineering did not spot anything in the available pcap file that would indicate an issue. Possibly the tcpdump was started after df was hanging, as there are not even retransmitted  packets. 
 
Can you do a test with another vmotion with tcpdump+rpcdebug? If the issue is reproduced, we then have the logs and traces for analysis.
```

`ss -tin | grep 2049` → 看 Send-Q 是否长期接近上限。

`/proc/sys/net/ipv4/tcp_wmem` → 确认 buffer 大小。

strace/pstack → 看应用线程是否阻塞在 write。

nfsstat → 验证 RPC 请求卡在客户端。


```
1️⃣ 关键字段解释（和 send buffer 有关的）

bytes_sent / bytes_acked

sent：应用写入并推给 TCP 的总字节数

acked：对端已经确认的字节数

如果两者差距很大 → send buffer 里堆积很多，可能已满

snd_wnd

当前 TCP 发送窗口（由对端通告，受对端接收能力和网络 RTT 影响）。

如果很小（几十 KB），说明对端“收不动”了 → 可能导致我们本地 send buffer 堵住。

cwnd

拥塞窗口，受网络拥塞控制影响。

delivery_rate / pacing_rate

发送数据速率估计。

lastsnd / lastrcv / lastack（毫秒）

距离上次发送 / 接收 / 收到 ACK 的时间。

如果这些值很大（数十万 ms，约几分钟）→ 长时间没有数据流动。
```

```
#!/bin/bash
# nfs_debug.sh - NFS/TCP send buffer 排查脚本
# 用法: ./nfs_debug.sh <NFS_SERVER_IP>

ETH=$1
NFS_SERVER=$2
PORT=2049
OUTDIR=/tmp/nfs_debug
mkdir -p $OUTDIR

TS=$(date +"%Y%m%d_%H%M%S")
OUTFILE="$OUTDIR/nfs_debug_$TS.log"

echo "===== NFS DEBUG SNAPSHOT @ $TS =====" | tee -a $OUTFILE

# 1. ss 检查 TCP 连接状态
echo -e "\n[SS -tinp for NFS]" | tee -a $OUTFILE
ss -tinp "( dport = :$PORT or sport = :$PORT )" | tee -a $OUTFILE

# 2. 查看发送/接收队列
echo -e "\n[Summary: Send-Q/Recv-Q]" | tee -a $OUTFILE
ss -tin "( dport = :$PORT or sport = :$PORT )" | \
awk '{print $1, $2, $3, $4, $5}' | tee -a $OUTFILE

# 3. 关联 PID
echo -e "\n[Processes using port $PORT]" | tee -a $OUTFILE
lsof -i :$PORT | tee -a $OUTFILE

# 4. 对相关 PID 执行 ps
for pid in $(lsof -t -i :$PORT | sort -u); do
  echo -e "\n[ps -Lf for PID $pid]" | tee -a $OUTFILE
  ps -Lf -p $pid | tee -a $OUTFILE

  echo -e "\n[strace -c (summary, 3s) for PID $pid]" | tee -a $OUTFILE
  timeout 3 strace -c -p $pid 2>&1 | tee -a $OUTFILE
done

# 5. 可选: 抓 tcpdump
timeout 30 tcpdump -i $ETH host $NFS_SERVER -nn -s 0 -vv -w $OUTDIR/nfs_$TS.pcap

echo -e "\n===== END SNAPSHOT =====" | tee -a $OUTFILE


```


Error:

```
2025-08-14T06:30:22.460940+00:00 cc02v019206 kernel: [T92772] nfs: server ms-cis-clmam-eu-de-2-prod-private-01-01-10-180-236-58.prod.clmam.gmp.eu-de-2.cloud.ppp not responding, still trying
2025-08-14T06:30:22.460940+00:00 cc02v019206 kernel: [T92772] nfs: server ms-cis-clmam-eu-de-2-prod-private-01-01-10-180-236-58.prod.clmam.gmp.eu-de-2.cloud.ppp not responding, still trying
2025-08-14T06:30:22.460986+00:00 cc02v019206 kernel: message repeated 9 times: [[T92772] nfs: server ms-cis-clmam-eu-de-2-prod-private-01-01-10-180-236-58.prod.clmam.gmp.eu-de-2.cloud.ppp not responding, still trying]
2025-08-14T07:15:55.240906+00:00 cc02v019206 kernel: [T12269] bpfilter: Loaded bpfilter_umh pid 12270
2025-08-14T06:30:22.460986+00:00 cc02v019206 kernel: message repeated 9 times: [[T92772] nfs: server ms-cis-clmam-eu-de-2-prod-private-01-01-10-180-236-58.prod.clmam.gmp.eu-de-2.cloud.ppp not responding, still trying]
2025-08-14T07:15:55.240906+00:00 cc02v019206 kernel: [T12269] bpfilter: Loaded bpfilter_umh pid 12270
```

Analysis:

```

操作系统Load在06:30左右骤增，同时存在NFS retrans/s （每秒重传次数）： 1-4/s 并且NFS call瞬间到达峰值。
后面一直出现 retrans
```


```

tcpdump -i eth0 host 10.180.236.58 and port 2049 -w nfs_capture.pcap

```

```
sadf -g sa20250814 -s 06:15:00 -e 08:30:00 -- -n NFS > /tmp/cc02v019206_nfs_call.svg


# CPU utilization high, %iowait remains low  远程 NFS 阻塞不会增加 %iowait
# Remote storage looks like being the curprit 

(vadb02p2c) cc02v019206:/var/log/sa #
#  sar -u -f sa20250814 -s 06:15:00 -e 08:30:00
Linux 6.4.0-150600.23.53-default (cc02v019206)  08/14/25        _x86_64_        (120 CPU)

06:15:03        CPU     %user     %nice   %system   %iowait    %steal     %idle
06:16:03        all      1.00      0.00      0.18      0.00      0.00     98.82
06:17:03        all      0.99      0.00      0.16      0.00      0.00     98.85
06:18:03        all      1.03      0.00      0.17      0.01      0.00     98.79
06:19:03        all      1.05      0.00      0.17      0.01      0.00     98.76
06:20:03        all      1.04      0.00      0.18      0.01      0.00     98.77
06:20:33        all      2.16      0.00      0.42      0.05      0.00     97.36
06:21:03        all      1.05      0.00      0.20      0.00      0.00     98.75
06:22:03        all      1.09      0.00      0.17      0.00      0.00     98.74
06:23:03        all      1.01      0.00      0.17      0.01      0.00     98.80
06:24:01        all      1.03      0.00      0.17      0.01      0.00     98.79
06:25:03        all      2.46      0.00      0.44      0.00      0.00     97.10
06:26:03        all      1.34      0.00      0.20      0.01      0.00     98.45
06:27:03        all      1.35      0.00      0.20      0.01      0.00     98.44
06:28:03        all      0.64      0.00      0.16      0.03      0.00     99.17
06:29:08        all     12.61      0.00      5.30      1.62      0.00     80.48
06:30:08        all     41.40      0.00     16.32      0.57      0.00     41.71
06:30:38        all     63.55      0.00     24.50      0.00      0.00     11.95
06:31:00        all     72.56      0.00     27.44      0.00      0.00      0.00
06:32:00        all     73.26      0.00     26.74      0.00      0.00      0.00
06:33:00        all     73.74      0.00     26.26      0.00      0.00      0.00
06:34:00        all     74.09      0.00     25.91      0.00      0.00      0.00
06:35:01        all     74.34      0.00     25.66      0.00      0.00      0.00
06:36:00        all     74.29      0.00     25.71      0.00      0.00      0.00
06:37:00        all     74.54      0.00     25.46      0.00      0.00      0.00
06:38:00        all     74.40      0.00     25.60      0.00      0.00      0.00
06:39:00        all     74.93      0.00     25.07      0.00      0.00      0.00
06:40:00        all     74.55      0.00     25.44      0.00      0.00      0.01
06:40:30        all     74.62      0.00     25.38      0.00      0.00      0.00
06:41:00        all     74.80      0.00     25.20      0.00      0.00      0.00
06:42:00        all     68.18      0.00     23.50      0.17      0.00      8.15
06:43:00        all     28.86      0.00     10.17      1.37      0.00     59.60
06:44:01        all      9.76      0.00      3.79      1.66      0.00     84.79
06:45:00        all      7.72      0.00      3.00      1.66      0.00     87.62
06:46:00        all      7.59      0.00      3.02      1.66      0.00     87.73
06:47:00        all      7.55      0.00      2.98      1.66      0.00     87.81

```

```
06:14:01       call/s retrans/s    read/s   write/s  access/s  getatt/s
06:15:03       202.15      0.00      3.05     71.65     44.09     63.81
06:16:03       101.45      0.00      0.27     26.74     29.82     36.06
06:17:03       101.05      0.00      0.27     22.84     32.35     34.47
06:18:03       119.34      0.00      0.65     44.66     31.32     33.80
06:19:03       125.22      0.00      0.32     42.39     34.77     36.76
06:20:03       151.79      0.00      0.27     64.21     38.12     36.55
06:20:33      1180.30      0.00    147.10    974.33     11.87     40.30
06:21:03       113.03      0.00      0.40     22.55     44.29     35.70
06:22:03       258.17      0.00    157.77     35.52     27.62     29.57
06:23:03       156.95      0.00      1.85     79.05     30.52     36.40
06:24:01       111.60      0.00      0.23     28.97     33.14     37.88
06:25:03       155.54      0.00      0.35     33.18     41.71     61.80
06:26:03       100.60      0.00      0.22     27.80     27.80     36.31
06:27:03       104.22      0.00      1.10     33.04     27.59     34.06
06:28:03        78.90      0.00      8.68     44.57      5.89     16.55
06:29:08         0.66      1.96      0.00      0.06      0.00      0.14
06:30:08         1.70      0.00      0.00      1.05      0.00      0.08
06:30:38         0.80      4.26      0.00      0.00      0.00      0.17
06:31:00         0.37      0.00      0.00      0.00      0.00      0.00
06:32:00         0.52      2.14      0.00      0.00      0.00      0.03
06:33:00         0.57      0.00      0.00      0.00      0.02      0.08
06:34:00         0.48      2.13      0.00      0.00      0.00      0.02
06:35:01         0.57      2.09      0.00      0.00      0.03      0.05
06:36:00         0.73      0.00      0.00      0.00      0.03      0.09
06:37:00         0.48      2.13      0.00      0.00      0.00      0.00
06:38:00         0.80      2.13      0.00      0.00      0.03      0.10
```

```
%iowait 的含义

%iowait 表示 CPU 空闲但等待本地块设备（disk/block device）完成 IO 的时间。

它只反映本地 IO 阻塞，例如：

本地磁盘读写慢

SSD/HDD 响应延迟

CPU 空闲、等待磁盘返回结果时，%iowait 会升高。

关键点：网络 IO（包括远程 NFS）不会直接计入 %iowait，因为 CPU 可能被内核线程忙着处理阻塞逻辑。

2️⃣ 远程 NFS 阻塞发生时的情况

假设一个进程访问远程 NFS：

发起 NFS RPC 请求（TCP/UDP 网络）

远程 NFS 服务器响应慢或网络延迟

内核将进程置为 TASK_UNINTERRUPTIBLE（不可中断阻塞）

CPU 会参与：

调度阻塞队列

处理重试 RPC、管理挂起请求

网络栈处理 TCP retrans

CPU 在做这些内核工作，不是空闲等待本地磁盘 IO

3️⃣ 为什么 %iowait 低，但 CPU 占用高

CPU 正在忙于 内核处理阻塞任务，所以 %usr/%sys 上升

CPU 并没有空闲等待本地 IO → %iowait 低

进程阻塞在网络 IO 上 → 系统 load 上升（load = running + blocked）

简化理解：

阻塞类型	CPU 使用率	%iowait	load	说明
本地磁盘慢	低/中	高	高	CPU 等待 IO
远程 NFS 阻塞	高	低	高	CPU 忙于处理阻塞
网络/CPU 密集	高	低	高	CPU 真正忙
4️⃣ 实际表现

结合你给的 sar 数据：

06:30:38  %usr=63.55  %sys=24.50  %iowait=0.00
06:31:00  %usr=72.56  %sys=27.44  %iowait=0.00


CPU 已经接近满载，但 %iowait 很低 → 并不是本地磁盘问题

kernel 日志显示 NFS “not responding” → 很可能是 远程 NFS 阻塞导致 load 上升和 CPU 忙碌

💡 总结核心逻辑：

%iowait 只算本地块设备 IO 等待

远程 NFS 阻塞不会增加 %iowait

但系统 load 会升高，CPU 却在忙处理内核阻塞逻辑

所以 CPU 高 + iowait 低 → 远程 NFS 或网络 IO 阻塞

```


从你给的分析来看，有几个关键点直接指向 **NFS/网络层面的问题**，而不是操作系统（OS）本身的性能瓶颈：

---

**1. 关键指标和现象表明瓶颈在 NFS 或网络层**

* **NFS 内核日志**：
  出现

  ```
  nfs: server ... not responding, still trying
  ```

  这是 NFS 客户端在等待远端 NFS 服务器响应的明确信号，通常与网络不可达、延迟过大或服务器处理慢有关。

* **tcpdump 分析**：

  * 多次出现 **TCP Keep-Alive** 包和 **长时间空隙（> 5\~10 秒）** 才有下一个数据包，这不是 OS 处理慢造成的，而是客户端在等待远端回复。
  * 正常 RTT 在微秒级，但此处出现秒级延迟 → 数据已经发出去，但没有及时收到服务器返回。

* **sar 数据**：

  * **NFS call/s 接近 0** → 应用层已经没有新的请求或请求发不出去。
  * **retrans/s 增加** → TCP 层在重传丢失的包，这是典型的网络质量问题或远端延迟问题。
  * CPU 使用率正常或无显著变化，说明 OS 并没有被本地计算任务压垮。

---

**2. 为什么 OS Load 会升高**

* Linux 的 **Load Average** 不只是 CPU 使用率，还包括：

  1. 正在运行的进程（R 状态）
  2. **等待 I/O 的进程（D 状态，Uninterruptible Sleep）**

* 当 NFS 请求迟迟没有返回时，访问 NFS 文件的进程会进入 **D 状态**（等待磁盘/网络 I/O），这些进程虽然不消耗 CPU，但会计入 Load Average。

* 所以即使 CPU 占用低，Load Average 也会高，因为有很多任务在等 NFS 响应。
  在你的描述中：

  * iowait 升高
  * blocked tasks 增加
  * NFS call/s 下降
    → 正是 NFS I/O 阻塞导致的 **“高 load + 低 CPU”** 场景。

---

**简化理解**：

* **瓶颈指标**：长时间 TCP 空隙、NFS not responding、retrans/s 升高、NFS call/s 下降
* **Load 升高原因**：大量进程卡在 NFS I/O 等待 → Load 包含 D 状态进程 → CPU 可能空闲但 Load 高

---

如果你愿意，我可以帮你画一个 **“NFS 网络瓶颈 → 应用阻塞 → OS 高 Load”** 的因果流程图，这样关系会更清晰。
你要我画吗？

你提到 **NFS call 在 6:30 左右骤增**，这种现象很可能和远端 NFS 服务状态或网络状况有关，但我们需要仔细分析原因。

---

## **1️⃣ NFS call 突增的可能原因**

1. **远端 NFS 不可用 / 响应延迟**

   * 当 NFS 服务端不可达或处理慢时：

     * 客户端的 RPC 请求无法及时得到响应
     * TCP 层会不断重试（retransmission）
     * 高层 NFS 调用在等待回应时会积累 → 报表中 NFS call 突增
   * 特征：

     * Keep-Alive 包间隔异常增长或频繁触发
     * 抓包中看到重复 XID 请求（重传）

2. **网络问题**

   * 丢包、延迟或路由抖动导致 RPC 请求超时
   * 客户端连续发请求重试 → NFS call 突增

3. **客户端应用层负载**

   * 突然大量 I/O 请求（如批量读取或写入）
   * 也可能导致 NFS call 突增，但通常伴随 CPU / I/O 使用率升高

4. **NFS 锁争用（Lock / State）**

   * 如果多个客户端竞争同一文件，锁等待会导致 RPC 调用积压
   * 突发锁等待也会表现为 NFS call 突增

---

## **2️⃣ 判断是否是远端不可用**

结合抓包和监控可以验证：

1. **抓包分析**

   * 查看 6:30 左右的 RPC 请求响应时间
   * 如果响应延迟明显增加或重复请求（XID 重复） → 说明服务端不可用或阻塞

2. **客户端日志**

   * `nfsstat -c` 或系统日志 `/var/log/messages` / `dmesg`
   * 常见错误：

     ```
     nfs: server not responding, still trying
     nfs: server <ip> timed out
     ```
   * 出现这些日志同时 NFS call 突增 → 远端不可用几乎可以确认

3. **CPU / I/O 监控**

   * 服务端 CPU 或存储 I/O 过载也会导致响应慢
   * 客户端持续重试 → NFS call 激增

---

### **3️⃣ 简化理解**

* **NFS call 突增 ≈ 客户端发送更多 RPC 请求尝试完成操作**
* **最常见原因**：

  1. 远端 NFS 服务不可用或阻塞
  2. 网络延迟/丢包
* **次要原因**：

  * 突发高负载 I/O
  * 锁争用导致阻塞

---

如果你愿意，我可以帮你画一张 **NFS call 突增与远端不可用 / Keep-Alive / RPC 重传的时间线示意图**，直观说明为什么 6:30 出现骤增。

你希望我画吗？

