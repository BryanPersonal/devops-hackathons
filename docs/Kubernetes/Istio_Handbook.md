


- `istio/istiod` 是 Istio 的“大脑（控制面）”，
- `istio/gateway` 是对外/对内流量的“门卫（数据面入口）”。

```
❯ helm repo add istio https://istio-release.storage.googleapis.com/charts
❯ helm install istio-gateway istio/istiod -n istio-system --create-namespace
❯ helm search repo istio

helm template istio-base istio/base \
  --namespace istio-system \
  --version 1.28.3

istio/istiod   (Istio Control Plane)                            	1.28.3       	1.28.3     	Helm chart for istio control plane

(Important!) helm show values istio/istiod --version 1.28.3 查看已知可用的value

istio/istiod-remote                        	1.23.6       	1.23.6     	Helm chart for a remote cluster using an extern...
istio/ambient                              	1.28.3       	1.28.3     	Helm umbrella chart for ambient
istio/base    (CRDs/)                             	1.28.3       	1.28.3     	Helm chart for deploying Istio cluster resource...
istio/cni                                  	1.28.3       	1.28.3     	Helm chart for istio-cni components
istio/gateway  (Ingress Gateway)                            	1.28.3       	1.28.3     	Helm chart for deploying Istio gateways
istio/ztunnel                              	1.28.3       	1.28.3     	Helm chart for istio ztunnel components


Istio 的整体分层（你脑中要有这张图）
                ┌──────────────────────────┐
                │        istiod             │
                │  (Control Plane 控制面)   │
                └───────────▲──────────────┘
                            │ xDS
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────────────┐                      ┌────────────────┐
│ istio-gateway │                      │  Sidecar Envoy │
│ (Ingress/Egress)                     │ (每个 Pod  ) │
└───────────────┘                      └────────────────┘
        ↑
   外部流量入口

```