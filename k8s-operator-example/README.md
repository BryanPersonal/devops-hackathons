# Kubernetes WebServer Operator

这是一个最基本的 Kubernetes Operator 示例项目，演示了如何使用 controller-runtime 框架开发一个简单的 Operator。

## 项目概述

这个 Operator 管理 `WebServer` 自定义资源，它会根据 WebServer 资源的定义自动创建和管理：
- **Deployment**: 运行 Nginx 容器
- **Service**: 暴露 Nginx 服务

## 架构说明

### 核心组件

1. **Custom Resource Definition (CRD)**: 定义 `WebServer` 资源类型
2. **Controller**: 监听 WebServer 资源的变化，并协调 Deployment 和 Service
3. **Reconcile Loop**: 持续确保实际状态与期望状态一致

### 工作流程

```
用户创建 WebServer CR
    ↓
Controller 监听到变化
    ↓
Reconcile 函数被调用
    ↓
检查/创建 Deployment
    ↓
检查/创建 Service
    ↓
更新 WebServer 状态
    ↓
定期重新协调（每30秒）
```

## 项目结构

```
k8s-operator-example/
├── api/
│   └── v1/
│       ├── groupversion_info.go      # API 组版本定义
│       ├── webserver_types.go        # WebServer CRD 定义
│       └── zz_generated.deepcopy.go  # 自动生成的深拷贝代码
├── controllers/
│   └── webserver_controller.go       # Controller 实现
├── config/
│   ├── crd/
│   │   └── bases/                     # CRD YAML 定义
│   ├── rbac/                          # RBAC 权限配置
│   └── samples/                       # 示例资源
├── main.go                            # 程序入口
├── Makefile                           # 构建和部署脚本
├── Dockerfile                         # 容器镜像构建
└── go.mod                             # Go 模块定义
```

## 快速开始

### 前置要求

- Go 1.21 或更高版本
- Kubernetes 集群（v1.20+）
- kubectl 配置正确
- Docker（用于构建镜像）

### 1. 安装依赖工具

```bash
# 安装 controller-gen（用于生成代码和 CRD）
make controller-gen

# 安装 kustomize（用于部署配置）
make kustomize
```

### 2. 生成代码和清单

```bash
# 生成 CRD 和 RBAC 清单
make manifests

# 生成深拷贝代码（如果需要）
make generate
```

### 3. 本地运行（开发模式）

```bash
# 安装 CRD 到集群
make install

# 在本地运行 Operator（需要 kubeconfig 配置）
make run
```

### 4. 构建和部署

#### 方式一：本地构建并运行

```bash
# 构建二进制文件
make build

# 运行
./bin/manager
```

#### 方式二：构建 Docker 镜像并部署

```bash
# 构建镜像
make docker-build IMG=your-registry/webserver-operator:v1.0.0

# 推送镜像（可选）
make docker-push IMG=your-registry/webserver-operator:v1.0.0

# 部署到集群（需要先创建部署配置）
# 注意：需要先配置 config/default/kustomization.yaml
```

### 5. 创建示例资源

```bash
# 应用示例 WebServer 资源
kubectl apply -f config/samples/webserver_v1_webserver.yaml

# 查看 WebServer 资源
kubectl get webservers

# 查看详细信息
kubectl describe webserver webserver-sample

# 查看创建的 Deployment 和 Service
kubectl get deployments
kubectl get services
```

## 使用说明

### WebServer 资源定义

```yaml
apiVersion: webserver.example.com/v1
kind: WebServer
metadata:
  name: my-webserver
spec:
  replicas: 3          # Pod 副本数（1-10）
  image: nginx:latest  # 容器镜像（可选，默认 nginx:latest）
  port: 80             # 容器端口（可选，默认 80）
```

### 字段说明

- **replicas** (必需): 指定要创建的 Pod 副本数，范围 1-10
- **image** (可选): 容器镜像，默认为 `nginx:latest`
- **port** (可选): 容器监听的端口，默认为 `80`

### 查看状态

```bash
# 查看 WebServer 资源状态
kubectl get webserver webserver-sample -o yaml

# 查看状态字段
kubectl get webserver webserver-sample -o jsonpath='{.status}'
```

状态字段包括：
- `replicas`: 当前运行的 Pod 数量
- `readyReplicas`: 就绪的 Pod 数量
- `conditions`: 资源状态条件

### 更新资源

```bash
# 修改副本数
kubectl patch webserver webserver-sample -p '{"spec":{"replicas":5}}' --type=merge

# 或直接编辑
kubectl edit webserver webserver-sample
```

### 删除资源

```bash
# 删除 WebServer 资源（会自动删除相关的 Deployment 和 Service）
kubectl delete webserver webserver-sample
```

## 开发指南

### 修改 API 定义

1. 编辑 `api/v1/webserver_types.go`
2. 运行 `make manifests` 生成 CRD
3. 运行 `make generate` 生成深拷贝代码

### 修改 Controller 逻辑

1. 编辑 `controllers/webserver_controller.go`
2. 重新编译：`make build`
3. 重新运行：`make run`

### 添加新的资源类型

1. 在 `api/v1/` 中定义新的类型
2. 在 `controllers/` 中创建对应的 Controller
3. 在 `main.go` 中注册新的 Controller

## 工作原理详解

### Controller-Runtime 框架

本项目使用 `sigs.k8s.io/controller-runtime` 框架，它提供了：

1. **Manager**: 管理 Controller 的生命周期
2. **Reconciler**: 实现协调逻辑的接口
3. **Client**: Kubernetes API 客户端
4. **Cache**: 本地缓存，减少 API 调用

### Reconcile 循环

`Reconcile` 函数是 Operator 的核心：

```go
func (r *WebServerReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
    // 1. 获取 WebServer 资源
    // 2. 检查/创建 Deployment
    // 3. 检查/创建 Service
    // 4. 更新状态
    // 5. 返回结果（可能需要重新协调）
}
```

### Owner Reference

通过设置 Owner Reference，确保当 WebServer 被删除时，相关的 Deployment 和 Service 也会被自动删除（级联删除）。

### 状态更新

Controller 定期更新 WebServer 的状态，反映实际的运行情况：
- 当前副本数
- 就绪副本数
- 状态条件

## 常见问题

### Q: Operator 如何监听资源变化？

A: Controller-Runtime 使用 Informer 机制监听 Kubernetes API 的变化，当资源被创建、更新或删除时，会自动触发 Reconcile。

### Q: 如何调试 Operator？

A: 
1. 使用 `make run` 在本地运行，可以查看详细日志
2. 设置日志级别：`--zap-log-level=debug`
3. 使用 `kubectl logs` 查看运行中的 Operator 日志

### Q: 如何扩展功能？

A: 
1. 在 `WebServerSpec` 中添加新字段
2. 在 Controller 中实现对应的逻辑
3. 运行 `make manifests` 更新 CRD

## 清理

```bash
# 删除示例资源
kubectl delete -f config/samples/webserver_v1_webserver.yaml

# 卸载 CRD
make uninstall
```

## 参考资源

- [Kubernetes Operator 模式](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)
- [Controller-Runtime 文档](https://pkg.go.dev/sigs.k8s.io/controller-runtime)
- [Kubebuilder 文档](https://book.kubebuilder.io/)

## 许可证

MIT License





