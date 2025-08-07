

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