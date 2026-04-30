

netfilter is the linux filewall
iptable is used to manage netfilters

iptables
- filter table
- nat table
- mangle table

filter 决定“放不放”，nat 决定“改地址”，mangle 决定“改行为/打标记”

- iptables 按功能将规则划分为不同的表（Table），每个表对应特定的网络处理阶段。按内核处理优先级从高到低为：
- raw → 绕过连接跟踪（PREROUTING, OUTPUT）
- mangle → 修改数据包元数据（TOS/TTL/MARK 等）
- nat → 网络地址转换（端口转发、SNAT/DNAT）
- filter → 包过滤（放行/丢弃，最常用）
- security → SELinux 策略挂钩
- 不加 -t 时：iptables-save 会一次性导出所有表的规则，输出较长且混杂。
- 加上 -t 表名：精准隔离，便于调试、备份或自动化脚本处理。

