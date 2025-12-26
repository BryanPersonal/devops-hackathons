
Issue collection:

A. `k3d cluster list` present the cluster is in running state however unable to navigate over `kubectl config get-contexts`
Reason: because of missing `kubeconfig`


``` 
# 1. 获取集群的 kubeconfig 并 merge 到 ~/.kube/config
k3d kubeconfig merge mycluster --kubeconfig-merge-default

# 2. 再次查看
kubectl config get-contexts
# → 现在应该有 k3d-mycluster 了
```