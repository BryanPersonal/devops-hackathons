

```
你可以在 values 文件中设置：
loki:
  extraEnvFrom:
    - secretRef:
        name: lokistack-dev-swift
然后：
helm template loki grafana/loki-stack -f values.yaml --version 2.10.2 | grep -A 5 envFrom

你应该看到类似：
envFrom:
  - secretRef:
      name: lokistack-dev-swift

helm pull grafana/loki-stack --version 2.10.2 --untar
```


Concepts:
 - Ingester = Loki 的写入器，负责接收日志、切分 chunk、写入存储、并在哈希环中保证副本和容错。
 - 