

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