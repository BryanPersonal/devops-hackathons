
```
find . -type f -mtime -1 -exec ls -l {} \;
```


sed, grep, awk cheatsheets

```
# 删除空白格和注释行，展示。
grep -vE '^\s*#|^\s*$' /etc/named.conf

\s*：匹配 0 个或多个空白字符
^\s*#：匹配前面可能有空格的注释行
^\s*$：匹配空白行
```

#### add lines `+:CLMAM_CC_OSAccess_prod:ALL` on topc of `+:CLMAM_CC_OSAccess_CAM_prod:ALL` when it doesn't exist. 
```
grep -q '^+:CLMAM_CC_OSAccess_prod:ALL' /etc/security/access.conf || sed -i.bak '/\+:CLMAM_CC_OSAccess_CAM_prod:ALL/i +:CLMAM_CC_OSAccess_prod:ALL' /etc/security/access.conf;
cat /etc/security/access.conf
```

#### Remove /var/log/hana from syslog
```
grep '^/var/log/hana' /etc/logrotate.d/syslog &&  sed -i.bak '/\/var\/log\/hana/d' syslog
```

Test first before execute with `sed -i 's/CLMAM_CC_OSAccess_prod/CLMAM_CC_OSAccess_CAM_prod/g' *prod*cam*`
```
sed -n 's/CLMAM_CC_OSAccess_prod/CLMAM_CC_OSAccess_CAM_prod/gp' *prod*cam*
```


__Bash参数替换语法:__
- `${NAMED_ARGS:+"$NAMED_ARGS"}`  如果 VAR 已定义且不为空，则返回 VAR 的值
- `${NAMED_ARGS:-"default_value"}` 如果 VAR 未定义或为空，使用 default_value
- `${VAR:? error_message}`  如果 VAR 未定义或为空，直接报错并退出，错误信息是 error_message

sudo replay
```
1. `bzip2 -d xx.tar.bz2` and `tar -xvf xx.tar `解压到 /tmp 
2. sudoreplay -d /tmp $id-20250410-055308-9gch32

Every sudo session creates two files - script and timing.
scriptreplay --timing $id-$id-time-1659693197-b2a4CAEdZZgglrUL $id-$id-script-1659693197-b2a4CAEdZZgglrUL
```

Bash execution best practice:
```
wget http://repo:50000/repo/CC+1/i577081/SP6_RT_Checker_TLO.sh --output-document=/tmp/SP6_RT_Checker_TLO.sh && && bash /tmp/SP6_RT_Checker_TLO.sh && rm /tmp/SP6_RT_Checker_TLO.sh
```

Same tip for grep
```
grep --color=always -ir res_pool_folder additional-attributes/*sles15sp5* | sed 's/:/|/' | column -s '|' -t

s<delimiter>pattern<delimiter>replacement<delimiter>
默认的 <delimiter> 是 /，所以 / 才需要在某些情况下被“转义”。
sed 's/\/usr\/bin/\/usr\/local\/bin/'
sed 's|/usr/bin|/usr/local/bin|' 这里你可以把 / 改成 | 作为分隔符（完全合法，甚至更常用），是 sed 的一个特性


```

__MISC knowledges:__
- `chmod 1775` mydir, 1 refer sticky bit 当设置在目录上时，只有文件的所有者、目录的所有者或 root 才能删除或重命名该目录中的文件，即使其他人也有写权限。
-  通过`if test -f "/proc/$i/exe"` 来判断进程是否存在是一个经典又可靠的Linux技巧 `/proc/$PID/exe` 在进程退出时会立即消失，因此更准确地反映进程是否"还活着" 并且可执行。
