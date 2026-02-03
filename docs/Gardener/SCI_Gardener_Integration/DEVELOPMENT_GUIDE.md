# Persephone 项目开发指南

## 项目概述

Persephone 是一个为 SAP Cloud Infrastructure 提供 Kubernetes 即服务（Kubernetes as a Service）的项目。它基于 Gardener 框架，通过自动化管理 OpenStack 凭证来实现 Kubernetes 集群的生命周期管理。

### 核心功能

- **OpenStack 凭证管理**：自动创建、轮换和清理 OpenStack 应用凭证
- **Gardener 集成**：与 Gardener 集群管理框架深度集成
- **Webhook 处理**：提供准入控制 webhooks 来管理集群创建和更新
- **多区域支持**：支持多个 OpenStack 区域的配置和管理
- **凭证自动轮换**：60 天有效期，50% 阈值自动轮换（30 天）

## 技术栈

### 核心技术

| 技术 | 版本 | 用途 |
|------|------|------|
| Go | 1.25.0 | 主要编程语言 |
| Gardener | v1.135.0 | Kubernetes 集群管理框架 |
| Controller-Runtime | v0.22.5 | Kubernetes Operator 框架 |
| Gophercloud | v2.10.0 | OpenStack API 客户端 |
| Kubernetes | v0.34.3 | Kubernetes 客户端库 |

### 主要依赖库

- **Gardener**：集群管理核心框架
- **Controller-Runtime**：构建 Kubernetes Operator 的框架
- **Gophercloud**：OpenStack SDK
- **Cobra**：CLI 命令行框架
- **Viper**：配置管理
- **Ginkgo/Gomega**：测试框架

## 项目架构

### 目录结构

```
persephone/
├── cmd/                          # 可执行程序入口
│   ├── scikube/                 # CLI 工具
│   │   └── main.go
│   │   └── cmd/                 # CLI 子命令
│   ├── persephone-operator/     # Operator 主程序
│   │   └── main.go
│   └── persephone-webhook/      # Webhook 服务
│       └── main.go
├── internal/                    # 内部包（不对外暴露）
│   ├── auth/                    # 认证相关
│   ├── config/                  # 配置管理
│   ├── constants/               # 常量定义
│   ├── controller/              # 控制器实现
│   │   ├── project/            # Project 控制器
│   │   ├── secret/             # Secret 控制器
│   │   └── shoot/              # Shoot 控制器
│   ├── kubernetes/              # Kubernetes 客户端工具
│   ├── openstack/               # OpenStack 客户端
│   └── webhook/                # Webhook 处理器
│       ├── shootadmission/      # Shoot 准入 webhook
│       └── token/               # Token 管理 webhook
├── config/                      # Kubernetes 部署配置
│   ├── persephone/             # Persephone 资源配置
│   └── environments/           # 环境配置
├── test/                        # 测试文件
│   └── integration/            # 集成测试
├── docs/                        # 项目文档
├── hack/                        # 开发脚本
└── vendor/                      # Go 依赖
```

### 核心组件

#### 1. Persephone Operator (`cmd/persephone-operator/`)

Kubernetes Operator，负责管理 Persephone 自定义资源。

**职责：**
- 运行多个控制器（Project、Secret、Shoot）
- 管理 Kubernetes 资源的生命周期
- 监听和处理资源变更事件

**入口文件：** `cmd/persephone-operator/main.go`

**关键流程：**
1. 解析命令行参数和配置文件
2. 创建 Controller Manager
3. 注册控制器
4. 启动 manager 并运行

#### 2. Persephone Webhook (`cmd/persephone-webhook/`)

Webhook 服务，提供准入控制功能。

**职责：**
- 提供 Mutating Webhook
- 处理 Shoot 创建和更新请求
- 管理 Token 认证

**入口文件：** `cmd/persephone-webhook/main.go`

**Webhook 类型：**
- **Shoot Admission Webhook**：处理 Shoot 创建/更新
- **Token Webhook**：处理 Token 认证

#### 3. Scikube CLI (`cmd/scikube/`)

命令行工具，用于与 Kubernetes 服务交互。

**主要命令：**
- `auth`：认证和获取 token
- `kubeconfig-for-garden`：获取 Garden kubeconfig
- `kubeconfig-for-shoot`：获取 Shoot kubeconfig
- `openstack`：OpenStack 相关操作

#### 4. 控制器（Controllers）

##### Project Controller (`internal/controller/project/`)
- 管理 Gardener Project 资源
- 处理项目级别的逻辑

##### Secret Controller (`internal/controller/secret/`)
- 管理存储 OpenStack 凭证的 Secret
- 处理凭证轮换（60 天有效期，30 天阈值）
- 清理过期的凭证

**核心逻辑：**
- **0-30 天**：确保 CredentialsBinding 存在
- **30-60 天**：创建新凭证
- **60+ 天**：删除旧凭证

##### Shoot Controller (`internal/controller/shoot/`)
- 管理 Gardener Shoot 资源（Kubernetes 集群）
- 更新 Shoot 使用最新的凭证
- 维护窗口检查
- 处理 Shoot 删除

#### 5. Webhook 处理器

##### Shoot Admission Webhook (`internal/webhook/shootadmission/`)
- 验证 Shoot 创建请求
- 自动注入必要的标签和注解
- 创建 OpenStack 资源

##### Token Webhook (`internal/webhook/token/`)
- 处理 Token 认证请求
- 验证和授权

### 数据流

```
┌─────────────┐
│   User/CLI  │
└──────┬──────┘
       │ 创建/更新 Shoot
       ↓
┌─────────────────────┐
│ Gardener API Server │
└──────┬──────────────┘
       │ Webhook 调用
       ↓
┌─────────────────────┐
│ Persephone Webhook  │ → 验证/修改请求
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│ Gardener 控制平面    │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────────────┐
│ Persephone Operator         │
│ - Secret Controller          │ → 创建/轮换凭证
│ - Shoot Controller           │ → 更新 Shoot 配置
│ - Project Controller         │ → 管理项目资源
└──────┬──────────────────────┘
       │
       ↓
┌─────────────────────┐
│    OpenStack API    │
└─────────────────────┘
```

## 开发环境搭建

### 前置要求

1. **Go**：1.25.0 或更高版本
2. **Docker**：用于构建镜像
3. **kubectl**：Kubernetes 命令行工具
4. **make**：构建工具（macOS 需使用 gmake）
5. **kind**：本地 Kubernetes 集群（用于本地开发）

### 安装步骤

#### 1. 克隆仓库

```bash
git clone https://github.wdf.sap.corp/sap-cloud-infrastructure/persephone.git
cd persephone
```

#### 2. 安装依赖

```bash
# 安装 Go 依赖
make vendor

# 或使用 go mod（推荐）
go mod download
```

#### 3. 构建项目

```bash
# 构建所有二进制文件
make build-all

# 构建单个二进制
make build/scikube
make build/persephone-operator
make build/persephone-webhook
```

#### 4. 安装开发工具

```bash
# 安装所有静态检查工具
make prepare-static-check

# 或单独安装
make install-goimports
make install-golangci-lint
make install-shellcheck
```

### 运行测试

```bash
# 运行单元测试和覆盖率检查
make build/cover.out

# 生成 HTML 覆盖率报告
make build/cover.html

# 运行集成测试
make test-integration
```

### 本地开发

#### 使用 Skaffold（推荐）

```bash
# 启动开发环境
skaffold debug --cleanup=false

# 这会：
# 1. 构建 Docker 镜像
# 2. 部署到本地 kind 集群
# 3. 监控文件变化并自动重新部署
```

#### 使用 Operator 本地运行

```bash
# 1. 准备配置文件
./hack/generate-admin-credentials.sh

# 2. 设置 kubeconfig
export KUBECONFIG=./_scratch/gardener/dev-setup/kubeconfigs/virtual-garden/kubeconfig

# 3. 运行 operator
go run ./cmd/persephone-operator/main.go \
    --kube-context admin-user-context \
    --config ./_scratch/admin-config.yaml
```

## 配置说明

### 配置文件结构

```yaml
# config/persephone/config.yaml
clusterUsersDomain: kubernikus              # 集群用户域名
defaultRegion: qa-de-1                      # 默认区域
landscape: qa                               # 景观名称（用于资源命名）
regions:                                    # 区域配置
  qa-de-1:
    enabled: true                           # 是否启用
    identityEndpoint: https://identity-3.qa-de-1.cloud.sap/
    applicationCredentialID: <ID>           # 应用凭证 ID
    applicationCredentialSecret: <Secret>   # 应用凭证密钥
  eu-nl-1:
    enabled: false
    identityEndpoint: https://identity-3.eu-nl-1.cloud.sap/
    applicationCredentialID:
    applicationCredentialSecret:
```

### 环境变量

可以通过环境变量覆盖配置：

```bash
# OpenStack 认证
export OS_AUTH_URL="https://identity-3.qa-de-1.cloud.sap/"
export OS_PROJECT_DOMAIN_NAME="Default"
export OS_PROJECT_NAME="my-project"
export OS_USER_DOMAIN_NAME="Default"
export OS_USERNAME="my-user"
export OS_PASSWORD="my-password"

# 应用凭证认证
export OS_APPLICATION_CREDENTIAL_ID="id"
export OS_APPLICATION_CREDENTIAL_NAME="name"
export OS_APPLICATION_CREDENTIAL_SECRET="secret"
```

## 关键概念

### Gardener 资源

#### Project
- 表示一个 Kubernetes 项目
- 包含多个 Shoot（集群）

#### Shoot
- 表示一个 Kubernetes 集群
- 通过 Gardener 创建和管理
- 引用凭证来访问基础设施

#### Secret
- 存储 OpenStack 应用凭证
- 包含过期时间注解
- 存储在 `secrets` 命名空间

#### CredentialsBinding
- 绑定 Secret 到 Shoot
- 由 Gardener 管理

### 凭证生命周期

```
创建          轮换(50%)          过期
  |----------------|----------------|
  0               30d               60d
      有效              两者都有效      旧凭证过期
```

**各阶段行为：**

1. **创建（0 天）**：
   - 创建 OpenStack 应用凭证
   - 创建 Secret
   - 创建 CredentialsBinding
   - 设置 60 天过期时间

2. **轮换阈值（30 天）**：
   - 创建新的应用凭证
   - 创建新的 Secret 和 Binding
   - 旧凭证仍然有效

3. **更新 Shoot**：
   - 在维护窗口内更新 Shoot 使用新凭证
   - 等待 Shoot 成功切换

4. **清理（60+ 天）**：
   - 删除旧 Secret
   - 删除 CredentialsBinding
   - 删除 OpenStack 应用凭证

### 标签和注解

#### Secret 标签
```yaml
labels:
  persephone.sci.cloud.sap/shoot-name: my-shot
  persephone.sci.cloud.sap/shoot-namespace: garden-myproject
  sci.cloud.sap/region: eu-de-1
  sci.cloud.sap/domain-name: monsoon3
  sci.cloud.sap/domain-id: abc123
  sci.cloud.sap/project-name: my-project
  sci.cloud.sap/project-id: xyz789
```

#### Secret 注解
```yaml
annotations:
  secret.persephone.sci.cloud.sap/expires-at: "2025-02-14T12:00:00Z"
```

#### Shoot 注解
```yaml
annotations:
  shoot.persephone.sci.cloud.sap/force-credentials-binding-update: "true"
```

## 开发指南

### 添加新功能

#### 1. 添加新的控制器

在 `internal/controller/` 创建新控制器目录：

```bash
mkdir internal/controller/myresource
```

实现控制器接口：

```go
// internal/controller/myresource/add.go
package myresource

import (
    "sigs.k8s.io/controller-runtime/pkg/manager"
)

const ControllerName = "myresource-controller"

func (r *Reconciler) AddToManager(mgr manager.Manager, maxConcurrentReconciles int) error {
    return builder.
        ControllerManagedBy(mgr).
        For(&myresourcev1.MyResource{}).
        WithOptions(controller.Options{MaxConcurrentReconciles: maxConcurrentReconciles}).
        Complete(r)
}
```

在 `internal/controller/add.go` 注册：

```go
if err := (&myresource.Reconciler{
    Config: cfg,
}).AddToManager(mgr, opts.Controllers.MyResource.MaxConcurrentReconciles); err != nil {
    return fmt.Errorf("failed adding %s controller: %w", myresource.ControllerName, err)
}
```

#### 2. 添加新的 Webhook

在 `internal/webhook/` 创建新 webhook：

```bash
mkdir internal/webhook/mywebhook
```

实现 webhook 处理器：

```go
// internal/webhook/mywebhook/handler.go
package mywebhook

import (
    "context"
    "net/http"

    admissionv1 "k8s.io/api/admission/v1"
    "sigs.k8s.io/controller-runtime/pkg/webhook/admission"
)

type Handler struct {
    Logger logr.Logger
}

func (h *Handler) Handle(ctx context.Context, req admission.Request) admission.Response {
    // 实现处理逻辑
    return admission.Allowed("ok")
}
```

在 `internal/webhook/add.go` 注册：

```go
if err := (&mywebhook.Handler{
    Logger: mgr.GetLogger().WithName(mywebhook.HandlerName),
    Client: mgr.GetClient(),
}).AddToManager(mgr); err != nil {
    return fmt.Errorf("failed adding %s webhook: %w", mywebhook.HandlerName, err)
}
```

### 代码规范

#### Go 代码风格

遵循 Go 官方代码规范：
- 使用 `gofmt` 格式化代码
- 使用 `goimports` 管理导入
- 遵循 Effective Go 指南

#### 运行静态检查

```bash
# 运行所有静态检查
make static-check

# 或分别运行
make run-golangci-lint
make run-shellcheck
make run-typos
```

#### License 头部

所有源文件必须包含 SPDX License 头部：

```go
// SPDX-FileCopyrightText: 2025 SAP SE or an SAP affiliate company
// SPDX-License-Identifier: Apache-2.0

package main
```

自动添加 License：

```bash
make license-headers
```

### 测试

#### 单元测试

```bash
# 运行特定包的测试
go test ./internal/controller/secret -v

# 运行所有测试（不包括集成测试）
make build/cover.out
```

#### 集成测试

```bash
# 运行所有集成测试
make test-integration

# 运行特定集成测试
./hack/test-integration.sh ./test/integration/controller/shoot/...
```

#### 测试覆盖率

```bash
# 生成覆盖率报告
make build/cover.html

# 查看覆盖率
open build/cover.html
```

### 调试

#### 本地调试

使用 `delve` 进行调试：

```bash
# 安装 delve
go install github.com/go-delve/delve/cmd/dlv@latest

# 调试 operator
dlv debug ./cmd/persephone-operator/main.go
```

#### 查看日志

```bash
# 查看 operator 日志
kubectl logs -n garden-local deployment/persephone-operator

# 查看 webhook 日志
kubectl logs -n garden-local deployment/persephone-webhook
```

### 常见任务

#### 强制凭证轮换

当凭证泄露或需要紧急轮换时：

```bash
# 1. 获取当前 Secret 名称
CURRENT_SECRET=$(kubectl get shoot <shoot-name> -n <namespace> -o jsonpath='{.spec.credentialsBindingName}')

# 2. 立即使当前 Secret 过期
kubectl annotate secret $CURRENT_SECRET -n secrets secret.persephone.sci.cloud.sap/expires-at-

# 3. 强制立即更新（绕过维护窗口）
kubectl annotate shoot <shoot-name> -n <namespace> \
  shoot.persephone.sci.cloud.sap/force-credentials-binding-update="true"

# 4. 等待 Shoot 切换，然后删除旧 Secret
kubectl delete secret $CURRENT_SECRET -n secrets
```

#### 查看凭证过期时间

```bash
# 查看所有 Secrets 及其过期时间
kubectl get secrets -n secrets \
  -o custom-columns=NAME:.metadata.name,EXPIRES:.metadata.annotations.secret\.persephone\.sci\.cloud\.sap/expires-at

# 查看特定 Shoot 的凭证
kubectl get secrets -n secrets \
  -l persephone.sci.cloud.sap/shoot-name=<shoot-name> \
  -o custom-columns=NAME:.metadata.name,EXPIRES:.metadata.annotations.secret\.persephone\.sci\.cloud\.sap/expires-at
```

## 部署

### 构建镜像

```bash
# 使用 Docker 构建
docker build -t persephone:latest .

# 或使用 Make
make build-all
```

### 使用 Skaffold 部署

```bash
# 部署到本地集群
skaffold run

# 部署到远程集群
skaffold run --kubeconfig <path-to-kubeconfig>
```

### 使用 kubectl 部署

```bash
# 应用配置
kubectl apply -f config/persephone/

# 或使用 kustomize
kubectl apply -k config/environments/local/
```

## 故障排查

### 常见问题

#### 1. Operator 无法启动

**症状：** Pod 处于 CrashLoopBackOff 状态

**解决：**
```bash
# 查看日志
kubectl logs -n garden-local deployment/persephone-operator

# 检查配置
kubectl get secret persephone-config -n garden-local -o yaml
```

#### 2. Secret 未创建

**症状：** 凭证 Secret 不存在

**解决：**
```bash
# 检查 Secret Controller 日志
kubectl logs -n garden-local deployment/persephone-operator -c manager | grep secret-controller

# 检查 OpenStack 连接
kubectl get secret persephone-config -n garden-local -o jsonpath='{.data.config\.yaml}' | base64 -d
```

#### 3. Shoot 未更新凭证

**症状：** Shoot 仍然使用旧凭证

**解决：**
```bash
# 检查维护窗口
kubectl get shoot <shoot-name> -n <namespace> -o yaml | grep -A 10 maintenance

# 强制更新
kubectl annotate shoot <shoot-name> -n <namespace> \
  shoot.persephone.sci.cloud.sap/force-credentials-binding-update="true"
```

#### 4. Webhook 失败

**症状：** Shoot 创建失败，webhook 错误

**解决：**
```bash
# 检查 webhook 服务
kubectl get svc -n garden-local | grep webhook

# 检查证书
kubectl get secret -n garden-local | grep webhook

# 查看 webhook 日志
kubectl logs -n garden-local deployment/persephone-webhook
```

### 日志级别

可以通过环境变量设置日志级别：

```bash
# 启用调试日志
export SCIKUBE_DEBUG=true

# 或在部署配置中设置
env:
  - name: SCIKUBE_DEBUG
    value: "true"
```

## 参考资料

### 相关项目

- [Gardener](https://github.com/gardener/gardener) - Kubernetes 集群管理框架
- [Controller-Runtime](https://github.com/kubernetes-sigs/controller-runtime) - Kubernetes Operator 框架
- [Gophercloud](https://github.com/gophercloud/gophercloud) - OpenStack Go SDK

### 文档

- [Gardener 文档](https://gardener.cloud/docs/)
- [Kubernetes Operator 模式](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)
- [OpenStack API](https://docs.openstack.org/api/)

### 内部文档

`credentials-management.md`

## 贡献指南

### 提交代码

1. 创建功能分支
   ```bash
   git checkout -b feature/my-feature
   ```

2. 进行更改并测试
   ```bash
   make build-all
   make build/cover.out
   make static-check
   ```

3. 提交更改
   ```bash
   git add .
   git commit -m "Add my feature"
   ```

4. 推送并创建 PR
   ```bash
   git push origin feature/my-feature
   ```

### 代码审查

确保：
- 所有测试通过
- 代码覆盖率没有降低
- 满足代码规范
- 包含必要的文档更新

### 发布流程

项目使用语义化版本（Semantic Versioning）：

- **主版本号**：不兼容的 API 更改
- **次版本号**：向后兼容的功能新增
- **修订号**：向后兼容的问题修复

## 附录

### Make 命令速查

| 命令 | 描述 |
|------|------|
| `make build-all` | 构建所有二进制 |
| `make check` | 运行所有检查 |
| `make static-check` | 运行静态代码检查 |
| `make build/cover.out` | 运行测试并生成覆盖率 |
| `make vendor` | 更新 vendor 目录 |
| `make clean` | 清理构建产物 |
| `make help` | 显示所有可用命令 |

### 常用 kubectl 命令

```bash
# 查看 Shoot 状态
kubectl get shoot -n <namespace>

# 查看 Secret
kubectl get secrets -n secrets

# 查看 Operator 日志
kubectl logs -n garden-local deployment/persephone-operator -f

# 查看 Webhook 配置
kubectl get mutatingwebhookconfiguration persephone-webhook -o yaml
```

### 项目联系

- **项目主页**：https://github.wdf.sap.corp/sap-cloud-infrastructure/persephone
- **问题跟踪**：GitHub Issues
- **文档**：docs/ 目录

---

**文档版本**：1.0
**最后更新**：2025
