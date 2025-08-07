
Controller 是 Kubernetes 的核心组件之一/协调机制(Reconciliation)，用于确保集群的实际状态与用户声明的期望状态一致。其工作原理可概括为以下三点
1. 声明式API 用户通过 YAML/JSON 文件声明资源的期望状态（如副本数、镜像版本等），Kubernetes 将声明存储在 Etcd 中，并由 APIServer 统一管理。例如，用户定义一个 Deployment 时，仅需指定 replicas: 3，无需关注 Pod 的具体创建过程.

Key Features:
- 资源抽象：通过 API 对象（如 Deployment、StatefulSet）封装底层实现细节。
- 版本兼容：同一资源支持多版本共存（如 batch/v1 和 batch/v2alpha1），确保向后兼容
- 自定义扩展：通过 CRD（Custom Resource Definition）定义新资源类型（如 Network），实现功能扩展

2. 控制循环(Reconcile) - Controller 通过持续运行的调谐循环（Reconcile Loop）将实际状态向期望状态收敛。具体流程如下：
    Controller通过以下步骤实现调谐
    - 监控资源: 通过Kubernetes API的List-Watch机制监听资源（如Pod、Deployment的状态变化）
    - 计算差异
    - 执行操作
3. 协同与扩展机制
    - 通过事件通知机制（如 Kubernetes Events）实现资源间的协同工作
    - 通过自定义控制器（Custom Controller）扩展 Kubernetes 的功能和行为
