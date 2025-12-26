
1. Troubleshoot worker node related issues with priviledged pod and hostPath        

```
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: debug-ds
  namespace: default
spec:
  selector:
    matchLabels:
      name: debug
  template:
    metadata:
      labels:
        name: debug
    spec:
      hostPID: true
      containers:
      - name: debug
        image: busybox
        command: [ "sleep", "3600" ]
        securityContext:
          privileged: true
        volumeMounts:
        - name: host-etc
          mountPath: /host-etc
          readOnly: true
      volumes:
      - name: host-etc
        hostPath:
          path: /etc
```

2. Launch a net-utils troubleshoot pod
```
kubectl run curl --image=appropriate/curl -it --rm -- sh

https://github.com/nicolaka/netshoot 

```bash
kubectl run tmp-shell --rm -i --tty --overrides='{"spec": {"hostNetwork": true}}'  --image nicolaka/netshoot -n awx
```

## check NIC name / ip addr
kubectl debug node/shoot--sn1--sit-081-test-sitworker-j90ic-z1-69548-98j2w -it --image=busybox -- chroot /host
```

3. Debug priviledged container

```yaml
kubectl run debug-node \
  --namespace=default \
  --rm \
  --privileged=true \
  --image=cia-docker-live.int.repositories.cloud.ppp/sidevops-debugging:2.0.2 \
  --stdin \
  --env="PS1=\[\e[31m\]shoot--sn1--sit081-sitworker-f20z5-z1-74b9c-6q5sw\$ \[\e[0m\]" \
  --tty \
  --attach \
  --overrides='
{
  "apiVersion": "v1",
  "spec": {
    "hostIPC": true,
    "hostNetwork": true,
    "hostPID": true,
    "nodeSelector": {
      "kubernetes.io/hostname": "shoot--sn1--sit081-sitworker-f20z5-z1-74b9c-6q5sw"
    },
    "restartPolicy": "Never"
  }
}' \
  --command -- /bin/bash
```