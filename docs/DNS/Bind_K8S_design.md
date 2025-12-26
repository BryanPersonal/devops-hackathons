

一个 master 多个 slave 的架构，且 master 可在多个 pod 中自动选出，失效后由其他 pod 接管。

BIND主从切换`leader-election.go`


在 Kubernetes 中，BIND 的 master/slave 配置是静态的，但你可以借助以下机制动态实现：

1. 使用 Kubernetes Lease 机制实现 Leader Election
前面我们已经写了 leader-election.go，用来动态选出当前集群中的 Leader（即你说的 master pod）。

每个 Pod 运行一个 sidecar 或 init container，读取 /var/run/role 文件，决定是否启动为 master 或 slave。

2. 动态生成 named.conf 配置
每个 Pod 启动时根据角色生成如下配置：

Leader Election + label 或 role 文件（推荐）
每个 Pod 启动时：

运行 Leader Election（使用 Kubernetes Lease）

如果是 Leader，就打 role=leader 标签，或写入 /var/run/role=leader

其他 pod 通过 Service DNS 查询带 role=leader 的 Pod IP，用来配置为自己的 master

这种方式兼容 BIND 自身的 master/slave 模式，又适应 Kubernetes 的动态环境。

🚫 为什么不是真正“0”中断
尽管你可以最大程度优化响应时间，但仍存在不可控场景：

DNS 查询命中正好是正在宕机的 master pod。

客户端未配置 DNS fallback。

AXFR 未及时完成。

Kubernetes 节点调度或网络波动。


| 组件                                   | 说明                             |
| ------------------------------------ | ------------------------------ |
| **BIND**                             | DNS 服务，Pod 内运行，支持主从 zone       |
| **Kubernetes StatefulSet**           | 确保 Pod 有稳定的名称和持久存储             |
| **Kubernetes Lease API**             | 实现 Master Pod 的选举              |
| **rsync + shared zone volume**       | 保证 zone 文件从 Master 实时同步到 Slave |
| **inotify + `rndc reload`**          | 当 zone 文件变化时自动 reload BIND     |
| **K8s Service (Headless/ClusterIP)** | 统一暴露多个 Slave Pod DNS 服务        |
| **Pod AntiAffinity**                 | 将多个 DNS Pod 分散部署，增强容错          |

🛡️ 降低切换中断的措施

| 措施              | 描述                              |
| --------------- | ------------------------------- |
| 多副本 Slave       | 即使 Master 宕机，多个 Slave 保留旧数据继续解析 |
| AXFR 并发同步       | Slave 实时从 Master 获取 zone        |
| Leader 选举快      | Lease 失效时间低（如 10s），快速重选         |
| 自动重载            | Slave 监听 zone 改动自动 reload       |
| PodAntiAffinity | 每个 Pod 不同节点，避免节点故障影响所有副本        |
| Readiness Check | 主切换时未准备好的 Pod 被 LB 暂时剔除         |


### Bind Specific Design

1. /var/lib/named/master VS /var/lib/named/slave VS /var/lib/named/dyn

“dyn 是动态更新区域”的含义？
在 BIND 中，如果一个 zone 被标记为 allow-update 或 update-policy，那么该区域可以使用 nsupdate 工具进行动态 DNS 更新，这种 zone 就叫做动态更新区域，简称 dyn 区域

“运行时自动生成和维护”的含义？
当 BIND 的 zone 文件启用动态更新功能后，BIND 不再推荐你手动去编辑 zone 文件。原因如下：

BIND 在运行时会直接将 zone 的修改写入 .jnl 文件（journal 文件），例如：
    /var/lib/named/dyn/yourzone.com.zone
    /var/lib/named/dyn/yourzone.com.zone.jnl   {/* 存储增量更新内容 */}

.zone.jnl 是 BIND 自动生成和维护的 增量数据库，在 reload 或定期 sync 时合并到 zone 文件。

如果你手动编辑了 dyn/ 目录下的 zone 文件，会导致 .jnl 和 .zone 文件之间 状态不一致或错误，BIND 有可能拒绝加载这个 zone。



✅ 你提出的目标需求（提炼）

我当前正在进行 K8S上的bind 集群设计
两套kubernetes statefulset 一套作为master 另一套作为slave 

Master statefulset 要求使用 leader election 选出一个pod进行write  其他pod 数据实时同步 随时做好切换准备，和当前进行write的pod没有任何数据差。 

Slave Statefulset 同步master的zone数据 负责客户端的请求 只负责客户端读的操作 没有写入

SVC 使用 Openstack Loadbalancer

使用 dyn 动态 zone（支持 allow-update）。

Bind Workdir 为 /var/lib/named
Bind Zone的文件夹为 /var/lib/named/dyn
主容器仅在成为 leader 后才启动 named
bind的主配置为 /etc/named.conf


🧠 问题核心分析
❓为什么“无数据差”切换困难？
这是 BIND 的限制：

master 使用 allow-update 写入数据，会产生 .jnl。

slave 不会同步 .jnl 文件，只同步 zone 数据。

如果 master 挂掉，新选出的 master 只有上次从 .zone 文件同步来的数据。


✅ 目标拆解
你希望在 Pod 被终止的 任何情况（无论 delete、Evicted、Node 异常）时，都能：

优雅关闭 BIND（named）：

停止监听 53 端口，避免继续接收请求。

持久化数据写入完成（zone 数据落盘，防止数据丢失）。

如果你使用 rndc 管理配置，必要时 rndc sync、stop、reconfig。

释放 Kubernetes Lease：

使得其他 Pod 能在 TTL 到期前及时接棒。

在 Grace Period 期间完成上面两个动作。


#### 遇到的挑战和困难：
1. 在 Kubernetes 环境中，also-notify 列出的 IP 地址通常是 静态配置的，而 K8S Pod 的 IP 是 动态变化的，因此你在虚拟机上用静态 IP 的方式配置 also-notify 在 K8S 中并不适用
also-notify 是 BIND 的设置，用于在区域变更时通知哪些 从服务器（slave/secondary），告知它们进行 zone transfer。
在 K8S 中，如果你用 StatefulSet 来部署 slave pods，它们的 DNS 名称是稳定的（例如：bind-slave-0.bind-slave.default.svc.cluster.local），但它们的 Pod IP 是会变的。

方案二：使用 hostname 而不是 IP（风险较高）
BIND 支持使用主机名作为 also-notify 的地址，但并不推荐，因为解析这些主机名是在 named 启动时完成一次，不能动态刷新。

```
also-notify { bind-slave-0.bind-slave.default.svc.cluster.local; };
```
⚠️ 问题在于：若 DNS 无法解析或某 pod 发生变更，named 仍会继续使用旧地址，可能无法正确通知。


#### 子弹库：
```
#!/bin/bash
inotifywait -m -e modify /etc/bind/named.conf | while read; do
  echo "[INFO] Config updated, reloading named"
  rndc reload || kill -SIGHUP "$(pgrep -f named)"
done
```





#### MISC: 
1. shell and kubectl patch are not good enough 

```
apiVersion: v1
kind: ConfigMap
metadata:
  name: bind-master-config
data:
  entrypoint.sh: |
    #!/bin/bash
    set -euo pipefail

    exec > >(tee -a /var/log/leader.log) 2>&1

    IDENTITY=$(hostname)
    LEASE_NAME="bind-master-leader"
    NAMESPACE="bind-test"
    TTL=5                    # Lease TTL 秒数
    RENEW_INTERVAL=5          # 每隔多少秒尝试检查/续租

    start_named=false

    # ========== 释放 Lease 的钩子 ==========
    release_lease() {
      echo "$(date) [$IDENTITY] Releasing lease before exit"
      kubectl patch lease "$LEASE_NAME" -n "$NAMESPACE" --type=merge -p \
        "{\"spec\":{\"holderIdentity\":\"\", \"renewTime\":null}" 2>/dev/null || true
    }

    trap release_lease EXIT SIGTERM SIGINT

    # ========== 主循环 ==========
    while true; do
      CURRENT=$(kubectl get lease "$LEASE_NAME" -n "$NAMESPACE" -o jsonpath='{.spec.holderIdentity}' 2>/dev/null || echo "")
      RENEW=$(kubectl get lease "$LEASE_NAME" -n "$NAMESPACE" -o jsonpath='{.spec.renewTime}' 2>/dev/null || echo "")
      NOW=$(date -u +%s)
      RENEW_TS=$(date -d "$RENEW" +%s 2>/dev/null || echo 0)

      echo "$(date) [$IDENTITY] Current lease holder: $CURRENT"

      if [[ -z "$CURRENT" || "$CURRENT" == "$IDENTITY" || "$NOW" -gt "$((RENEW_TS + TTL))" ]]; then
        # Renew or take over lease
        # ========== 我是 Leader，续租 ==========
        PATCH=$(cat <<EOF
    {
      "spec": {
        "holderIdentity": "$IDENTITY",
        "renewTime": "$(date -u +"%Y-%m-%dT%H:%M:%S.%6NZ")",
        "leaseDurationSeconds": $TTL
      }
    }
    EOF
    )
        kubectl patch lease "$LEASE_NAME" -n "$NAMESPACE" --type=merge -p "$PATCH" 2>/dev/null || true

        echo "$(date) [$IDENTITY] I am leader"

        if [ "$start_named" = false ]; then
          echo "$(date) [$IDENTITY] Starting named service"
          exec /usr/sbin/named -u named -c /etc/named.conf -fg &
          start_named=true
        fi
      else
        echo "$(date) [$IDENTITY] Not leader. $CURRENT is the leader, waiting for lease renewal..."
        if [ "$start_named" = true ]; then
          echo "$(date) [$IDENTITY] Lost leadership, stopping named"
          pkill -SIGTERM named || true
          start_named=false
        fi
      fi

      sleep "$RENEW_INTERVAL"
      # 你当前的 Leader Election 脚本是用 kubectl + shell 实现的自定义方案，虽然简单直观，但如你所见，它在 Pod 非正常退出、快速接管、并发 patch 等方面存在一些竞争边界问题。
    done
```
你当前的 Bash 脚本方案虽然实现了基本的 Leader Election，但它存在一些局限：

并发竞争控制弱：多个 Pod 同时抢占 Lease 时并不能保证只有一个成功。

容错能力弱：Pod 非正常退出时无法清理 Lease。

精度低：靠 shell 轮询 kubectl 判断时序，存在延迟。



### Logging design

Two parts:
- Container Logs: stdout/stderr
- Application Logs: 

1. use `exec <main process start>` to elevate the process to PID 1 
2. 