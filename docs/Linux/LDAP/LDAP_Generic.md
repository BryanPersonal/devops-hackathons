## Concept level expertise
### 1. DN 
```
dn = Base Distinguished Name （包含域（DC）和条目自身的信息（如 cn 或 ou 等）。）
dc = Domain Component (域组件（Domain Component），描述目录树的顶级结构)
<LDAP Base DN> = 'LDAP Base DN' in GMP technical landscape  eg: `dc=cis-testing,dc=gmp,dc=eu-de-1,dc=cloud,dc=sap`

dc=sap
└── dc=cloud
    └── dc=eu-de-1
        └── dc=gmp
            └── dc=cis-testing
                ├── ou=users
                │   ├── cn=user1
                │   └── cn=user2
                └── ou=groups
                    ├── cn=group1
                    └── cn=group2
Or new domain structure (DNS)

----------------------------------------------

dc=sap
  └── dc=int
        └── dc=sni
              └── dc=canaryeu2
                    └── ou=SYS
                          └── ou=users
                                └── cn=slave

dc=sap,dc=int,dc=sni,dc=canaryeu2：这是 LDAP 目录的顶级根。通常代表组织的基本结构，可能与域名相关。
ou=SYS：在根下的一个组织单元，可能包含系统或管理员级别的条目。
ou=users：在 ou=SYS 下面的组织单元，专门用于存储用户信息。
cn=slave：这是 ou=users 组织单元下的一个具体条目，通常表示一个用户对象。
```
每个 dc 表示域组件（Domain Component），通常与组织的域名相关。<br/>
如果 Base DN 是 dc=cis-testing,dc=gmp,dc=eu-de-1,dc=cloud,dc=sap，那么 LDAP 查询将只在这棵目录树中进行，且搜索范围受限于此子树。
#### DN vs DC 之间的关系
DC 是 DN 的组成部分之一，用于描述域名的层次结构。每个DC表示域名的一部分。

#### ldapsearch options' relation to concept DN

```
       -b searchbase
              Use searchbase as the starting point for the search instead of the default.
       -D binddn
              Use the Distinguished Name binddn to bind to the LDAP directory.  For SASL binds, the server is expected to ignore this value.
        在 ldapsearch 命令中，-D binddn 参数用于指定一个 Distinguished Name (DN)，作为绑定（Bind）到 LDAP 目录时使用的身份。绑定是 LDAP 客户端与服务器建立认证连接的过程，binddn 是客户端用于向服务器证明自己身份的凭据
```

#### ldapsearch -b 和 -D为什么通常结合使用
`-b = BaseDN` (指定 LDAP 查询操作的搜索起点（Base DN, 告诉 LDAP 客户端从目录树的哪个节点开始查找条目) <br/>
`-D = BindDN` (表示客户端以哪个用户身份登录到 LDAP 目录。) <br/>

    - 如果绑定 DN 的用户是管理员，可以搜索整个目录树。
    - 如果绑定 DN 的用户权限有限，则只能搜索特定范围。

Summary: `-D` 提供身份验证，绑定到服务器；`-b` 指定搜索范围。

### 2. ldap search base(from sssd.conf)

`ldap_search_base = dc=canaryeu2,dc=sni,dc=int,dc=sap?subtree?(!(ou:dn:=BLOCK))`


### （Important）LDAP Search typical samples
#### 1. Search a user
```
ldapsearch -LLL -H ldaps://ldap.canaryeu2.sni.int.sap -b dc=canaryeu2,dc=sni,dc=int,dc=sap -D cn=slave,ou=users,ou=SYS,dc=canaryeu2,dc=sni,dc=int,dc=sap -W "(uid=i577081)"
Enter LDAP Password:
dn: uid=i577081,ou=users,ou=ADS,dc=canaryeu2,dc=sni,dc=int,dc=sap
objectClass: top
objectClass: posixAccount
objectClass: shadowAccount
objectClass: ldapPublicKey
objectClass: extensibleObject
objectClass: inetOrgPerson
gecos: Chen, Bryan
host: *
loginShell: /usr/bin/sudosh
shadowExpire: 99999
shadowFlag: 0
shadowInactive: 99999
shadowMin: 0
shadowMax: 99999
shadowWarning: 0
uid: i577081
sn: i577081
sn: Chen
userPassword:: e1NBU0x9aTU3NzA4MQ==
homeDirectory: /home/i577081
gidNumber: 58000
uidNumber: 3577081
givenName: Bryan
ou: S&I DevOps CN
cn: I577081
l: Shanghai
description: S&I DevOps CN
displayName: Chen, Bryan
mobile: +8619145607443
st: China
telephoneNumber: +862160308572
physicalDeliveryOfficeName: PVG02, B0.30
mail: bryan.chen01@sap.com
postalCode: 201203
sshPublicKey: ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCsIfNMUFUY1F+HW1SC9iYa2fUM
 CxD2kzjdqqvdbgZUTrsS2gxxhZXkOtJa1Ocmg0vL/wVUWHik+fHXRBSbI4bCi4V+Pvlm9HG5YlXuU
 k+hhr+VmaIFIK/bFMQrDzs65cG5FMlvZvWuE/i6Sk/B9WrhMwgkECgR174I/rJK7y8+IvoYJ/kj79
 KyOk5GBR/olYafxvr0PAJcZyoMgWZSR2zAbHDzlv+clQzRKr73GXVGq5QqbooYCo59zkUbbus1yx5
 flprMYAsmziGB4qEeoVqVEWfy7QGTlC2Xz7YNj9p6wffhRNMO912A9rVBReaMvqxRhIBhSxLOl/kZ
 6oDLLbgkx+rbJJ/guunqjap7fyayrBYouyeGKAcDlG9zy5v2Iny+Zwulv9t5cI2yU348Wsio5JSJm
 sO08D+AnkVt25ewnb4AlYXsXKLO0KU9IV0yxHO5jVwlBLe1MkDJr+DpZq0q37ftNLSIUYdpgZMPvz
 xav5JmDDfYVdnKasEfq6IC+nk= i577081@W-PF3NF3XQ

```

#### 2. Search a group/CN
```
ldapsearch -LLL -H ldaps://ldap-eude2-spc.cis-spc-tic.gmp.eu-de-2.cloud.sap -b dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap -D cn=slave,ou=users,ou=SYS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap -W "(cn=sapsys)"

## 每个环境各有一个cn=sapsys，下面是其中一个案例。
dn: cn=sapsys,ou=groups,ou=CLMAM-EUDE2-TOOLS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap
objectClass: posixGroup
cn: sapsys
gidNumber: 10500
memberUid: mshadm
memberUid: lm1adm
memberUid: lm2adm
memberUid: hc2adm
memberUid: hc1adm
memberUid: hcadm
memberUid: fp2adm
memberUid: wtiadm
memberUid: fd2adm
memberUid: fp1adm

逐字段解析
1. dn（Distinguished Name）
dn 表示此条目的完整目录名，它是 LDAP 树结构中唯一标识该条目的路径。
dn: cn=sapsys,ou=groups,ou=CLMAM-EUDE2-TOOLS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap：
cn=sapsys: 表示组的通用名称（Common Name），sapsys 是组的标识。
ou=groups: 表示此条目属于 组织单位 groups。
ou=CLMAM-EUDE2-TOOLS: 表示此条目进一步归类在组织单位 CLMAM-EUDE2-TOOLS。
dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap：
dc（Domain Component）表示域名组件。整段表示 LDAP 树的顶级域名为 cis-spc-tic.gmp.eu-de-2.cloud.sap。
2. cn（Common Name）
cn=sapsys: sapsys 是此组的名称。cn 是 LDAP 对象中通用的标识字段。
上下文信息
从该条目推测出以下信息：

LDAP 树的组织结构:
LDAP 树从顶层 dc=sap 开始，逐层分为 cloud、eu-de-2 等子域，直到叶子节点 cn=sapsys。
ou=CLMAM-EUDE2-TOOLS 和 ou=groups 是中间的组织单位。
sapsys 组的含义:
sapsys 通常是 SAP 系统中用于定义用户组的名称，用于为操作系统用户提供访问权限。
总结
这段 LDAP 条目表示：

一个名为 sapsys 的组，它属于组织单位 groups 和 CLMAM-EUDE2-TOOLS。
该组归属于 LDAP 树的域名 cis-spc-tic.gmp.eu-de-2.cloud.sap。

```


## Fuck, you have to start, from where ? right here, right now.
you shoud start from logs .


