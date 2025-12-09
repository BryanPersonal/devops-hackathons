

https://kubernetes.io/docs/tasks/administer-cluster/sysctl-cluster/#setting-sysctls-for-a-pod
```
https://github.tools.ppp/kubernetes-live/issues-live/issues/7595
Unfortunately, Gardener does not enable any unsafe sysctls as it would potentially impact the node stability in a negative way. Working with KUBELET_EXTRA_ARGS is the only way you could achieve this on particular nodes (via DaemonSet). See this PR for more details. Please note, that this is considered an advanced feature and as the Kubernetes documentation says, thorough testing is recommended.
```


`PodSecurityAdmission` replaced `PodSecurityPolicy`

https://kubernetes.io/docs/concepts/security/pod-security-admission/

My question to Gardener team on `unsafe sysctl`  https://github.wdf.ppp.corp/kubernetes/landscape-setup/issues/8298#issuecomment-14763252 