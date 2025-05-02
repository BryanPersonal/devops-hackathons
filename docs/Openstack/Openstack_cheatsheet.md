


1. os port list --fixed-ip subnet=cis-clmam-eu-de-2-tools-private-01-01 | grep -c ip_address
2. openstack network list --long | --external
3. 

```
I577081 @ eu-de-1 > cis > clmam-eu-de-1-prod > openstack server list --format value --column Name --column Flavor |grep hana | sort -k2

cc01v008556 hana_c192_m2917
cc01v008750 hana_c192_m2917
cc01v011451 hana_c192_m2917
cc01v011743 hana_c192_m2917
```