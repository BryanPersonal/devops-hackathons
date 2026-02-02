

```
Your Action is required

This is a user-resolvable error — no Gardener operations team intervention needed. Please read the error message carefully and take action.

Cleaning up the cluster failed as some resource are stuck in deletion. Please remove these resources properly or a forceful deletion will happen if this error persists.

task "Cleaning extended API groups" failed: 1 error occurred:

* retry failed with context deadline exceeded, last error: remaining objects are still present: [*v1.CustomResourceDefinition /applications.argoproj.io]
```

Solution:

!!! Finalizer design ??  

强制移除 Finalizers (如果实例卡住)

```
# 获取所有卡住的 Application 资源名称并循环清除
for app in $(kubectl get applications.argoproj.io -A -o jsonpath='{.items[*].metadata.name}'); do
    kubectl patch applications.argoproj.io $app -p '{"metadata":{"finalizers":null}}' --type=merge
done

kubectl patch crd applications.argoproj.io -p '{"metadata":{"finalizers":null}}' --type=merge
```
简单来说，Finalizers（终结器） 是 Kubernetes 资源的一种“保护锁”或“清理预检清单”。

以下是针对你提供的技术定义的中文详细解释：

1. 核心定义：清理前的“待办清单”
Finalizers 本质上是存在于资源元数据（metadata.finalizers）中的一组字符串（键）。它的存在是为了告诉 Kubernetes：“在某些特定的清理工作完成之前，请不要彻底删除这个资源。”

2. 工作流程：从“申请删除”到“彻底消失”
当你下达删除指令（如 kubectl delete）时，会经历以下过程：
- 标记删除：Kubernetes 不会立即抹掉该资源，而是给它打上一个时间戳 metadata.deletionTimestamp。
- 进入终止状态：资源的状态变为 Terminating。此时，API Server 会返回一个 202 Accepted 状态码。
- 触发控制器：监控该资源的控制器 (Controller) 看到资源有了删除时间戳，就会检查 finalizers 列表。如果列表中有它负责的键，控制器就会开始执行具体的清理工作（例如：释放云端负载均衡器、删除关联的存储卷等）。
- 移除标签：清理完成后，控制器会从 finalizers 列表中删掉自己负责的那个键。
- 最终物理删除：当 metadata.finalizers 列表变为空时，Kubernetes 才会认为清理完毕，正式从数据库（etcd）中彻底删除该对象。

3. 为什么需要 Finalizers？（应用场景）
- 它主要用于**垃圾回收（Garbage Collection）**和防止资源残留：
- 清理外部依赖：如果一个 K8s 资源对应着云平台上的一个真实硬盘（如 AWS EBS），Finalizer 确保在 K8s 对象消失前，云硬盘也被正确卸载并删除。

- 级联清理：确保父资源在删除前，其子资源或关联的 API 资源已被妥善处理。

4. 关键特性
- 不含代码：Finalizers 本身只是一个普通的字符串列表（类似标签或注解），它不包含任何逻辑代码。
- 谁来执行：具体的清理逻辑是由对应的控制器实现的。控制器会持续监听这些键。
- 手动干预：正如你之前遇到的情况，如果控制器挂了，资源会永远卡在 Terminating。此时只能通过手动将 finalizers 设为 null 来暴力解锁。

总结对比：
- 普通删除：直接抹除，可能导致关联的外部资源变成没人管的“僵尸资源”。
- 带 Finalizers 的删除：先停下，等控制器打扫完战场，最后再消失。

```
kubectl get applications.argoproj.io -A
# 如果有列表返回，尝试删除它们
kubectl delete applications.argoproj.io --all -A
```