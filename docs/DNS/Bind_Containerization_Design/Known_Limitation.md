


Shoot cluster node running GardenLinux is running `systemd-resolved.service` which occupied the port 53, therefore solutions like kube-vip, using VRRP isn't feasible. 

```
udp        0      0 127.0.0.54:53           0.0.0.0:*                           1073/systemd-resol
```


1. Relay pod is aware of the upstream IP only instead of actual upstream VM IP
2. Openstack LB only present LB IP instead of actual client request IP.
https://github.com/kubernetes/cloud-provider-openstack/blob/master/docs/openstack-cloud-controller-manager/expose-applications-using-loadbalancer-type-service.md#use-proxy-protocol-to-preserve-client-ip