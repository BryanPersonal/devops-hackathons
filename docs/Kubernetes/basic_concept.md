
Controller 是 Kubernetes 的核心组件之一，用于确保集群的实际状态与用户声明的期望状态一致。其工作原理可概括为以下三点
1. 声明式API
2. 控制循环(Reconcile)
    Controller通过以下步骤实现调谐
    - 监控资源: 通过Kubernetes API的List-Watch机制监听资源（如Pod、Deployment的状态变化）
    - 计算差异
    - 执行操作
3. 