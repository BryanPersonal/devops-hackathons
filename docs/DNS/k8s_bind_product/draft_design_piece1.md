要实现自动 RWOP 卷挂载切换，你可以使用 **StatefulSet + LivenessProbe**（或搭配 Leader Election）来自动删除故障 Pod，进而释放 RWOP 卷给新 Pod 挂载。

---

## 🧠 背景理解：RWOP 自动切换的“挑战”

* **RWOP 只能被一个 Pod 使用**
* **K8s 不会强行解绑卷**，除非：

  * Pod 被彻底删除（`Terminated`)
  * 或 `volumeDetachTimeout` 过期（默认 6 分钟，通常太久）

所以我们的目标是：
👉 **尽快杀掉不健康的 Pod，使得新的 Pod 能接管 RWOP 卷**

---

## ✅ 推荐方案：StatefulSet + LivenessProbe + Pod Delete on Failure

### 🧩 架构设计图解

```text
                    RWOP Volume
                       │
       ┌───────────────┴───────────────┐
       │                               │
  StatefulSet (1 replica)       RWOP PVC 持久卷
       │
┌──────┴──────┐
│   Pod-A     │ ← 主Pod：存活时 RWOP 绑定
└─────────────┘
       │
[LivenessProbe 检查失败]
       ↓
Pod-A 被 K8s 重启 or 强制删除
       ↓
Pod-B 由 StatefulSet 重新创建并绑定 RWOP PVC
```

---

## 🛠 示例代码

### 1️⃣ PersistentVolumeClaim（RWOP）

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: rwop-pvc
spec:
  accessModes:
    - ReadWriteOncePod
  resources:
    requests:
      storage: 1Gi
  storageClassName: manila-nfs  # 替换为你的 Manila CSI StorageClass
```

---

### 2️⃣ StatefulSet 定义

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: rwop-app
spec:
  serviceName: "rwop-app"
  replicas: 1  # 只允许1个副本
  selector:
    matchLabels:
      app: rwop-app
  template:
    metadata:
      labels:
        app: rwop-app
    spec:
      containers:
      - name: main
        image: busybox
        command: ["sh", "-c", "sleep 3600"]
        volumeMounts:
        - name: data
          mountPath: /mnt/data
        livenessProbe:
          exec:
            command:
              - sh
              - -c
              - "cat /mnt/data/healthcheck.txt || exit 1"
          initialDelaySeconds: 10
          periodSeconds: 10
          failureThreshold: 3
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: rwop-pvc
```

---

## ⚠️ 关于故障恢复时间

### ⏱ 停机时间由以下决定：

| 项目               | 说明                    | 时间估计                    |
| ---------------- | --------------------- | ----------------------- |
| LivenessProbe 周期 | 多久检测一次                | 默认 10s                  |
| failureThreshold | 连续几次失败判定不健康           | 默认 3 次                  |
| Pod 删除 + 重新调度    | 从删除旧 Pod 到新 Pod Ready | 约 5\~15s（视镜像/Node 调度速度） |

### ✅ **总停机时间通常约 30 秒内**

---

## ✅ 优化建议

* 将 `livenessProbe.periodSeconds` 调成 5s
* 设置 `failureThreshold: 2`
* 调优 `terminationGracePeriodSeconds: 0`（立即终止）
* 使用 `preStop` 钩子尝试清理

---

## ✨ 可选增强：Leader Election + RWOP + Cron Controller

你可以使用一个 ConfigMap/Lease 资源进行**主Pod选举**，一旦主 Pod 失效，**controller 通过 CRON 检测旧 Pod 并自动删除**，来释放 RWOP 绑定。

是否需要我生成 Leader Election + 自动删除脚本？或者你是否希望我帮你写成完整的 Helm Chart 或 controller 示例？
