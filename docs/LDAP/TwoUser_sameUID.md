**Issue description**: 
two user tfc and test are using the same uidNumber 458. 

cc02v014415:~ # getent passwd tfc
tfc:*:458:79:tfc:/home/tfc:/bin/bash
cc02v014415:~ # getent passwd test
test:*:458:79:tfc:/home/tfc:/bin/bash
cc02v014415:~ #
cc02v014415:~ # id test
uid=458(test) gid=79(sapsys) groups=79(sapsys)
cc02v014415:~ #
cc02v014415:~ # id tfc
uid=458(test) gid=79(sapsys) groups=79(sapsys)

cc02v014415:~ # ll /usr/sap/trans80/
total 24488
-rw-r--r-- 1 test sapsys 112 Feb 8 2012 00README
drwxrwx--- 174 test sapsys 194650112 May 21 10:35 actlog
drwxrwx--- 3 test sapsys 176128 May 6 09:39 bin
drwxrwx--- 8 test sapsys 376832 May 17 13:58 buffer
drwxrwx--- 2 test sapsys 23252992 May 21 12:15 cofiles
drwxrwx--- 2 test sapsys 4096 May 16 2021 custom
drwxrwx--- 3 test sapsys 18292736 May 21 12:15 data

**Analysis**:

>  ldapsearch -ZZ -LLL -H ldap://ldap-eude2-spc.cis-spc-tic.gmp.eu-de-2.cloud.sap -b dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap -D cn=slave,ou=users,ou=SYS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap -W "(uid=test)" creatorsName createTimestamp
Enter LDAP Password:
dn: uid=test,ou=users,ou=CLMAM-EUDE2-VLAB,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=
 cloud,dc=sap
creatorsName: uid=i538541,ou=users,ou=ADS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=
 cloud,dc=sap
createTimestamp: 20220420101428Z

**如何通过检查某个用户是否有LDAP写的权限**

`include         /etc/openldap/inc.access` defined in `/etc/openldap/slapd.conf` 
File: /etc/openldap/inc.access 
OpenLDAP 的 ACL 通常配置在 slapd.conf 文件中或通过动态配置（使用 olcAccess 属性）。

```
access to dn.subtree="ou=CLMAM-EUDE2-VLAB,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap"
 by set="([cn=CLMAM_CC_LDAP_WRITE,ou=groups,ou=ADS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap])/memberUid & user/uid" write
 by set="([cn=CLMAM_CC_LDAP_READ,ou=groups,ou=ADS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap])/memberUid & user/uid" read
 by * none
```

```
access to *
 by anonymous auth
 by dn.exact="cn=slave,ou=users,ou=SYS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap" read
 by dn.exact="cn=nagios,ou=users,ou=SYS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap" read
 by dn.exact="cn=prc,ou=users,ou=SYS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap" write
 by dn.exact="cn=adssync,ou=users,ou=SYS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap" write
 by group.exact="cn=ldapadmins,ou=groups,ou=SYS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap" write
 by set="([cn=GMP_CIS_ADMINS,ou=groups,ou=ADS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap])/memberUid & user/uid" write
 by * none break

access to dn.base="dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap"
 by set="([cn=CLMAM_CC_LDAP_WRITE,ou=groups,ou=ADS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap])/memberUid & user/uid" read
 by set="([cn=CLMAM_CC_LDAP_READ,ou=groups,ou=ADS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap])/memberUid & user/uid" read
 by * none

access to dn.subtree="ou=CLMAM-EUDE2-PROD,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap"
 by set="([cn=CLMAM_CC_LDAP_WRITE,ou=groups,ou=ADS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap])/memberUid & user/uid" write
 by set="([cn=CLMAM_CC_LDAP_READ,ou=groups,ou=ADS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap])/memberUid & user/uid" read
 by * none

access to dn.subtree="ou=CLMAM-EUDE2-TOOLS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap"
 by set="([cn=CLMAM_CC_LDAP_WRITE,ou=groups,ou=ADS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap])/memberUid & user/uid" write
 by set="([cn=CLMAM_CC_LDAP_READ,ou=groups,ou=ADS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap])/memberUid & user/uid" read
 by * none

access to dn.subtree="ou=CLMAM-EUDE2-VLAB,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap"
 by set="([cn=CLMAM_CC_LDAP_WRITE,ou=groups,ou=ADS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap])/memberUid & user/uid" write
 by set="([cn=CLMAM_CC_LDAP_READ,ou=groups,ou=ADS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap])/memberUid & user/uid" read
 by * none
/etc/openldap/inc.access lines 1-29/29 (END)
```


// From Pamela 
The issue is because of two tech users("tfc" and "test") are now using same uidNumber 458.  "tfc" and "test" were created by CLMAM colleagues who have the OU "CLMAM-EUDE2-VLAB" write permission, Rene Uhl (I538541) from CLMAM can support to check and do adjustment to make sure unique uidNumber is used per tech user. Our team cannot directly do the adjustment in CLMAM self managed OU. Could you please notify Rene directly? I have also set up a chat group with Rene and you.
vsa9449733:~ # ldapsearch -LLL -o ldif-wrap=no -H ldaps://ldap-eude2-spc.cis-spc-tic.gmp.eu-de-2.cloud.sap -b dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap -D cn=slave,ou=users,ou=SYS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap -W uidNumber=
458
dn
Enter LDAP Password:
dn: uid=
tfc
,ou=users,ou=CLMAM-EUDE2-VLAB,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap
dn: uid=
test
,ou=users,ou=CLMAM-EUDE2-VLAB,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap
Regards,
Pamela Mei