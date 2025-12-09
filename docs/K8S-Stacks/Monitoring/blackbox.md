


```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blackbox-exporter-test
  labels:
    app: blackbox-exporter-test
spec:
  replicas: 1
  selector:
    matchLabels:
      app: blackbox-exporter-test
  template:
    metadata:
      labels:
        app: blackbox-exporter-test
    spec:
      imagePullSecrets:
        - name: regcred
      containers:
        - name: blackbox-exporter-test
          image: keppel.eu-de-1.cloud.ppp/neo-cc-cis-testing/blackboxexporter:latest
          ports:
            - containerPort: 9115
          args:
            - "--config.file=/etc/blackbox_exporter/config.yml"
          volumeMounts:
            - name: config
              mountPath: /etc/blackbox_exporter
      volumes:
        - name: config
          configMap:
            name: blackbox-config-test

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: blackbox-config-test
data:
  config.yml: |
    modules:
      http_2xx:
        prober: http
        timeout: 5s
        http:
          method: GET
      tcp_connect:
        prober: tcp
      icmp:
        prober: icmp

---
apiVersion: v1
kind: Service
metadata:
  name: blackbox-exporter-test
spec:
  selector:
    app: blackbox-exporter-test
  ports:
    - name: http-test
      port: 9115
      targetPort: 9115
  type: ClusterIP
```