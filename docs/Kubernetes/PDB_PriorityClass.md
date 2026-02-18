
- PDB 主要解决的是Voluntary Disruption
什么叫 voluntary？
比如：
- kubectl drain
- node 升级
- cluster autoscaler 缩容
- 运维重启 node
不是 crash。
不是 OOM。
不是抢占。

Priority Class
⭐ Priority 只对什么生效？
Priority 只在这两种情况下有意义：
1. 调度时（谁先被调度）
2. 抢占时（Preemption）
DL_6167C66B64BF670280DD1D4A@global.corp.sap
👉 升级不属于这两类。

PDB Design
1. PDB will trigger `containers.lifecycle.preStop.exec.command` when draining the node evicting the pod
2. PDB usually apply for long lifecycle workload `Deployment / StatefulSet / ReplicaSet / DaemonSet`

__Key concepts__:  
1. [voluntary-and-involuntary-disruptives](https://kubernetes.io/docs/concepts/workloads/pods/disruptions/#voluntary-and-involuntary-disruptions)
2. [think-about-how-your-application-reacts-to-disruptions](https://kubernetes.io/docs/tasks/run-application/configure-pdb/#think-about-how-your-application-reacts-to-disruptions)

```
[OUTPUT]
    Name  es
    Match k8s_events
    Host  <ES_HOST>
    Port  443
    HTTP_User <USER>
    HTTP_Passwd <PASSWORD>
    Index k8s-events-%Y.%m.%d
    Type  _doc
    Logstash_Format On
    Replace_Dots On
```