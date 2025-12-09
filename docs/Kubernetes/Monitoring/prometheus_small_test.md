

1. Prepare prometheus.yml

```
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "node_exporter_vm"
    static_configs:
      - targets: ["10.180.33.141:9100"]
        labels:
          app: "node_exporter"
          instance: "vm01"

```

2. Prepare configmap

```
kubectl create configmap prometheus-config \
  --from-file=prometheus.yml=./prometheus.yml
```

3. 

```
apiVersion: v1
kind: Pod
metadata:
  name: prometheus
  labels:
    app: prometheus
spec:
  imagePullSecrets:
    - name: regcred
  containers:
  - name: prometheus
    image: keppel.eu-de-1.cloud.ppp/neo-cc-cis-testing/prometheus:latest
    args:
      - "--config.file=/etc/prometheus/prometheus.yml"
      - "--storage.tsdb.path=/prometheus"
      - "--web.enable-lifecycle"
    ports:
      - containerPort: 9090
    volumeMounts:
      - name: config-volume
        mountPath: /etc/prometheus
  volumes:
    - name: config-volume
      configMap:
        name: prometheus-config

# Replicate secret from one namespace to another

kubectl get secret regcred -n monitoring -o yaml \
  | grep -v "^\s*uid:" \
  | grep -v "^\s*resourceVersion:" \
  | grep -v "^\s*creationTimestamp:" \
  | sed 's/namespace: monitoring/namespace: default/' \
  | kubectl apply -f -

```

4. 

Deployment node_exporter package from Virtualmachine and validate -> curl http://localhost:9100/metrics
Forward the port so that it can be accessible from localhost:9090
kubectl port-forward pod/prometheus 9090:9090

5. Check Endpoint/scrape target State
6. Test with stress-ng to monitor the caput