

Work notes:

```
helm show values fluent-bit --version 0.52.0 --repo https://fluent.github.io/helm-charts
```

SNI Fluentbit
https://github.tools.ppp/sni-helm-charts/sidevops-fluent-bit/blob/main/values.yaml

CIEA Fluentbit: https://github.tools.ppp/cia-helm-charts/fluentbit/blob/main/templates/fluentbit-config.yaml


https://github.tools.ppp/SIDEVOPS/sidevops-canary-sni-turing/blob/main/argocd/helm_charts/monitoring/fluent-bit/values.yaml


Technical Reference:
https://docs.fluentbit.io/manual/administration/configuring-fluent-bit/classic-mode/configuration-file

```mermaid
graph LR
A[Input Plugin 读取日志] --> B[创建 Chunk]
B --> C{存储类型?}
C -->|memory| D[内存中缓存]
C -->|filesystem| E[写入磁盘 .flb 文件]
D & E --> F[Engine 调度 Flush]
F --> G[Output Plugin 尝试发送]
G -->|成功| H[删除 Chunk]
G -->|失败| I[加入重试队列]
I -->|重试成功| H
I -->|达到最大重试| J[丢弃 或 移入死信队列]
```