
Kubebuilder 是一个基于 Controller-Runtime 库的框架，用于快速构建 Kubernetes API（CRD）和控制器（Controller）。它遵循 Kubernetes 的标准设计理念，通过生成脚手架代码来简化开发。

Kubebuilder 的 Controller 开发流程是：
定义 API（Types） → 实现调和逻辑（Reconcile） → 本地验证 → 构建部署 → 迭代优化

开发前应该问自己的问题：
1. 这个东西需要长期跑着管状态吗？
2. 状态错了，要不要自动修？
3. 是否需要 .status 给人 / 系统看

Concepts:
1. Operator: a controller that manages custom resources. 
    - CRD: podTracker
2. Controller: CONTROLLERS ARE THE CORE OF KUBERNETES AND OF ANY OPERATOR - QUOTE FROM KUBERBUILDER BOOK
    - Controller is __reconcilation__ loop as the fundamental concept of kubernetes

Reference:
https://book.kubebuilder.io/


```

❯ kubebuilder init --domain devops.toolbox --repo devops.toolbox/controller
INFO Writing kustomize manifests for you to edit...
INFO Writing scaffold for you to edit...
INFO Get controller runtime
go: downloading k8s.io/apimachinery v0.34.1


❯ make manifests

❯ kubebuilder create api --group crd --version v1 --kind PodTracker
INFO Create Resource [y/n]
y
INFO Create Controller [y/n]
y
INFO Writing kustomize manifests for you to edit...
INFO Writing scaffold for you to edit...
INFO api/v1/podtracker_types.go
INFO api/v1/groupversion_info.go
INFO internal/controller/suite_test.go
INFO internal/controller/podtracker_controller.go
INFO internal/controller/podtracker_controller_test.go
INFO Update dependencies
INFO Running makek3d
mkdir -p "/Users/I577081/Workdir/kubernetes/k8s-controll


> make install  // to install the crd

命令	作用
kubebuilder init	初始化项目
kubebuilder create api	创建 CRD + Controller
make manifests	生成 CRD YAML
make generate	生成 deepcopy
make install	安装 CRD 到集群
make run	本地运行 controller
make docker-build	构建镜像
make deploy	部署 controller 到集群

```


20260115 Kick-Off Bind-Operator development

```
❯ kubebuilder init --domain bind.sni.sap --repo github.tools.sap/i577081/bind-operator 

❯ kubebuilder create api --group crd --version v1 --kind BindOperator
INFO Create Resource [y/n]
y
INFO Create Controller [y/n]
y
INFO Writing kustomize manifests for you to edit...
INFO Writing scaffold for you to edit...
INFO api/v1/bindoperator_types.go
INFO api/v1/groupversion_info.go
INFO internal/controller/suite_test.go
INFO internal/controller/bindoperator_controller.go
INFO internal/controller/bindoperator_controller_test.go
INFO Update dependencies
INFO Running make
mkdir -p "/Users/I577081/Workdir/kubernetes/bind-operator/bin"
Downloading sigs.k8s.io/controller-tools/cmd/controller-gen@v0.19.0
"/Users/I577081/Workdir/kubernetes/bind-operator/bin/controller-gen" object:headerFile="hack/boilerplate.go.txt" paths="./..."
Next: implement your new API and generate the manifests (e.g. CRDs,CRs) with:
$ make manifests

```


`podtracker_types.go` 的设计思想，核心是 “声明式 API + 资源状态分离
`Declarative`声明式而非`Imperative`命令式

