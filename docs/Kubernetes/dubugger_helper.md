
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
```
kubectl run tmp-shell --rm -i --tty --overrides='{"spec": {"hostNetwork": true}}'  --image nicolaka/netshoot -n awx
```

## check NIC name / ip addr
kubectl debug node/shoot--sn1--sit-081-test-sitworker-j90ic-z1-69548-98j2w -it --image=busybox -- chroot /host
```