AdmissionController 
https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/

Admission Control（准入控制） 是 API Server 在“接收并持久化资源之前”的最后一道关卡。


Intercept the request at different stages. 
1. Mutating Admission Webhook 
2. Validating Admission Webhook (perferred)


| 特性         | **Mutating Webhook**  | **Validating Webhook** |
| ---------- | --------------------- | ---------------------- |
| **核心作用**   | **修改（Mutate）** 资源对象   | **验证（Validate）** 资源对象  |
| **执行顺序**   | 先执行                   | 后执行（在所有 Mutating 之后）   |
| **能否修改对象** | ✅ 可以修改请求体             | ❌ 只能读取，不能修改            |
| **能否拒绝请求** | ✅ 可以拒绝（但主要目的是修改）      | ✅ 可以拒绝                 |
| **典型用途**   | 注入 Sidecar、设置默认值、添加标签 | 策略检查、安全合规验证            |

架构级别理解

```
kubectl apply
    ↓
API Server
    ↓
Authentication
    ↓
Authorization
    ↓
Admission Chain
       ├── Mutating Webhooks   （改对象）
       ├── Validating Webhooks （拒绝对象）
    ↓
etcd

```

⭐ Mutating Webhook
> “用户写的不够好，我帮他改”
典型：
- 自动注入 sidecar（Istio）
- 自动加 resource limit
- 自动加 toleration
- 自动打 label

⭐ Validating Webhook

> “你这个配置不允许”
典型：
- 禁止 latest tag
- 禁止 privileged
- 禁止 hostPath
- 强制 limits

🔥 黄金原则（面试级）

能用 Validating 就不要 Mutating
原因：
- Mutating 会制造“幽灵配置”
- debug 极其痛苦
- GitOps diff 会混乱
生产大厂基本遵循：

`Validating > Mutating`