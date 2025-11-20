

It is fine to deploy in one node only as it scrape everything globally with this anootation
`prometheus.io/scrape: "true"` 

```yaml
- honor_labels: true
  job_name: kubernetes-service-endpoints
  kubernetes_sd_configs:
    ## https://prometheus.io/docs/prometheus/latest/configuration/configuration/#endpoints
  - role: endpoints
  relabel_configs:
  - action: keep
    regex: true
    source_labels:
    - __meta_kubernetes_service_annotation_prometheus_io_scrape
  - action: drop
    regex: true
    source_labels:
    - __meta_kubernetes_service_annotation_prometheus_io_scrape_slow
  - action: replace
    regex: (https?)
    source_labels:
    - __meta_kubernetes_service_annotation_prometheus_io_scheme
    target_label: __scheme__
  - action: replace
    regex: (.+)
    source_labels:
    - __meta_kubernetes_service_annotation_prometheus_io_path
    target_label: __metrics_path__
  - action: replace
    regex: (.+?)(?::\d+)?;(\d+)
    replacement: $1:$2
    source_labels:
    - __address__
    - __meta_kubernetes_service_annotation_prometheus_io_port
    target_label: __address__
  - action: labelmap
    regex: __meta_kubernetes_service_annotation_prometheus_io_param_(.+)
    replacement: __param_$1
  - action: labelmap
    regex: __meta_kubernetes_service_label_(.+)
  - action: replace
    source_labels:
    - __meta_kubernetes_namespace
    target_label: namespace
  - action: replace
    source_labels:
    - __meta_kubernetes_service_name
    target_label: service
  - action: replace
    source_labels:
    - __meta_kubernetes_pod_node_name
    target_label: node
```