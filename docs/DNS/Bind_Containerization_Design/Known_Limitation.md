


Shoot cluster node running GardenLinux is running `systemd-resolved.service` which occupied the port 53, therefore solutions like kube-vip, using VRRP isn't feasible. 

```
udp        0      0 127.0.0.54:53           0.0.0.0:*                           1073/systemd-resol
```