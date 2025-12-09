### 心路历程
1. 查看logserver系统的load很高(CPU/IO/Network)都正常，很多sleeping 进程和一些僵尸进程。Kernel日志在下面列出了
1. 发现系统5K以上的rsync的进程，定位到了生成rsync进程的程序并找到对应的shell。
1. 检查shell脚本发现了脚本有文件锁的机制，也就是说如果一个rsync进程没有停止，其他进程会处于sleeping。 解释了为什么有特别多的rsync进程在uninterruptive sleeping
1. 打开对应lock文件找到进程id  `/var/lock/clearlogs-sudo.lock`  PS: `/var/lock/` symlinked to `/run/lock` **发现是logserver本身的clearlog sudo服务的进程卡住了**. 
1. 于是立刻定位去查了logserver clearlog sudo的服务systemd日志，发现了整个问题的根源。
1. 最终增加了NFS容量后，load骤降, 解决了问题

TBD: 
- Logserver 上的日志如何清理的？
- Lockfile 是如何产生，在以后设计其他的脚本或应用程序时候，如何应用同样的思想？
- 再去阅读clearlog.sh 筛出可取部分并进行测试

```
[Sep 2 16:13] RPC: fragment too large: 50399744
[  +5.342804] RPC: fragment too large: 50399744
[Sep 2 16:14] RPC: fragment too large: 369295618
```

RCA logs
```
Sep 02 16:03:19 vsa9360639 clearlogs.sh[11208]: rsync: mkstemp "/var/log/sudoshell/vsa9360639/SUDOSH/.gmp_cis_vulscan_eudp-gmp_cis_vulscan_eudp-script-1690647009-7rV2RAFLTBnjFZfj.bz2.Z2NGPF" failed: No space left on device (28)
Sep 02 16:03:19 vsa9360639 clearlogs.sh[11208]: rsync: mkstemp "/var/log/sudoshell/vsa9360639/SUDOSH/.gmp_cis_vulscan_eudp-gmp_cis_vulscan_eudp-script-1690647015-C5RUF3jiyijSA5hD.bz2.S79JJR" failed: No space left on device (28)
Sep 02 16:03:19 vsa9360639 clearlogs.sh[11208]: rsync: mkstemp "/var/log/sudoshell/vsa9360639/SUDOSH/.gmp_cis_vulscan_eudp-gmp_cis_vulscan_eudp-script-1690647030-jY6yuohmixFNeQnT.bz2.u0ZYD3" failed: No space left on device (28)
Sep 02 16:03:19 vsa9360639 clearlogs.sh[11208]: rsync: mkstemp "/var/log/sudoshell/vsa9360639/SUDOSH/.gmp_cis_vulscan_eudp-gmp_cis_vulscan_eudp-script-1690647035-I6AxGKkZLBTX0h29.bz2.x8Pmyf" failed: No space left on device (28)
Sep 02 16:03:19 vsa9360639 clearlogs.sh[11208]: rsync: mkstemp "/var/log/sudoshell/vsa9360639/SUDOSH/.gmp_cis_vulscan_eudp-gmp_cis_vulscan_eudp-script-1690647051-ZS94Ogs5SOqzCL3v.bz2.Z0PWsr" failed: No space left on device (28)
Sep 02 16:03:19 vsa9360639 clearlogs.sh[11208]: rsync: mkstemp "/var/log/sudoshell/vsa9360639/SUDOSH/.gmp_cis_vulscan_eudp-gmp_cis_vulscan_eudp-script-1690647056-Pala0U3golXvlbjJ.bz2.rsqDnD" failed: No space left on device (28)
Sep 02 16:03:19 vsa9360639 clearlogs.sh[11208]: rsync: mkstemp "/var/log/sudoshell/vsa9360639/SUDOSH/.gmp_cis_vulscan_eudp-gmp_cis_vulscan_eudp-script-1690647075-RavYlgrmZoP1jvqz.bz2.BakuiP" failed: No space left on device (28)
```
### Issue description:
- CPU 8 Core, high load, lots of sleeping processes
- CPU/IO/Mem/Network activity are good and no zombie  
- Rsync process are in sleeping. Some of them are more than 24/48 hours

zombie process
: if the parent decides not to wait for the child's termination and executes its subsequent task, then at the termination of the child, the exit status is not read. Hence, there remains an entry in the process table even after the termination of the child. This state of the child process is known as the Zombie state

### Issue fix
```
# List process in status D. 
ps -aux --sort=-start_time| awk '$8 == "D"'|grep server |head -5

# Watch uninterruptible sleep state process. (Usual processes are "blocked" or waiting on IO)
watch -n 5 'ps -aux --sort=-start_time| awk '\''$8 == "D"'\''|grep server |wc -l'
(backslashes (\) are used to escape the single quotes (') within the AWK script. This is necessary because we are already using single quotes to enclose the entire watch command, and we want to use single quotes within the AWK script to define its string.)

# kill all zombie process (which didn't work in this case)
ps aux | awk '$8 == "Z"' |awk '{print $2}' |xargs sudo kill -9

# Side note: after killing sudosh rsync sessions, those process came into zombie process. Killing zombie process didn't work and kill the parent process fixed the issue as demonstrated below. 

# kill process with status D from order to latest date was the plan, however, after cleaning D(uninterruptive sleeping proess) on Aug 23th then load suddenly dropped.
# Usually process with status D shouldn't be deleted.
ps -aux | awk '$8 == "D"' | grep Aug23 | awk '{print $2}'

> ps -aux | awk '$8 == "D"' | grep Aug23
root      1943  0.0  0.0  20856  3100 ?        D    Aug23   0:00 rsync --server -blogDtpRze.LsfxC --backup-dir BACKUP --suffix=_2023-08-23_23:00:01 --remove-sent-files . /var/log/auditlog/LDAP/vsa9394928
root      3024  0.0  0.0  20856  3220 ?        D    Aug23   0:00 rsync --server -blogDtpRze.LsfxC --backup-dir BACKUP --suffix=_2023-08-23_13:00:01 --remove-sent-files . /var/log/auditlog/LDAP/vsa9394928
root      5201  0.0  0.0  20856  3360 ?        D    Aug23   0:00 rsync --server -blogDtpRze.LsfxC --backup-dir BACKUP --suffix=_2023-08-23_10:00:02 --remove-sent-files . /var/log/auditlog/LDAP/vsa9394928
root      6282  0.0  0.0  20856  3192 ?        D    Aug23   0:00 rsync --server -blogDtpRze.LsfxC --backup-dir BACKUP --suffix=_2023-08-23_16:00:01 --remove-sent-files . /var/log/auditlog/LDAP/vsa9394928
root      7161  0.0  0.0  20856  3140 ?        D    Aug23   0:00 rsync --server -blogDtpRze.LsfxC --backup-dir BACKUP --suffix=_2023-08-23_20:00:02 --remove-sent-files . /var/log/auditlog/LDAP/vsa9394928
```


```
> top
top - 08:30:25 up 3 days, 13:53,  1 user,  load average: 80.49, 80.24, 80.09
Tasks: 655 total,   2 running, 653 sleeping,   0 stopped,   0 zombie
%Cpu(s):  7.0 us,  7.9 sy,  0.0 ni, 85.0 id,  0.0 wa,  0.0 hi,  0.2 si,  0.0 st
KiB Mem:  16391472 total,  6140184 used, 10251288 free,   239856 buffers
KiB Swap:  8388604 total,        0 used,  8388604 free.  4105972 cached Mem
```

### Logs
```
# the sudo ones are child process. The right hunging parent proess needs to be cleaned
(logsrv01-eude1-cis-test) i577081@vsa9360639:~>
> ps -edfa | grep "sudo rsync" | awk '{print $2}' |xargs ps -o pid,state,cmd -p
  PID S CMD
 1839 S sudo rsync --server -blogDtpRze.LsfxC --backup-dir BACKUP --suffix=_2023-08-23_23:00:01 --remove-sent-files . /var/log/auditlog/LDAP/vsa9394928
 2928 S sudo rsync --server -blogDtpRze.LsfxC --backup-dir BACKUP --suffix=_2023-08-23_13:00:01 --remove-sent-files . /var/log/auditlog/LDAP/vsa9394928
 3210 S sudo rsync --server -blogDtpRze.LsfxC --backup-dir BACKUP --suffix=_2023-08-25_17:00:01 --remove-sent-files . /var/log/auditlog/LDAP/vsa9394928
 3570 S sudo rsync --server -blogDtpRze.LsfxC --backup-dir BACKUP --suffix=_2023-08-24_07:00:01 --remove-sent-files . /var/log/auditlog/LDAP/vsa9394928
 3823 S sudo rsync --server -blogDtpRze.LsfxC --backup-dir BACKUP --suffix=_2023-08-25_10:00:01 --remove-sent-files . /var/log/auditlog/LDAP/vsa9394928
 4918 S sudo rsync --server -blogDtpRze.LsfxC --backup-dir BACKUP --suffix=_2023-08-23_02:00:02 --remove-sent-files . /var/log/auditlog/LDAP/vsa9394928
 5092 S sudo rsync --server -blogDtpRze.LsfxC --backup-dir BACKUP --suffix=_2023-08-23_10:00:02 --remove-sent-files . /var/log/auditlog/LDAP/vsa9394928
 5094 S sudo rsync --server -blogDtpRze.LsfxC --backup-dir BACKUP --suffix=_2023-08-26_04:00:01 --remove-sent-files . /var/log/auditlog/LDAP/vsa9394928
 5154 S sudo rsync --server -blogDtpRze.LsfxC --backup-dir BACKUP --suffix=_2023-08-22_18:36:57 --remove-sent-files . /var/log/sudoshell/vsa10803519/SUDOSH
 5670 S sudo rsync --server -blogDtpRze.LsfxC --backup-dir BACKUP --suffix=_2023-08-26_08:00:01 --remove-sent-files . /var/log/auditlog/LDAP/vsa9394928
 5935 S sudo rsync --server -blogDtpRze.LsfxC --backup-dir BACKUP --suffix=_2023-08-24_21:00:02 --remove-sent-files . /var/log/auditlog/LDAP/vsa9394928
 6000 S sudo rsync --server -blogDtpRze.LsfxC --backup-dir BACKUP --suffix=_2023-08-24_18:00:01 --remove-sent-files . /var/log/auditlog/LDAP/vsa9394928
```
