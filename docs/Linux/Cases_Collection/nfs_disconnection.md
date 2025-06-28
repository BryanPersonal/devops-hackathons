

check NIC ring buffer 

ethtool -g eth0
```

(vaai24nza) cc02v015061:~ # cat /proc/sys/net/core/netdev_max_backlog
1000

当内核中断处理网络数据包的速度，快于协议栈处理的速度时，数据包会暂时存放在一个 backlog 队列中。这个参数就是 backlog 的最大容量。

✅ 举个通俗的例子：
你可以把这个 backlog 队列想象成一个「临时收发件箱」：

网络接口（网卡）把包扔进来；

系统的网络协议栈来 "处理邮件"（数据包）；

如果你处理不过来，信件就堆着，直到你慢慢处理；

这个收件箱最多能塞 1000 个包——就是这个参数设定的值。

🧪 为什么它重要？
如果 backlog 满了，新的数据包就会被丢弃，表现为：

rx_dropped 增高（即你之前看到的 rxdrop/s 增加）；

高网络流量时容易丢包；

应用层表现为连接断开、数据丢失、超时等。




(vaai24nza) cc02v015061:~ # sysctl net.core.rmem_max
net.core.rmem_max = 212992
当一个应用程序（或协议栈）来不及消费收到的数据包时，这些数据先会堆积在**接收缓冲区（receive buffer）**中。

如果 rmem_max 太小，在高吞吐场景下就可能出现：

套接字接收缓冲区爆满 → 丢包（特别是 UDP）

TCP 接收窗口变小 → 吞吐量下降

内核日志可能有 recv buffer overflow 错误
```