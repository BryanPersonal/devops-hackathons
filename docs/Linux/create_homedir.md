

🔹 它如何为 LDAP 用户创建 home？
通过 NSS（SSSD）获取用户信息
读取 homeDirectory（如 /home/alice）
检查目录是否存在
不存在 → mkdir + chown
从 /etc/skel 拷贝默认文件

LDAP 用户登录 → PAM → pam_mkhomedir → 创建 /home/user

```
用户登录
 ↓
sshd
 ↓
PAM stack
 ↓
pam_sss → 查询 LDAP（通过 SSSD）
 ↓
认证成功
 ↓
pam_mkhomedir
 ↓
getpwnam() → NSS → SSSD → LDAP
 ↓
拿到 home=/home/alice, uid=12345
 ↓
检查目录是否存在
 ↓
mkdir + chown + copy /etc/skel
```