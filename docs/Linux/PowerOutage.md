
Linux Machine running LOB application or Gardener nodes require reboot from Cloud Provider E.g Openstack VM on SCI as FS will come into RO in scenario of power outage
```	
mount | grep mapper| grep ro

/dev/mapper/systemVG-LVRoot on / type ext4 (ro,noatime)
/dev/mapper/systemVG-tmp on /tmp type ext4 (ro,nosuid,nodev,noexec,noatime)
/dev/mapper/systemVG-var on /var type ext4 (ro,nosuid,nodev,noexec,noatime)
```