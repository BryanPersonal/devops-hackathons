

HA-Proxy 
```
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: haproxy-config
data:
  haproxy.cfg: |
    global
        log stdout format raw daemon

    defaults
        mode http
        timeout connect 5000ms
        timeout client  50000ms
        timeout server  50000ms

    frontend http-in
        bind *:8080
        default_backend servers_nginx

    backend servers_nginx
        server backend1 backend-app:8080 check
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: haproxy
spec:
  replicas: 2
  selector:
    matchLabels:
      app: haproxy
  template:
    metadata:
      labels:
        app: haproxy
    spec:
      containers:
        - name: haproxy
          image: haproxy:2.7
          ports:
            - containerPort: 80
          volumeMounts:
            - name: haproxy-config
              mountPath: /usr/local/etc/haproxy/haproxy.cfg
              subPath: haproxy.cfg
          readinessProbe:
            httpGet:
              path: /
              port: 8080
      volumes:
        - name: haproxy-config
          configMap:
            name: haproxy-config
---
apiVersion: v1
kind: Service
metadata:
  name: haproxy-service
spec:
  type: LoadBalancer  # 可改为 NodePort 或 ClusterIP，看需求
  selector:
    app: haproxy
  ports:
    - port: 80
      targetPort: 8080
```

Nginx manifests as backend

```
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend-app
  template:
    metadata:
      labels:
        app: backend-app
    spec:
      containers:
        - name: nginx
          image: nginx:1.25
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: backend-app
spec:
  selector:
    app: backend-app
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 80

```