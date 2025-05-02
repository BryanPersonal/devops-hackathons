

1. Deploy kube-vip-cloud-provider
https://github.com/kube-vip/kube-vip-cloud-provider/blob/main/README.md?#kube-vip-cloud-provider

https://kube-vip.io/docs/about/architecture/#load-balancing

```
docker run --rm ghcr.io/kube-vip/kube-vip:v0.8.9 --help
```


```
export VIP="100.70.224.11"  # 你想提供的虚拟 IP
export INTERFACE="ens192"      # 物理或虚拟网卡名称

kube-vip manifest daemonset \
  --interface $INTERFACE \
  --address $VIP \
  --controlplane=false \
  --services \
  --arp \
  --leaderElection \
  --namespace kube-system \
  --taint \
  --enableLoadBalancer \
  > kube-vip-lb.yaml

kubectl apply -f kube-vip-lb.yaml

```