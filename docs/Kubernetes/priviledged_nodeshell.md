



```
root@shoot--sni--maxwell-worker-default-z1-7f7f7-9hqfp:/var/tmp# find / -name "*.sock" 2>/dev/null | grep -E "(cri|containerd|crio|docker)"
/run/containerd/containerd.sock

export CONTAINER_RUNTIME_ENDPOINT=/run/containerd/containerd.sock

VERSION="v1.30.0"
wget -O- https://github.com/kubernetes-sigs/cri-tools/releases/download/$VERSION/crictl-$VERSION-linux-amd64.tar.gz \
  | tar -xz -C /var/tmp/

  I1103 02:50:27.932526 2273500 util_unix.go:103] "Using this endpoint is deprecated, please consider using full URL format" endpoint="/run/containerd/containerd.sock" URL="unix:///run/containerd/containerd.sock"

./crictl inspect 703e424684ea0 |less

root@shoot--sni--maxwell-worker-default-z1-7f7f7-9hqfp:/var/tmp#  nsenter -t 177071 -m -u -i -n -p
vali-sidevops-vali-0:/# ls

```