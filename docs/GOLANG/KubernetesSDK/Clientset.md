

`clientset, err := kubernetes.NewForConfig(config)`
`*kubernetes.Clientset` 是 Kubernetes 官方 Go 语言客户端（client-go）中最核心的对象。它具备了对 Kubernetes 内置资源进行全生命周期管理（CRUD）的能力

clientset 包含了对 Kubernetes 各个 API 组（API Groups）的访问接口。通过它，你可以操作以下常见资源：

- Core (v1)：操作 Pods, Services, ConfigMaps, Secrets, Namespaces, Nodes, PersistentVolumes 等。
- Apps (v1)：操作 Deployments, StatefulSets, DaemonSets, ReplicaSets 等。
- Batch (v1)：操作 Jobs, CronJobs。
- Networking (v1)：操作 Ingress, NetworkPolicies。
- Rbac (v1)：操作 Roles, RoleBindings, ClusterRoles 等。


假设你已经拿到了 clientset，你可以像这样获取 default 命名空间下的所有 Pod
```golang
// 访问 CoreV1 组下的 Pods 资源
pods, err := clientset.CoreV1().Pods("default").List(context.TODO(), metav1.ListOptions{})
if err != nil {
    panic(err)
}

for _, pod := range pods.Items {
    fmt.Printf("Pod 名称: %s\n", pod.Name)
}
```