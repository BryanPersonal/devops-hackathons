
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
