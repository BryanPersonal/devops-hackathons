
Experience
```
新的Runtime 在OPENLDAP服务端创建OU  AD2LDAP是把AD中用户结果的认证资料同步到OPENLDAP

ldapsearch -x -H ldaps://ldap-eude1-cis-test.cis-testing.gmp.eu-de-1.cloud.sap -b dc=cis-testing,dc=gmp,dc=eu-de-1,dc=cloud,dc=sap "(CN=CLMAM_CC_OSAccess_oadev)"

ldapsearch -o ldif-wrap=no -ZZ -LLL -h adldap.global.corp.sap -b DC=global,DC=corp,DC=sap -D pso_cis_ad_ldap_2@global.corp.sap -w $pwd cn=CAM_SNI_* dn 

ldapsearch -ZZ -LLL -h adldap.global.corp.sap -b DC=global,DC=corp,DC=sap -D pso_cis_ad_ldap_2@global.corp.sap -w $pwd cn=cam_si_devops_argocd_owner

ldapsearch -x -H ldaps://ldap-eude1-cis-test.cis-testing.gmp.eu-de-1.cloud.sap -b dc=cis-testing,dc=gmp,dc=eu-de-1,dc=cloud,dc=sap "(&(objectClass=posixGroup)(CN=BTP_NEO_ATOM_HOTFIX_APPROVER))"

ldapsearch -x -H ldaps://ldap-eude1-cis-test.cis-testing.gmp.eu-de-1.cloud.sap -b dc=cis-testing,dc=gmp,dc=eu-de-1,dc=cloud,dc=sap "(uid=i577081)"

ldapsearch -LLL -o ldif-wrap=no -H ldaps://ldap-eude1-spc.cis-spc-tic.gmp.eu-de-1.cloud.sap -b ou=ADS,dc=cis-spc-tic,dc=gmp,dc=eu-de-1,dc=cloud,dc=sap -D cn=slave,ou=users,ou=SYS,dc=cis-spc-tic,dc=gmp,dc=eu-de-1,dc=cloud,dc=sap -W CN=CLM_AM_SCC_VLAB_SUBADMIN

# Final validation
vsa9165645:/var/log #    ldapsearch -LLL -o ldif-wrap=no -H ldaps://ldap-eude1-spc.cis-spc-tic.gmp.eu-de-1.cloud.sap -b ou=ADS,dc=cis-spc-tic,dc=gmp,dc=eu-de-1,dc=cloud,dc=sap -D cn=slave,ou=users,ou=SYS,dc=cis-spc-tic,dc=gmp,dc=eu-de-1,dc=cloud,dc=sap -W CN=CLMAM_CC_OSACCESS_OADEV
Enter LDAP Password:
dn: cn=CLMAM_CC_OSACCESS_OADEV,ou=groups,ou=ADS,dc=cis-spc-tic,dc=gmp,dc=eu-de-1,dc=cloud,dc=sap
objectClass: top
objectClass: posixGroup
cn: CLMAM_CC_OSACCESS_OADEV
gidNumber: 58006
```


```
# Check user's details in LDAP 
ldapsearch -o ldif-wrap=no -LLL -H ldaps://ldap-eude2-spc.cis-spc-tic.gmp.eu-de-2.cloud.sap -b dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap -D cn=slave,ou=users,ou=SYS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap -w $pwd cn=nzaadm dn


ldapsearch -o ldif-wrap=no -LLL \
  -H ldaps://ldap-eude2-spc.cis-spc-tic.gmp.eu-de-2.cloud.sap \
  -b dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap \
  -D cn=slave,ou=users,ou=SYS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap \
  -w 'your_password_here' \  or -W # Prompt asking pass
  "(objectClass=organizationalUnit)" ou

```


```

ldapsearch -LLL -o ldif-wrap=no   -H ldaps://ldap-eude2-spc.cis-spc-tic.gmp.eu-de-2.cloud.sap   -b "dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap"   -D "cn=slave,ou=users,ou=SYS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap"   -W cn=nzaadm
Enter LDAP Password:
dn: uid=nzaadm,ou=users,cn=NZA,ou=CLMAM-EUDE2-PROD,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap
cn: nzaadm
gidNumber: 1002
homeDirectory: /usr/sap/NZA/home
sn: nzaadm
uid: nzaadm
gecos: SAP System Administrator
shadowExpire: 99999
objectClass: posixAccount
objectClass: top
objectClass: inetOrgPerson
objectClass: shadowAccount
description: SAP System Administrator
loginShell: /bin/csh
uidNumber: 50805
userPassword:: e1NTSEF9aTdpOUkvckplMW8rbjJ3S0dWai9tSjFyM3FGUWEwWnlZV0p6TVROUA== 

# 深度解释

dc=sap
 └─ dc=cloud
     └─ dc=eu-de-2
         └─ dc=gmp
             └─ dc=cis-spc-tic
                 └─ ou=CLMAM-EUDE2-PROD
                     └─ cn=NZA                ← 这是一个“组织”或“SAP系统实例”容器（用 cn 而非 ou）
                         └─ ou=users          ← 用户容器
                             └─ uid=nzaadm    ← 具体用户条目

```

```
ldapsearch -x -h ldap-eude1-dev.cis-dev.gmp.eu-de-1.cloud.sap -LLL uid=i566522 
dn: uid=i566522,ou=users,ou=ADS,dc=cis-dev,dc=gmp,dc=eu-de-1,dc=cloud,dc=sap

ldapsearch -LLL -o ldif-wrap=no -H ldaps://ldap-eude1-spc.cis-spc-tic.gmp.eu-de-1.cloud.sap -b dc=cis-spc-tic,dc=gmp,dc=eu-de-1,dc=cloud,dc=sap -D cn=slave,ou=users,ou=SYS,dc=cis-spc-tic,dc=gmp,dc=eu-de-1,dc=cloud,dc=sap -W cn=sapadm

ldapsearch -LLL -o ldif-wrap=no -H ldaps://ldap-eude1-spc.cis-spc-tic.gmp.eu-de-1.cloud.sap -b dc=cis-spc-tic,dc=gmp,dc=eu-de-1,dc=cloud,dc=sap -D cn=slave,ou=users,ou=SYS,dc=cis-spc-tic,dc=gmp,dc=eu-de-1,dc=cloud,dc=sap -W  "(objectClass=organizationalUnit)"

```