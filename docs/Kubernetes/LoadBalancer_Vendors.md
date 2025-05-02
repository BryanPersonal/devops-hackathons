
1. Openstack LbaaS. Kubernetes 中 type=LoadBalancer 的 Service 在 OpenStack 环境下会同时分配一个 NodePort 和一个 OpenStack Octavia（或 Amphora）负载均衡器。这意味着 Octavia 为 Service 创建的 Pool 中，每个后端成员都使用该 Service 的 NodePort（即随机分配的端口）来接收流量。之所以看到“随机端口”的现象，是因为 Kubernetes 默认会在 30000–32767 范围内 随机分配 NodePort，而 OpenStack 云控制器管理器（Cloud Controller Manager, CCM）正是读取这一端口来注册 Pool 成员的
