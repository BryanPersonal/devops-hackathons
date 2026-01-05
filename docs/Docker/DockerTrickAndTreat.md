
核心问题： MAC本地docker build 访问organization 内网registry时过慢。 但是在公司网络内的一台VDI则很快

```
 => [internal] load metadata for suse.int.repositories.cloud.sap/bci/golang:latest                 2.8s
 => [internal] load .dockerignore                                                                  0.0s
 => => transferring context: 2B                                                                    0.0s
 => [builder 1/7] FROM suse.int.repositories.cloud.sap/bci/golang:latest@sha256:867c4c22e8c4e48dd  8.3s
 => => resolve suse.int.repositories.cloud.sap/bci/golang:latest@sha256:867c4c22e8c4e48dd8fb8ffbc  0.0s
 => => sha256:668fbde68547f95a80489397a485634fed8b6fe211ecaec421145ffcbe7fd1a8 6.29MB / 115.46MB   8.3s
 => => sha256:a0bad52b8d03a50e2b9e0e036e9f86a7711cb8a89d892037cc3adf0cfe92812f 4.19MB / 47.61MB    8.2s  
```

解决方案
```
# 方式1：ssh 远程构建 + save/load
docker -H ssh://user@company-vm build -t dns-soa-relay:lspoc .
docker -H ssh://user@company-vm save dns-soa-relay:lspoc | docker load

# 方式2：配置 BuildKit 远程 builder（更专业）
docker buildx create --name remote --driver docker-container \
  --driver-opt image=moby/buildkit:latest \
  ssh://user@company-vm
docker buildx use remote
docker buildx build -t ... --push .   # 可直接推送到 keppel
```