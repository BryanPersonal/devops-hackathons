
Symptom: Pod in CrashLoopBackOff which got restarted hundreds of time 

```
Containers:
  named:
    Container ID:  containerd://238103b803026f53f4b4d0b10b408c562733c93966b179528367b1a5d54c4ad5
    Image:         keppel.eu-de-1.cloud.ppp/devenv/bind-081:dev
    Image ID:      keppel.eu-de-1.cloud.ppp/devenv/bind-081@sha256:d5f2fecd2c2c9d45c1906556dda17f77e2e30fea6ffb82b466822655cb7ba971
    Ports:         53/UDP, 53/TCP, 953/TCP
    Host Ports:    0/UDP, 0/TCP, 0/TCP
    Command:
      /bin/bash
      /scripts/named-entrypoint.sh
    State:          Waiting
      Reason:       CrashLoopBackOff
    Last State:     Terminated
      Reason:       Error
      Exit Code:    143
      Started:      Fri, 11 Jul 2025 15:50:36 +0800
      Finished:     Fri, 11 Jul 2025 15:50:51 +0800
    Ready:          False
    Restart Count:  859
    Readiness:      exec [/bin/sh -c rndc status | grep 'server is up and running'] delay=0s timeout=1s period=10s #success=1 #failure=10
    Startup:        tcp-socket :53 delay=5s timeout=1s period=5s #success=1 #failure=3
    Environment:
      KUBERNETES_SERVICE_HOST:  api.turing.sni.internal.canary.k8s.ondemand.com
    Mounts:
      /etc/named.conf from named-conf (rw,path="named.conf")
      /scripts from script (rw)
      /var/lib/named from bind-data (rw)
      /var/lib/named/dyn/dyn.example.com.zone from zone-volume (rw,path="dyn.example.com.zone")
      /var/lib/named/lock from shared-lock (rw)
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-wvcf8 (ro)
```

🔍 关键信息：
State:          Waiting
  Reason:       CrashLoopBackOff

Last State:     Terminated
  Reason:       Error
  Exit Code:    143
  Started:      Fri, 11 Jul 2025 15:50:36 +0800
  Finished:     Fri, 11 Jul 2025 15:50:51 +0800
✅ Exit Code 143 的含义：
Exit code 143 = 128 + 15 → 被 SIGTERM 杀死

表示容器不是因为程序主动退出，而是被 Kubernetes 发出 SIGTERM 终止。

在 K8s 中，当容器运行时间太短 + probe 未通过 + 容器没有监听或挂起 → 会被认为启动失败，Kubelet 会重启它。

| 探针类型             | 影响容器生命周期 | 影响 Pod Ready 状态 | 是否会杀容器 | 常见用途            |
| ---------------- | -------- | --------------- | ------ | --------------- |
| `readinessProbe` | ❌ 不会     | ✅ 会变成 NotReady  | ❌ 否    | 是否就绪、是否接收流量     |
| `livenessProbe`  | ✅ 会      | ❌ 无影响           | ✅ 是    | 进程是否挂住或死锁，需重启   |
| `startupProbe`   | ✅ 会      | ❌ 无影响           | ✅ 是    | 启动是否卡住（用于慢启动服务） |

readinessProbe 失败最多只会导致 Pod 被 Service 踢出流量，不会 kill 或重启容器。你容器的重启原因不是 readinessProbe，而可能是 startupProbe、livenessProbe、或容器自己退出。你可以通过 kubectl logs --previous 和 describe 精确确认原因。