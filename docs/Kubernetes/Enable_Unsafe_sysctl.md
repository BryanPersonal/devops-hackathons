

Unsafe sysctl couldn't be applied from node level/Gardener cluster. Gardener don't natively support enablign unsafe sysctl from K8S node's kubelet. 

https://github.tools.ppp/kubernetes-live/issues-live/issues/7595#issuecomment-14529435
https://kubernetes.io/docs/tasks/administer-cluster/sysctl-cluster/

```
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-maintenance
  namespace: kube-system
spec:
  selector:
    matchLabels:
      app: node-maintenance
  template:
    metadata:
      labels:
        app: node-maintenance
    spec:
      hostPID: true
      hostNetwork: true
      tolerations:
        - operator: "Exists"   # 允许调度到所有节点
      restartPolicy: Always
      initContainers:
        - name: sysctl-config
          image: registry.suse.com/bci/bci-base:15.5
          securityContext:
            privileged: true
          command:
            - /bin/bash
            - -c
            - |
              set -e
              FILE="/var/lib/kubelet/extra_args"

              echo ">> Ensuring $FILE exists and is updated"

              mkdir -p /var/lib/kubelet

              # 如果文件已存在，先去掉旧的 KUBELET_EXTRA_ARGS 定义
              if [ -f "$FILE" ]; then
                grep -v '^KUBELET_EXTRA_ARGS=' "$FILE" > "$FILE.tmp" || true
                mv "$FILE.tmp" "$FILE"
              fi

              # 写入新的参数
              echo 'KUBELET_EXTRA_ARGS="--allowed-unsafe-sysctls=net.core.somaxconn"' >> "$FILE"

              echo ">> Updated $FILE successfully"
              echo ">> Please run on each node:"
              echo "   systemctl daemon-reload && systemctl restart kubelet"
              exit 0
          volumeMounts:
            - mountPath: /var/lib/kubelet
              name: kubelet-dir
              readOnly: false

      containers:
        - name: kubelet-restart-tooler
          image: registry.suse.com/bci/bci-base:15.5
          securityContext:
            privileged: true
          stdin: true
          tty: true
          # Unsecure exection which should be explicitly forbidden for production, please run with CHG.
          command:
            - /bin/bash
            - -c
            - |
              echo ">> Entering host namespace"
              nsenter --target 1 --mount --uts --ipc --net --pid -- bash -c 'systemctl daemon-reload && systemctl restart kubelet && sleep infinity && echo ">> Done, sleeping forever"'
          volumeMounts:
            - name: host-root
              mountPath: /host
              readOnly: false
            - name: dbus-socket
              mountPath: /run/dbus/system_bus_socket
              readOnly: false

      volumes:
        - name: kubelet-dir
          hostPath:
            path: /var/lib/kubelet
            type: DirectoryOrCreate
        - name: host-root
          hostPath:
            path: /
        - name: dbus-socket
          hostPath:
            path: /run/dbus/system_bus_socket


```