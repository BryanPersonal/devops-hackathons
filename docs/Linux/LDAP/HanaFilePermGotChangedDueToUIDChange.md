

INC15677070 - Strange file ownership change after reboot

__RCA__:  UID was changed by a GMP technical user resulting in subsequent effect. Files owner got changed while Process got restarted/OS rebooted  

```
Atul Sharma (C5381597) at 2025-10-08 09:58:07 (GMT):

Hi Colleagues,

We came across a situation where after reboot/ppptune Migration ownership got changed in below server.

For files having p3cadm as owner got changed to 100000031.

Please find the proof below.

cc01v012157:~ # find / -user 100000031 -ls
1711 88 -rw-r----- 1 100000031 pppsys 89861 Sep 17 13:32 /var/tmp/hdbinst_afl.msg
1369 28 -rw-r--r-- 1 100000031 pppsys 26697 Sep 21 19:08 /var/tmp/hdbupdrep_2025-09-21_19.08.49_49046.trc
1370 28 -rw-r--r-- 1 100000031 pppsys 26697 Sep 21 19:08 /var/tmp/hdbupdrep_2025-09-21_19.08.52_49102.trc
1898 88 -rw-r----- 1 100000031 pppsys 89861 Sep 17 13:32 /var/tmp/hdb_P3C_hdblcm_update_2025-09-17_13.31.37/hdbinst_af l.msg
1896 0 -rw-r----- 1 100000031 pppsys 0 Sep 17 13:32 /var/tmp/hdb_P3C_hdblcm_update_2025-09-17_13.31.37/hdbinst_af l.cfg
1897 24 -rw-r----- 1 100000031 pppsys 24033 Sep 17 13:32 /var/tmp/hdb_P3C_hdblcm_update_2025-09-17_13.31.37/hdbinst_af l.log
1668 4 -rw-r----- 1 100000031 pppsys 440 Sep 17 13:35 /var/tmp/hdb_P3C_hdblcm_update_2025-09-17_13.31.37/commands.l og
1195 28 -rw-r--r-- 1 100000031 pppsys 26697 Sep 21 19:08 /var/tmp/hdbupdrep_2025-09-21_19.08.46_48921.trc
1371 28 -rw-r--r-- 1 100000031 pppsys 26697 Sep 21 19:08 /var/tmp/hdbupdrep_2025-09-21_19.08.55_49162.trc
1373 28 -rw-r--r-- 1 100000031 pppsys 26697 Sep 21 19:09 /var/tmp/hdbupdrep_2025-09-21_19.08.58_49208.trc
1710 24 -rw-r----- 1 100000031 pppsys 24033 Sep 17 13:32 /var/tmp/hdbinst_afl.log
```

```
(vadb03p3c) cc01v012157:~ #
# ldapsearch -LLL -o ldif-wrap=no \
>   -H ldaps://ldap-eude1-spc.cis-spc-tic.gmp.eu-de-1.cloud.ppp \
>   -b dc=cis-spc-tic,dc=gmp,dc=eu-de-1,dc=cloud,dc=ppp \
>   -D cn=slave,ou=users,ou=SYS,dc=cis-spc-tic,dc=gmp,dc=eu-de-1,dc=cloud,dc=ppp \
>   -W \
>   "(uid=p3cadm)" \
>   modifiersName modifyTimestamp
Enter LDAP Password:
dn: uid=p3cadm,ou=users,cn=P3C,ou=CLMAM-EUDE1-PROD,dc=cis-spc-tic,dc=gmp,dc=eu-de-1,dc=cloud,dc=ppp
modifiersName: cn=prc,ou=users,ou=SYS,dc=cis-spc-tic,dc=gmp,dc=eu-de-1,dc=cloud,dc=ppp
modifyTimestamp: 20250926065542Z
```

```
(vadb03p3c) cc01v012157:~ #
# ldapsearch -LLL -o ldif-wrap=no   -H ldaps://ldap-eude1-spc.cis-spc-tic.gmp.eu-de-1.cloud.ppp   -b dc=cis-spc-tic,dc=gmp,dc=eu-de-1,dc=cloud,dc=ppp   -D cn=slave,ou=users,ou=SYS,dc=cis-spc-tic,dc=gmp,dc=eu-de-1,dc=cloud,dc=ppp   -W   "(uid=p3cadm)"
Enter LDAP Password:
dn: uid=p3cadm,ou=users,cn=P3C,ou=CLMAM-EUDE1-PROD,dc=cis-spc-tic,dc=gmp,dc=eu-de-1,dc=cloud,dc=ppp
gecos: ppp System Administrator
shadowExpire: 99999
loginShell: /bin/csh
sn: p3cadm
uid: p3cadm
cn: p3cadm
description: ppp System Administrator
userPassword:: e1NTSEF9TUEvS1BiaXcrL3BMMmdqeWxuTHJKZ0lBK2o0UGl2bEhhcnFsbXc9PQ==
gidNumber: 1002
objectClass: posixAccount
objectClass: top
objectClass: inetOrgPerson
objectClass: shadowAccount
homeDirectory: /usr/ppp/P3C/home
uidNumber: 100000047

(vadb03p3c) cc01v012157:~ #
# ldapsearch -LLL -o ldif-wrap=no   -H ldaps://ldap-eude1-spc.cis-spc-tic.gmp.eu-de-1.cloud.ppp   -b dc=cis-spc-tic,dc=gmp,dc=eu-de-1,dc=cloud,dc=ppp   -D cn=slave,ou=users,ou=SYS,dc=cis-spc-tic,dc=gmp,dc=eu-de-1,dc=cloud,dc=ppp   -W   "(uid=p3cadm)" +
Enter LDAP Password:
dn: uid=p3cadm,ou=users,cn=P3C,ou=CLMAM-EUDE1-PROD,dc=cis-spc-tic,dc=gmp,dc=eu-de-1,dc=cloud,dc=ppp
structuralObjectClass: inetOrgPerson
entryUUID: 51d5a318-0555-1040-8153-a1e0398f9920
creatorsName: cn=prc,ou=users,ou=SYS,dc=cis-spc-tic,dc=gmp,dc=eu-de-1,dc=cloud,dc=ppp
createTimestamp: 20250804080358Z
entryCSN: 20250926065542.273673Z#000000#001#000000
modifiersName: cn=prc,ou=users,ou=SYS,dc=cis-spc-tic,dc=gmp,dc=eu-de-1,dc=cloud,dc=ppp
modifyTimestamp: 20250926065542Z
entryDN: uid=p3cadm,ou=users,cn=P3C,ou=CLMAM-EUDE1-PROD,dc=cis-spc-tic,dc=gmp,dc=eu-de-1,dc=cloud,dc=ppp
subschemaSubentry: cn=Subschema
hasSubordinates: FALSE
```