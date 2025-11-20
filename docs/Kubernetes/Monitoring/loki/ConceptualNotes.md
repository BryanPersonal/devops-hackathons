

举个实际例子（在监控/日志系统中）：
在 Prometheus 中：
`LabelSet{job="node_exporter", instance="localhost:9100"}` 可能匹配多个指标（如 cpu_usage, memory_free 等），每个指标是一个独立的 time series。
在 Loki / Vali 中：
`LabelSet{job="fluent-bit", worker="w1"}` 代表一个日志流`（log stream）`，所有具有相同标签的日志会被归到同一个流中。

- https://pkg.go.dev/github.com/prometheus/common@v0.67.1/model#LabelSet
- https://pkg.go.dev/github.com/credativ/vali@v0.0.0-20251016072548-c498b4e7ff00/pkg/util/flagext#LabelSet 