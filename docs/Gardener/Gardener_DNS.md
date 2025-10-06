


- helm package 
    - https://artifacthub.io/packages/helm/bitnami/external-dns
    - https://artifacthub.io/packages/helm/external-dns/external-dns/1.3.2
- Kubernetes Community SIGs (Special Interest Groups) - https://kubernetes-sigs.github.io/external-dns/v0.12.1/tutorials/rfc2136/#rfc2136-provider-configuration

Placeholder - Gardener DNS Extensions

```
Enable custom Landscape DNS by enabling `node-local-dns`<br>
POC ticket:https://jira.tools.sap/browse/SIDEVOPS-14841
Massive rollout ticket: https://jira.tools.sap/browse/SIDEVOPS-15059
https://convergedcloud.slack.com/archives/C9CEBQPGE/p1754053063924389 
https://pages.github.tools.sap/kubernetes/gardener/docs/landscapes/live/gardener/networking/custom-dns-config/
https://gardener.cloud/docs/gardener/networking/custom-dns-config/#node-local-dns

Implementation of customizing coreDNS's resolution chain.
Slack message: https://convergedcloud.slack.com/archives/C9CEBQPGE/p1754062993739349?thread_ts=1754053063.924389&cid=C9CEBQPGE
```

1. Customize CoreDNS Forwarding :gear:
You can override the default DNS forwarding behavior of CoreDNS by editing a special ConfigMap called coredns-custom in the kube-system namespace. You'll need to add a corefile.override key that reconfigures the forward plugin.

```
yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: coredns-custom
  namespace: kube-system
data:
  corefile.override: |
    forward . 100.90.0.8 100.90.1.169 100.70.20.3 100.70.20.2

kubectl -n kube-system rollout restart deploy coredns
```

2. Improve Performance with NodeLocalDNS :rocket:

You mentioned that DNS resolution is taking longer than expected. To address this and generally improve DNS performance and reliability, it is highly recommended to enable NodeLocalDNS. This feature runs a DNS cache on each cluster node, reducing latency and the number of queries to CoreDNS and upstream servers.

```
yaml
spec:
  systemComponents:
    nodeLocalDNS:
      enabled: true
```


Slack Conversation reported the introduced configmap is not working
```
https://convergedcloud.slack.com/archives/C9CEBQPGE/p1754636709537729  

apiVersion: v1
data:
  corefile.override: |
    forward . <custom-dns IP1> <custom-dns IP2>
kind: ConfigMap
metadata:
  annotations:
    resources.gardener.cloud/ignore: "true"      # The problem is likely the annotation resources.gardener.cloud/ignore: "true" in your coredns-custom ConfigMap. This annotation tells Gardener to completely ignore this resource, which prevents the Gardener control plane from processing your custom configuration and applying it to the CoreDNS pods.
  creationTimestamp: "2025-01-17T07:03:12Z"
  name: coredns-custom
```