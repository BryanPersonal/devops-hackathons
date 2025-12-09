JWT（JSON Web Token）是一种开放标准（RFC 7519），用于在各方之间安全地以 JSON 对象形式传递声明（claims）。它被设计为紧凑、自包含、可验证，常用于身份认证与授权场景。

## JWT 的基本结构

- 注意:JWT 通常用于授权（authorization），而非单纯的认证（authentication）。

## JWT 在 Kubernetes 中的核心应用

Kubernetes 原生支持 JWT 作为 ServiceAccount 的令牌载体，主要用于：

1. Pod 内进程访问 API Server —— ServiceAccount Token
2. 外部用户/系统集成 Kubernetes API —— OIDC（OpenID Connect）身份认证（例如接入 Dex、Keycloak、Auth0、Azure AD）
3. 其他应用场景：
   - Ingress 控制器认证：如 NGINX Ingress 的 `auth-url` 返回 JWT 供后端校验
   - Service Mesh（Istio）：用 JWT 实现跨服务身份认证（通常与 mTLS 结合）
   - `kubectl` 插件 / 自定义控制器：例如 `kubectl create token`（v1.24+）可生成短期 JWT

### 从 API Server 获取 JWKS 示例

命令:

```bash
❯ k get --raw /openid/v1/jwks | jq .
```

返回示例（JSON）：

```json
{
  "keys": [
    {
      "use": "sig",
      "kty": "RSA",
      "kid": "RLMxg7BW5JfKwxRFvvskdMbvqg7pmeG5AxqZKzNjkJ4",
      "alg": "RS256",
      "n": "2Mjcg59MArA5mSl-tIY6vqtAnAieUBck1q4ciIuFn4oriJGZ3eio1kxItsDrXhJzIUjl5FUyn1WXG0pSdspVYPuiNH6S1cHGyoSGpNPxGMeQ8Rgi4Anag1ccp4bJiLsz62eYTnfvyX5dAi4qO4KHT2ZfEumCuGPRbO8yFJbQkJHwa3Oo5eExMIpHG8exXGwFUBUwwuLXW9Kth0Fb8yY_Io9j6ruQAU84oOoTxDswdAvk7kWuZqQDy84oSFmNgWL4ZzhlSoNUbo8vx6CJ_bLQiSX6TOPwr0iObD6cdfkDVmEAKfiAbDRxZDQq67OSBYWpaoH1skplC6w76NdhCLlgzRZ6W4eMTDMAyesRzRcc-ry7inpsq42wqIX7jLPsY4f7jJxp27FQMnrpbImcwXlnvf-wBAQNgosAZwzlhpWxZUEyl3oV8RhXVkmTaKtr8KkoA6GWyU5yQ7CbBPIqBuKh9D7X5iAr_hk_rqAWiJmMIj12Ri_YtHP-WJwZtxLSECG4-O-Yqm8uTZTfoaZpP3S5v7kRzsTmQwdEgd-56FTrhJa7EBgbl1GhaFZ4yF70-saRnGuyG9YM3ME3vi7Ppw5NjE3xqlLG5ZBuS0OroXf1aDG48eJjSf08uTL5ixfmq2_bf2RUeX86q_1XdzVQ--t8KG85CoXjqqYlWF07oQwAU10",
      "e": "AQAB"
    }
  ]
}
```

### "n" 和 "e"

这是 RSA 公钥的两个关键参数：

- `n` = modulus（大整数）
- `e` = exponent（通常是 65537，对应 base64url 字符串 `AQAB`）

客户端可以通过这两个数构造出完整的 RSA 公钥（例如用于生成 PEM/DER），以便在 OpenSSL / x509 等传统工具链中使用。

## 背景与动机

为什么要把 JWK（JSON Web Key）中的 RSA 公钥转为 PEM？

主要原因在于不同生态对密钥格式的偏好与兼容性：

- 让 JWKS 中的公钥能在 OpenSSL、Nginx、curl、Go 的 `crypto/x509` 等传统工具链中直接使用
- 例如在自定义 webhook 中用 Go 验证 Kubernetes ServiceAccount token，通常需要 PEM 或 DER 格式的公钥

## 密钥格式对比

| 系统 / 工具 | 偏好的密钥格式 | 原因 |
|---|---|---|
| **Web / OIDC / JWT 生态**（如 Auth0、Keycloak、Kubernetes JWKS） | ✅ **JWK / JWKS**（JSON） | • 易嵌入 HTTP 响应（JSON API）• 天然支持多密钥轮换（`keys: []` • `kid` 字段便于密钥选择 |
| **传统 PKI / OpenSSL / TLS / SSH 生态** | ✅ **PEM**（Base64 文本） | • 与 X.509 证书体系深度集成• 几乎所有底层库（OpenSSL、GnuTLS、BoringSSL）原生支持• 便于人工查看、编辑、传输（纯文本） |