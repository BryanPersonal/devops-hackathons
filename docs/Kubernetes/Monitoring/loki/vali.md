

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


 vali: https://github.com/credativ/vali
⚠️ Please refer old Loki version's documentation on its feature as it was forked from v2.2.1 - https://grafana.com/docs/loki/v2.2.x/


#### Popular api endpoints 
```
http://127.0.0.1:3100/api/prom/label

# check all logs based on one label
curl -G 'http://127.0.0.1:3100/vali/api/v1/query_range' \
  --data-urlencode 'query={app="bind-master"}' \
  --data-urlencode 'start=0' \
  --data-urlencode "end=$(date +%s)000000000" \
  --data-urlencode 'limit=5000' | jq .

```

#### fluentbit with loki 
```
[2025/10/20 04:51:38] [error] [config] loki: unknown configuration property 'sort_by_time'. The following properties are allowed: uri, tenant_id, tenant_id_key, labels, structured_metadata, structured_metadata_map_keys, auto_kubernetes_labels, drop_single_key, label_keys, remove_keys, line_format, label_map_pat │
│ [2025/10/20 04:51:38] [ help] try the command: /fluent-bit/bin/fluent-bit -o loki -h
```



https://github.tools.ppp/kubernetes/ops-guide/blob/091e7bebd90ad0cd153e00da207a29b246837d54/docs/operator-section/how-to-guides/operations-and-maintenance/retrieving-logs-via-logcli.md
https://github.tools.ppp/kubernetes/gardener-robot/blob/208c0cdf1d8933166c1e6c4957d397294b520718/robot/util/discovery.py

Gardener Fluent-bit to Vali
https://github.tools.ppp/kubernetes/ops-cel-rules/blob/5aa0f3ff297cd1e654d9dfec5756872bfd8c01b9/resources/fluent-bit-ds.yaml