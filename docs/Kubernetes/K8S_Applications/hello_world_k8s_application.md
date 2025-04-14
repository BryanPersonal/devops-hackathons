
Basic nginx application with openstack designate + nginx-ingress + nginx. 

:::danger
Be careful with A. `ingressClassName` in ingress 2. weburl map nginx-ingress IP 3. DNS Entry as best practice ?? FIXME: what if nginx-ingress helm chart got re-deployed.
:::


Deploy nginx-ingress by following the [Installation Guide](https://github.com/kubernetes/ingress-nginx/blob/main/docs/deploy/index.md#installation-guide)

```
helm upgrade --install ingress-nginx ingress-nginx \
  --repo https://kubernetes.github.io/ingress-nginx \
  --namespace ingress-nginx --create-namespace \
  --debug
```

Endpoint IP equals to ingress-nginx-controller svc EXTERNAL-IP.
```
i577081@W-PF3NF3XQ ~/k8s/to_be_delivered/web-app-scratch/workloads garden-sn1--sit-081-test-external$ k get svc -n ingress-nginx
NAME                                               TYPE           CLUSTER-IP        EXTERNAL-IP    PORT(S)                      AGE
nginx-ingress-ingress-nginx-controller             LoadBalancer   100.104.110.49    10.47.19.231   80:31154/TCP,443:31293/TCP   17h
nginx-ingress-ingress-nginx-controller-admission   ClusterIP      100.104.108.168   <none>         443/TCP                      17h
```

:::tip
ACME (Automatic Certificate Management Environemnt) is being covered by the following Ingress resource.
Extension Must be enabled from Gardener shoot cluster's manifest 
:::


```
spec:
    ...
    - type: shoot-cert-service
      providerConfig:
        apiVersion: service.cert.extensions.gardener.cloud/v1alpha1
        issuers:
          - email: bryan.chen01@sap.com
            name: sapca
            server: https://acme.pki.net.sap/pgwy/acme/directory
            precheckNameservers:
              - ns1.eu-de-1.cloud.sap
              - ns2.eu-de-1.cloud.sap
              - ns3.eu-de-1.cloud.sap
```


Ingress
```
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-example-ingress
  annotations:
    # Annotation to let Gardener now that it should manage the certificates for this Ingress
    cert.gardener.cloud/purpose: managed
    # Indicating cert-manager to use the custom issuer
    cert.gardener.cloud/issuer: sapca
    # Optional but recommended, this is going to create the DNS entry at the same time
    dns.gardener.cloud/class: garden
    dns.gardener.cloud/ttl: "600"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - "web081.in.sidevops.c.eu-de-1.cloud.sap"
      # Certificate and private key reside in this secret.
      secretName: testsecret-tls  
  rules:
    - host: "web081.in.sidevops.c.eu-de-1.cloud.sap"
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: nginx-service
                port:
                  number: 80
```

DNS Entry
```
apiVersion: dns.gardener.cloud/v1alpha1
kind: DNSEntry
metadata:
  annotations:
    # Let Gardener manage this DNS entry.
    dns.gardener.cloud/class: garden
  name: nginx-dnsentry
  namespace: web-app
spec:
  dnsName: web081.in.sidevops.c.eu-de-1.cloud.sap
  ttl: 600
  targets:
  - 10.47.19.231
```

svc
```
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
  namespace: web-app
  annotations:
spec:
  selector:
    app: nginx
  ports:
    - name: http
      port: 80
      targetPort: 80
    - name: https
      port: 443
      targetPort: 80
  type: LoadBalancer
```

Configmap
```
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-default-config
data:
  default.conf: |
    server {
      listen       80;
      listen  [::]:80;
      server_name  localhost;
      #access_log  /var/log/nginx/host.access.log  main;

      location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
      }

      proxy_set_header Connection "";
      proxy_redirect          off;
      proxy_set_header        X-Real-IP       $realip_remote_addr;
      proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header        X-Cache-Status  $upstream_cache_status;

      #error_page  404              /404.html;

      # redirect server error pages to the static page /50x.html
      #
      error_page   500 502 503 504  /50x.html;
      location = /50x.html {
        root   /usr/share/nginx/html;
      }

      location /bucket {
        proxy_pass https://objectstore-3.eu-nl-1.cloud.sap:443/v1/AUTH_adde6fddf0f8457f9b796c337aaa5842/081-container/;
        proxy_ssl_verify off;  # 如果不需要验证SSL证书
        rewrite ^/bucket/(.*)$ /$1 break;
        proxy_cache_valid 1h;
        proxy_cache_valid  404      1h;
        add_header X-Cache-Status $upstream_cache_status;
      }
    }
```

Deployment
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  namespace: web-app
spec:
  selector:
    matchLabels:
      app: nginx
  replicas: 3
  template:
    metadata:
      labels:
        app: nginx
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - nginx
              topologyKey: kubernetes.io/hostname
            weight: 80
      containers:
      - name: nginx
        image: nginx
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 50m         # 最小请求为 50 毫核
            memory: 64Mi     # 最小内存请求为 64Mi
          limits:
            cpu: 250m        # 最大允许 250 毫核
            memory: 256Mi    # 最大内存为 256Mi
        volumeMounts:
        - name: nginx-config-volume
          mountPath: /etc/nginx/conf.d/default.conf
          subPath: default.conf
      volumes:
      - name: nginx-config-volume
        configMap:
          name: nginx-default-config
```

