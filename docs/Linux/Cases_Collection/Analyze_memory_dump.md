

// download dump
```
cd /srv/memdumps
mkdir <vmname>; cd <vmname>
wget <provided_link> -O dump_<vmname>.tgz

lftp -u anonymous,user@user.de support-ftp.suse.com:/in

put dump_<vmname>.tgz

``


// Analyze dump
```
crash vmlinux.debug vmlinux.gz vsa12481793.vmss

crash > help
crash > dmesg
crash > ps |grep UN //search for uninterruptible sleep process. 
crash > sys


Other references: 

这些任务状态（Task State）通常指的是操作系统中进程或线程的不同状态，具体含义如下：

1. **RU**（Running，运行）：进程当前正在执行或等待执行，正在 CPU 上运行。
   
2. **IN**（Interruptible sleep，可中断睡眠）：进程正在等待某个事件的发生，一般情况下可以被信号唤醒，例如等待文件输入完成或网络数据到达。

3. **UN**（Uninterruptible sleep，不可中断睡眠）：进程正在等待一个不能被中断的事件，例如等待硬件 I/O 操作的完成。

4. **ZO**（Zombie，僵尸）：进程已经终止，但其父进程尚未调用 `wait()` 或 `waitpid()` 来获取其终止状态，因此其进程描述符仍然存在，但没有任何代码在执行。

5. **ST**（Stopped，停止）：进程被暂停执行，通常是由于接收到一个暂停信号（如 `SIGSTOP`）。

6. **TR**（Traced，跟踪）：进程正在被调试器（如 `gdb`）跟踪，处于被跟踪状态。

7. **DE**（Dead，死亡）：进程已经被终止，其进程描述符也已经被释放。

8. **SW**（Sleeping，睡眠）：进程正在等待某个事件的发生，但具体是可以中断还是不可中断的需要根据具体实现来确定，通常在 Linux 中不用于正常的进程状态。

9. **WA**（Waiting，等待）：进程正在等待某个事件的发生，与 IN 状态类似，但通常指的是等待进入内核的某种状态。

10. **PA**（Parked，停泊）：进程处于一种特殊的休眠状态，如在 FreeBSD 中，用于描述进程在休眠队列中等待条件满足的情况。

11. **ID**（Idle，空闲）：进程处于空闲状态，通常是指系统空闲进程，用于处理特定的空闲任务，如负载平衡或定时处理。

12. **NE**（New，新）：进程是一个新创建的进程，尚未开始执行。

这些状态描述了操作系统中进程或线程在不同操作和事件下的状态变化，对于理解系统的运行和进行故障排查非常有帮助。