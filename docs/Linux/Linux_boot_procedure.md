

```
BIOS/UEFI
   ↓
GRUB2 引导加载器
   ↓
Linux 内核加载 + initramfs
   ↓
systemd（PID 1）
   ↓
挂载文件系统、初始化服务、网络、用户空间
   ↓
TTY 或 图形界面
```
####  UEFI 系统会有这个目录：
ls /sys/firmware/efi

| 项目                | BIOS       | UEFI                  |
| ----------------- | ---------- | --------------------- |
| 引导方式              | 使用 MBR 分区表 | 使用 GPT 分区表            |
| 支持磁盘大小            | 最大 2.2TB   | 支持超过 9ZB（Zetta Bytes） |
| 启动速度              | 相对较慢       | 更快（并行初始化）             |
| 界面                | 文本模式       | 图形界面（支持鼠标）            |
| 可扩展性              | 有限         | 高度可扩展（可以加载驱动）         |
| 安全启动（Secure Boot） | 不支持        | 支持                    |
| 可编程性（Shell）       | 不支持        | 可进入 UEFI Shell        |


| 项目       | MBR             | GPT                   |
| -------- | --------------- | --------------------- |
| 最大支持磁盘容量 | 2 TB            | \~9.4 ZB（Zetta Bytes） |
| 最大分区数    | 4 个主分区（可扩展逻辑分区） | 通常支持 128 个分区          |
| 启动方式     | 仅支持 BIOS        | 支持 UEFI（并可向后兼容 BIOS）  |
| 分区标识     | 不唯一（使用编号）       | 使用 GUID（全局唯一标识符）      |
| 数据完整性    | 无校验             | 支持 CRC 校验和冗余备份        |
| 分区表位置    | 第0扇区            | 开头 + 结尾都有（冗余）         |
| 系统兼容性    | 老旧系统支持好         | 新系统兼容性好（Win 8+/Linux） |

