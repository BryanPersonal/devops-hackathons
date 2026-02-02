worknotes:

```
VAULT_VERSION="1.19.10+ent"

wget https://releases.hashicorp.com/vault/${VAULT_VERSION}/vault_${VAULT_VERSION}_linux_amd64.zip

unzip vault_${VAULT_VERSION}_linux_amd64.zip

mv vault /usr/local/bin

export VAULT_TOKEN=xxxx
export VAULT_NAMESPACE="gcs/pso_sidevops/playground"
export VAULT_ADDR=https://vault.tools.ppp/
```

```
# Vault Cheatsheet
vault auth list

  ROLE_ID=$(cat /vault/role-id/{{ .roleIdSecretValue }})
                  SECRET_ID=$(cat /vault/secret-id/{{ .secretIdSecretValue }})

                  export VAULT_TOKEN=$(vault write -format=json auth/approle/login \
                    role_id="$ROLE_ID" \
                    secret_id="$SECRET_ID" | jq -r .auth.client_token)

                  NEW_SECRET_JSON=$(vault write -format=json -f auth/approle/role/${VAULT_ROLE}/secret-id)

                  NEW_SECRET_ID=$(echo "$NEW_SECRET_JSON" | jq -r '.data.secret_id')

                  vault kv patch -mount="${VAULT_MOUNT_POINT}" "${KV_TARGET_PATH}" secret-id="$NEW_SECRET_ID"


  cat > dns-config.json << EOF
  {
    "api_endpoint": "https://dns.example.com",
    "api_key": "sk-xxxxxxxxxxxx",
    "zone_id": "123456789",
    "ttl": 3600,
    "proxied": true,
    "records": [
      {"name": "www", "type": "A", "value": "1.2.3.4"},
      {"name": "api", "type": "A", "value": "5.6.7.8"}
    ]
  }
  EOF

  写入文件内容

  vault kv put -namespace="gcs/pso_sidevops/k8s" -mount="sni" \
    live/cis-test/dns \
    @dns-config.json

 B. 环境变量方式（推荐用于脚本）

  # 设置全局环境变量
  export VAULT_ADDR="https://vault.example.com"
  export VAULT_NAMESPACE="gcs/pso_sidevops/k8s"

  # 之后不需要重复指定 namespace  This will overwrite old data!!! Don't run !!
  vault kv put -mount="sni" live/cis-test/dns \
    api_key="xxx" \
    zone_id="123"

vault kv get -format=json -mount="sni" -version=1 live/cis-test/dns | \
    jq '.data.data' > /tmp/dns-data.json

```