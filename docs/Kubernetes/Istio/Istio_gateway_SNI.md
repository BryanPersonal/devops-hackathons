



__Istio Gateway SNI (Server Name Indication)__ 是处理HTTPS 流量路由的关键机制，它允许单个 Istio Gateway（通常基于 Envoy 代理）在同一个 IP 地址和端口（通常是 443）上托管多个不同的 TLS 证书，并根据客户端请求中的域名将流量路由到正确的后端服务

在 Istio 中，Gateway SNI (Server Name Indication) 是处理 HTTPS 流量路由的关键机制，它允许单个 Istio Gateway（通常基于 Envoy 代理）在同一个 IP 地址和端口（通常是 443）上托管多个不同的 TLS 证书，并根据客户端请求中的域名将流量路由到正确的后端服务。

#### Question: 解释istio gateway SNI

1. 什么是 SNI？
SNI 是 TLS 协议的一个扩展。在标准的 TLS 握手过程中，客户端（如浏览器）会在“Client Hello”消息中明文发送它想要访问的主机名（域名）。
- 没有 SNI 时：服务器必须在握手开始前就知道使用哪个证书，因此一个 IP:Port 只能对应一个域名/证书。
- 有 SNI 时：服务器（Istio Gateway/Envoy）读取 Client Hello 中的主机名，动态选择匹配的 TLS 证书进行握手，并将后续流量路由到对应的 VirtualService。

2. Istio Gateway 中的 SNI 工作原理
在 Istio 架构中，Gateway 资源定义了负载均衡器的监听器配置。当配置了 HTTPS 或 TLS 模式时，SNI 发挥着核心作用：

- 监听配置：你在 Gateway 的 servers 列表中定义多个服务器块，它们可以监听相同的端口（如 443），但绑定不同的 hosts（域名）。
- 证书匹配：每个服务器块可以关联一个或多个 TLS 证书（通过 credentialName 引用 Kubernetes Secret，或直接配置 serverCertificate 等）。
- 路由决策：
    - 当外部客户端发起 HTTPS 请求时，Envoy 接收请求并读取 SNI 字段（例如 api.dummy.com）。
    - Envoy 在 Gateway 配置中查找匹配该 SNI 的 servers 条目。
    - 如果找到匹配项，Envoy 使用该条目配置的证书完成 TLS 握手。
    - 握手成功后，流量会根据绑定的 VirtualService 规则转发到集群内部的具体服务。

配置示例
以下是一个典型的 Gateway YAML 配置，展示了如何利用 SNI 在同一端口处理多个域名的 HTTPS 流量：
```
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: my-gateway
  namespace: istio-system
spec:
  selector:
    istio: ingressgateway # 选择 Istio 入口网关 Pod
  servers:
  port:
      number: 443
      name: https-api
      protocol: HTTPS
    hosts:
    "api.dummy.com" # 域名 1
    tls:
      mode: SIMPLE
      credentialName: api-tls-secret # 引用包含 api.dummy.com 证书的 K8s Secret
  port:
      number: 443
      name: https-web
      protocol: HTTPS
    hosts:
    "www.dummy.com" # 域名 2 (SNI 不同)
    tls:
      mode: SIMPLE
      credentialName: web-tls-secret # 引用包含 www.dummy.com 证书的 K8s Secret
```
关键点解析：
相同端口：两个 servers 块都监听 443 端口。
不同 Hosts：分别指定了 api.dummy.com 和 www.dummy.com。这就是 SNI 匹配的依据。
不同证书：根据 SNI 匹配到的 host，Envoy 会加载对应的 credentialName 中的证书。

4. 常见应用场景
- 多租户/多域名支持：在不增加额外 IP 地址或端口的情况下，为多个不同的业务域名提供 HTTPS 接入。
- 通配符证书：你可以配置一个通配符证书（如 *.dummy.com）来匹配多个子域名，或者为每个子域名配置独立证书以增强安全性隔离。
- TLS 透传 (Passthrough)：如果 tls.mode 设置为 PASSTHROUGH，Istio Gateway 不会终止 TLS，而是直接根据 SNI 信息将加密流量转发给后端服务（后端服务负责解密）。这在需要后端处理特定 TLS 扩展或私有协议时很有用。

5. 注意事项
- 客户端支持：绝大多数现代浏览器和 HTTP 客户端都支持 SNI。但在极旧的客户端（如 Windows XP 上的旧版 IE）或不支持 SNI 的工具中，连接可能会失败或收到默认证书。
- Host 匹配优先级：Istio 会按照最具体到最通用的顺序匹配 SNI。精确域名匹配优先于通配符匹配。
- VirtualService 绑定：配置好 Gateway 的 SNI 后，必须创建对应的 VirtualService，其 hosts 字段需与 Gateway 中的 hosts 一致，并将 gateways 字段指向该 Gateway，否则流量无法正确路由到内部服务。

总结来说，Istio Gateway 的 SNI 功能使得云原生环境能够高效、灵活地管理多域名 HTTPS 流量，是现代微服务架构中实现安全外部接入的标准做法。

#### 不同证书：根据 SNI 匹配到的 host，Envoy 会加载对应的 credentialName 中的证书。   上述使用SNI的例子是否需要创建多个证书，其SNI是如何应用的。 如何根据SNI匹配到对应的Host， 又为什么会有多个 credential  

这是一个非常深入且关键的问题。你的疑惑触及了 SNI 机制的核心逻辑：“先有鸡还是先有蛋”的问题——即 Envoy 如何在还没拿到证书（完成握手）之前，就知道该用哪个证书？

让我们拆解你的三个核心疑问：

1. 是否需要创建多个证书？
答案是：不一定，取决于你的业务需求和安全策略。

在之前的例子中，我展示了两个 credentialName（api-tls-secret 和 web-tls-secret），这暗示了有两个不同的证书。但这只是一种配置方式，并非 SNI 的强制要求。

你有两种选择：

方案 A：多个独立证书（多证书模式）
    场景：api.dummy.com 属于开发部，www.dummy.com 属于市场部，或者你需要为不同域名使用不同 CA 颁发的证书。
    做法：创建两个 Kubernetes Secret，每个包含一个域名的私钥和证书。
    SNI 的作用：客户端说“我要找 api.dummy.com”，Envoy 查找配置，发现匹配该域名的条目指向 api-tls-secret，于是拿出这个特定的证书给客户端。
    优点：权限隔离好，某个证书泄露不影响其他域名；可以混合使用不同供应商的证书。
    缺点：证书管理成本高（需要分别续期、监控）。

方案 B：单个通配符证书（单证书模式）
    场景：所有子域名都属于同一个组织，且你拥有 *.dummy.com 的通配符证书。
    做法：只创建一个 Kubernetes Secret，里面包含 *.dummy.com 的证书。
    配置变化：
    ```
                servers:
        port: ...
          hosts: ["api.dummy.com", "www.dummy.com"] # 注意：可以写在同一个 server 块里，也可以分开
          tls:
            mode: SIMPLE
            credentialName: wildcard-dummy-com-secret # 两个 host 共用同一个证书引用
     ```   
        或者，即使你像之前的例子那样把它们分写在两个 server 块里（为了路由逻辑清晰），你也可以让这两个块引用同一个 credentialName。
    SNI 的作用：客户端说“我要找 api.dummy.com”，Envoy 匹配到配置，拿出通配符证书。因为通配符证书本身就涵盖 api.dummy.com，所以握手成功。
    优点：管理简单，只需维护一个证书。
    缺点：私钥一旦泄露，所有子域名都不安全；通配符证书通常比单域名证书贵（如果是商业购买）。

结论：之前的例子展示“多个 credential”是为了演示最灵活的场景（不同域名完全独立），但在实际生产中，如果你有一个通配符证书，完全可以只用一个 credentialName。

2. SNI 是如何应用的？（“先匹配还是先握手？”）

这是最容易产生误解的地方。流程并不是“先加载证书 -> 再匹配 SNI”，而是反过来：

TLS 握手的特殊阶段（Client Hello）：

1. 客户端发起连接：客户端（浏览器）向 Istio Gateway 的 IP:443 发起 TCP 连接。
2. 发送 Client Hello（明文）：
    - 在 TLS 握手的第一步，客户端发送 Client Hello 消息。
    - 关键点：此时连接尚未加密。
    - 在这个消息中，包含了一个扩展字段叫 SNI (Server Name Indication)，里面明文写着客户端想访问的域名（例如 `api.dummy.com`）。
3. Envoy 拦截并读取 SNI：
    - Istio Gateway (Envoy) 收到 `Client Hello`。
    - Envoy 不需要证书来读取这个消息，因为它是明文的。
    - Envoy 解析出 SNI 字段的内容：`api.dummy.com`。
4. Envoy 进行路由/证书查找：
    - Envoy 拿着 api.dummy.com 去比对 Gateway 资源中定义的 servers 列表。
    - 它发现：`hosts: ["api.dummy.com"]` 这一项匹配成功。
    - 它查看该项配置：credentialName: api-tls-secret。
    - Envoy 从内存或 K8s Secret 中加载对应的证书和私钥。
5. 发送 Server Hello（加密开始）：
    - Envoy 使用刚刚找到的证书生成 Server Hello 响应，并完成后续的密钥交换。
    - 从此之后，通信才进入加密状态。
总结：SNI 是 TLS 握手中唯一在加密之前暴露域名信息的机制。Envoy 利用这个“时间窗口”来决定使用哪个证书。

3. 为什么会有多个 Credential？（设计意图）

既然可以用通配符证书解决所有问题，为什么 Istio 的设计允许（甚至鼓励在某些场景下使用）多个 credentialName？

1. 安全隔离（最小权限原则）：
    - 如果 api.dummy.com 处理敏感金融数据，而 blog.dummy.com 只是公开文章。
    - 使用独立证书意味着：如果 blog 的私钥被黑客窃取，api 的通信依然安全，黑客无法冒充 api 域名。
    - 如果使用通配符证书，blog 私钥泄露等于整个 *.dummy.com 沦陷。

2. 证书来源多样性：
    - 某些域名可能使用 Let's Encrypt 自动续期。
    - 某些核心域名可能购买的是昂贵的 EV（扩展验证）证书，需要人工审核。
    - 某些内部域名可能使用企业私有 CA 签发的证书。
    - Istio 必须支持这种混合管理模式，因此每个 server 块必须能独立指定 credentialName。

3. 生命周期管理不同：
    - 不同业务的证书过期时间可能不同。独立证书允许你单独更新某个域名的 Secret，而不影响其他域名的服务（避免全量重启或配置重载风险）。

4. 部分通配符的限制：
    - 你可能有 *.dev.dummy.com 的证书，但没有 *.prod.dummy.com 的证书。
    - 这时你必须为 dev 环境用一个证书，为 prod 环境用另一个证书，并在 Gateway 中通过 SNI 区分它们。

图解流程

```
*** 此时是明文，未加密 ***
[客户端 Browser]                          [Istio Gateway (Envoy)]
       |                                         |
       | 1. TCP Connect (IP:443)                 |
       |---------------------------------------->|
       |                                         |
       | 2. TLS Client Hello                     |
       |    (包含 SNI: "api.dummy.com")        |
       |    *** 此时是明文，未加密 ***           |
       |---------------------------------------->|
       |                                         |
       |                                         | 3. 解析 SNI: "api.dummy.com"
       |                                         | 4. 查找 Gateway 配置:
       |                                         |    Match: hosts=["api.dummy.com"]
       |                                         |    Action: Load cert from "api-tls-secret"
       |                                         |
       | 5. TLS Server Hello                     |
       |    (使用 "api-tls-secret" 中的证书)     |
       |<----------------------------------------|
       |                                         |
       | 6. 后续握手... (建立加密通道)           |
       |<=======================================>|
       |                                         |
       | 7. 发送加密的 HTTP 请求                 |
       |---------------------------------------->|
       |                                         | 8. 解密流量，根据 VirtualService 路由
```

总结回答你的疑问

是否需要多个证书？ 不需要，如果有通配符证书，可以共用一个。但为了安全和灵活性，常配置多个。
SNI 如何应用？ 利用 TLS 握手初期（Client Hello）的明文特性，Envoy 先读到域名，再决定加载哪个证书，最后才完成加密握手。
为什么有多个 Credential？ 为了支持不同域名的独立安全域、不同的证书颁发机构、不同的过期策略以及细粒度的权限控制。


#### 多租户/多域名支持：在不增加额外 IP 地址或端口的情况下，为多个不同的业务域名提供 HTTPS 接入。  哪里体现没有额外增加IP或端口

这是一个非常敏锐的问题！“不增加额外 IP 地址或端口”这个概念，是通过对比“没有 SNI 的时代”和“有 SNI 的时代”来体现的。

为了让你直观地理解，我们做一个“有无 SNI”的对比实验。

场景设定
假设你有两个业务域名：
api.dummy.com
www.dummy.com

你需要让它们都能通过 HTTPS (443 端口) 对外提供服务。

情况 A：如果没有 SNI (旧时代/无 SNI 支持)
>在 TLS 协议引入 SNI 扩展之前（或者客户端/服务器不支持 SNI 时），TLS 握手发生在 HTTP 请求之前。
- 困境：服务器在收到加密请求的瞬间，还不知道客户端想访问哪个域名（因为域名信息在加密层之后，或者根本没传）。
- 服务器的困惑：服务器只有一个 IP，但有两个不同的证书（`api` 的证书和 `www` 的证书）。它不知道该拿出哪张证书来建立连接。如果拿错了，浏览器会报“证书不匹配”的安全警告。
- 唯一的解决方案：物理隔离。
    - 你必须给 `api.dummy.com` 分配一个独立的 IP 地址（例如 `1.1.1.1`），并在该 IP 的 443 端口绑定 api 的证书。
    - 你必须给 `www.dummy.com` 分配另一个独立的 IP 地址（例如 `2.2.2.2`），并在该 IP 的 443 端口绑定 www 的证书。

结果：
- IP 消耗：2 个公网 IP。
- 端口消耗：2 个 443 端口（分别监听在不同 IP 上）。
- 成本：公网 IP 通常是昂贵的资源（尤其在云环境中），且 IPv4 地址已枯竭，很难申请到多个 IP。

```
[无 SNI 架构]
IP: 1.1.1.1 :443 --> 只能服务于 api.dummy.com (证书 A)
IP: 2.2.2.2 :443 --> 只能服务于 www.dummy.com (证书 B)
(必须为每个域名买一个 IP)
```

情况 B：使用 SNI (现代/Istio 默认)

有了 SNI，客户端在握手的第一步（Client Hello）就大声喊出了：“我要去 `api.dummy.com`！”

- 工作流程：
    1. Istio Gateway 只需要一个公网 IP（例如 1.1.1.1）。
    2. 在这个 IP 的一个端口（443）上监听。
    3. 当请求进来时：
        - 如果是 api 的请求 -> 加载证书 A。
        - 如果是 www 的请求 -> 加载证书 B。
    4. 一切都在同一个 TCP 连接通道内完成区分。

结果：
- IP 消耗：1 个公网 IP（节省了 1 个）。
- 端口消耗：1 个 443 端口。
- 成本：极大降低，配置极其灵活。

```
[有 SNI 架构 - Istio Gateway]
IP: 1.1.1.1 :443 --> 智能路由
                     |-- SNI="api..." -> 用证书 A -> 转发给 Service A
                     |-- SNI="www..." -> 用证书 B -> 转发给 Service B
(所有域名共享同一个 IP:Port)
```
具体体现在哪里？

回到你之前的 Istio 配置示例：

```
spec:
  selector:
    istio: ingressgateway # 这个 Pod 通常只绑定了一个 LoadBalancer IP
  servers:
  port:
      number: 443       #  监听 1.1.1.1:443
www.dummy.com -> 监听 1.1.1.1:444 (被迫换端口)
blog.dummy.com -> 监听 1.1.1.1:445 (再换端口)
```

这就叫“增加了额外的端口”。用户访问时必须显式指定端口（如 `https://www.dummy.com:444`），这既不安全（暴露非标准端口），用户体验也极差，且容易被防火墙拦截。

结论

“不增加额外 IP 或端口”的意思是：
利用 SNI 技术，Istio Gateway 可以在单一网卡 IP 和 标准 443 端口 上，通过软件逻辑（读取 SNI 字段）无限扩展支持的域名数量，而无需向云厂商购买更多 IP 地址，也无需让用户访问奇怪的端口号。


#### 在这个消息中，包含了一个扩展字段叫 SNI (Server Name Indication)，里面明文写着客户端想访问的域名（例如 api.dummy.com）。  也就是说客户端访问时候 会明文写着其想要访问的域名 对吗？

是的，完全正确。

在标准的 TLS 握手过程中（即你平时访问 https:// 网站时），客户端（浏览器、curl、手机 App 等）发送给服务器的 Client Hello 消息中，SNI 字段里的域名是明文（未加密）的。

这意味着：
谁能看到？
    你的 ISP（网络服务提供商）。
    公共 Wi-Fi 的管理员。
    网络路径上的任何路由器、防火墙或中间人攻击者。
    Istio Gateway (Envoy)：它必须能看到这个明文，才能决定用哪张证书来回应你。

什么被暴露了？
    暴露的是：你想要访问的具体域名（例如 api.dummy.com 或 www.google.com）。
    没有暴露的是：具体的 URL 路径（如 /users/123）、查询参数、Cookie、HTTP Header 以及请求体内容。这些内容在 TLS 握手完成后才会发送，那时已经是加密状态了。

为什么设计成明文？（逻辑死循环）

这是一个经典的“鸡生蛋，蛋生鸡”问题：
如果 SNI 是加密的，服务器就需要先有密钥（私钥）来解密它。
但是，服务器有很多把私钥（对应不同域名），它必须知道你想访问哪个域名，才能知道用哪一把私钥来解密。
结论：为了打破这个死循环，协议设计者规定：必须先明文告诉你我要找谁，你才能拿出对应的钥匙跟我建立加密通道。

这对隐私和安全有什么影响？

虽然具体的页面内容（如你看了什么文章、提交了什么表单）是安全的，但你的访问意图（去了哪个网站）是泄露的。

场景举例：
    如果你访问 https://medical-advice.dummy.com/cancer-treatment。
    网络监听者看不到 /cancer-treatment 这部分（这是加密的）。
    但监听者清楚地看到你连接了 medical-advice.dummy.com。这就足以推断你可能在寻求医疗帮助。

有没有解决方案？（ESNI / ECH）

正是因为 SNI 明文泄露隐私的问题，互联网工程任务组 (IETF) 推出了新的标准来加密 SNI：

ESNI (Encrypted SNI)：早期的尝试，但现在已废弃。
ECH (Encrypted Client Hello)：目前的最新标准。
    原理：客户端通过 DNS 记录获取服务器的公钥，用它把整个 Client Hello（包括 SNI）都加密起来。
    现状：
        需要客户端支持（如最新版 Chrome, Firefox）。
        需要服务端（Istio/Envoy）支持并配置相应的密钥。
        注意：如果使用了 ECH，通常需要一个“前置域名”（Fronting）或者默认证书来接收初始连接，然后内部再解密真实的 SNI。目前 Istio 对 ECH 的支持正在逐步完善中，但尚未像标准 SNI 那样普及。

总结

当前现状：是的，99% 的 HTTPS 流量中，域名（SNI）都是明文传输的。
Istio 的作用：Istio Gateway 正是利用这个“明文漏洞”来实现智能路由和证书匹配的。如果 SNI 被加密了且 Gateway 没有解密密钥，标准的 SNI 路由机制就会失效（除非配置了 ECH 支持）。
安全建议：不要假设“用了 HTTPS 别人就不知道我访问了哪个网站”。HTTPS 保护的是内容，而不是目的地。\






TLS 透传 (TLS Passthrough) 是 Istio Gateway 中一种特殊的流量处理模式。在这种模式下，Istio Gateway 完全不触碰 TLS 加密内容（不解密、不验证证书、不查看 HTTP 头），它仅仅充当一个「智能管道」，根据 TCP 握手阶段的 SNI (Server Name Indication) 字段，将加密数据包原封不动地转发给后端的 Kubernetes Service。

以下是最适合使用 TLS 透传的几种典型场景，以及为什么要这样做的深度解析：

### 后端服务需要「端到端」的 mTLS (双向认证)

这是最常见的使用场景。

- **场景描述**：你的客户端（如移动 App、合作伙伴系统）需要与后端服务进行严格的双向身份验证（mTLS）。客户端持有特定的证书，后端服务必须亲自验证这个客户端证书。
- **为什么不能用终止模式 (SIMPLE/MUTUAL)**：
  - 如果在 Istio Gateway 终止 TLS，Gateway 会先验证客户端证书。虽然 Gateway 可以将验证结果通过 Header 传给后端，但后端拿不到原始的客户端证书链，也无法执行自定义的、复杂的证书吊销检查或特定的加密套件策略。
  - 某些高安全合规要求（如金融、军工）规定：私钥和解密过程绝不能离开业务应用服务器。
- **透传的优势**：加密隧道直接从客户端延伸到后端 Pod。Istio 只是搬运工，后端服务直接拿到原始的 Client Hello，亲自完成握手和证书验证。

### 后端运行非 HTTP 协议 (gRPC, TCP, 私有二进制协议)

Istio 的 SIMPLE 或 MUTUAL 模式通常假设流量是 HTTP/HTTPS，以便进行 L7（应用层）路由（如基于 URL 路径 `/api/v1` 路由）。

- **场景描述**：
  - 后端是纯 TCP 服务（如数据库代理、Redis、SMTP 邮件服务器）。
  - 后端是 gRPC 服务，但你希望由 gRPC 服务器自己处理 TLS 细节，而不是让 Envoy 代理处理。
  - 后端使用自定义的二进制协议，该协议封装在 TLS 之内。
- **为什么适合透传**：
  - 在透传模式下，Istio 只工作在 L4（传输层）。它不关心里面跑的是 HTTP 还是其他协议。
  - 只要 SNI 能区分域名，它就能把加密的 TCP 流转发过去。后端服务负责解密并解析自己的私有协议。

### 需要后端控制特定的 TLS 扩展或版本

- **场景描述**：你的后端应用（如旧版的 Java 应用、特定的硬件网关软件）对 TLS 版本（如强制 TLS 1.0/1.1，或强制 TLS 1.3）、加密套件（Cipher Suites）有非常特殊且僵硬的要求，而 Istio (Envoy) 的默认配置或全局配置难以满足，或者你不想为了个别服务调整整个 Mesh 的 TLS 策略。
- **透传的优势**：将 TLS 协商的控制权完全交还给后端。后端代码里怎么写，握手就怎么进行，Istio 不做任何干预。

### 性能优化 (减少 CPU 开销) — 特定情况

- **场景描述**：在高吞吐场景下，TLS 加解密是非常消耗 CPU 的操作。
- **逻辑**：
  - **终止模式**：Istio Gateway 解密 → 内部网格可能再用 mTLS 加密 → 后端解密。这可能导致「双重加解密」。
  - **透传模式**：客户端加密 → (Istio 不处理) → 后端解密。只有一次加解密。
- **注意**：如果集群内部本身就需要 mTLS，透传并不能完全消除内部加密，但它消除了 Gateway 层的解密负担，将压力转移到了后端 Pod。如果后端 Pod 资源充足且位于同一信任域，这可能是一种架构选择。

### 遗留系统迁移

- **场景描述**：你有一个老旧的系统，它自己内置了完善的 TLS 处理逻辑和证书管理，现在想把它搬进 K8s，但不想修改它的代码去适配 Istio 的证书注入机制。
- **透传的优势**：你可以直接把流量「透传」给它，让它觉得自己还在原来的物理机上监听 443 端口，无需改造应用代码。

### 配置示例：如何开启 TLS 透传

在 Istio Gateway 中，将 tls.mode 设置为 PASSTHROUGH，并且不要配置 credentialName（因为 Gateway 不需要证书）。
```
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: tcp-passthrough-gateway
  namespace: istio-system
spec:
  selector:
    istio: ingressgateway
  servers:
  port:
      number: 443
      name: tls-passthrough
      protocol: TLS # 注意这里是 TLS 而不是 HTTPS
    hosts:
    "secure-db.dummy.com"
    tls:
      mode: PASSTHROUGH # 关键配置：开启透传

apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: secure-db-vs
  namespace: default
spec:
  hosts:
  "secure-db.dummy.com"
  gateways:
  istio-system/tcp-passthrough-gateway
  tcp: # 注意这里使用 tcp 路由规则，而不是 http
  match:
    port: 443
      sniHosts:
      "secure-db.dummy.com" # 必须指定 SNI 匹配，否则不知道转发给谁
    route:
    destination:
        host: my-secure-db-service
        port:
          number: 5432 # 后端数据库实际端口
```
⚠️ 重要权衡：使用透传的代价

虽然透传很有用，但它牺牲了 Istio 最强大的功能。一旦开启透传：

1. 失去 L7 路由能力：你不能基于 URL 路径（/api, /v1）、HTTP Method (GET/POST) 或 HTTP Header 进行路由。只能基于 域名 (SNI) 和 端口 路由。
2. 失去可观测性：Istio 的监控面板（Kiali, Prometheus）将无法看到具体的 HTTP 状态码（200, 404, 500）、请求延迟分布或具体的 API 调用链路。你只能看到 TCP 连接的成功/失败和流量字节数。
3. 失去安全策略：无法在 Gateway 层应用 JWT 认证、CORS 策略、速率限制（Rate Limiting）或 WAF（Web 应用防火墙）规则。这些必须在后端服务自己实现。
4. 证书管理复杂化：你需要手动将证书分发到每一个后端 Pod，或者在后端实现自动续期逻辑（如 cert-manager 的 sidecar 模式），而不能利用 Istio 统一的 Secret 管理。

总结：什么时候选？
| 需求 | 推荐模式 | 原因 |
| :--- | :--- | :--- |
| 标准 Web 服务 (HTTP/HTTPS) | SIMPLE / MUTUAL (终止) | 需要 L7 路由、监控、统一证书管理、WAF。 |
| 后端需验证客户端证书 (mTLS) | PASSTHROUGH (透传) | 后端必须拿到原始证书进行业务逻辑判断。 |
| 非 HTTP 协议 (TCP/gRPC/DB) | PASSTHROUGH (透传) | 协议不兼容 HTTP 路由，或需后端处理 TLS。 |
| 合规要求私钥不出应用 | PASSTHROUGH (透传) | 满足审计要求，解密过程在应用内。 |
| 需要基于 URL 路径路由 | SIMPLE (终止) | 透传模式不支持路径路由。 |
| 需要详细的 HTTP 监控 | SIMPLE (终止) | 透传模式下看不到 HTTP 细节。 |



一句话建议：除非你有非常明确的理由（如 mTLS 端到端、非 HTTP 协议、合规强控），否则优先使用 TLS 终止模式，以享受 Service Mesh 带来的可观测性、安全性和流量治理红利。