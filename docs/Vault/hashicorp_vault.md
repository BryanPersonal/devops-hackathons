

#### Starting points:

```
export VAULT_TOKEN=<your-vault-token>
export VAULT_NAMESPACE="gcs/pso_sidevops/playground"
export VAULT_ADDR=https://vault.tools.sap/
```

- https://pages.github.tools.sap/github/features-and-how-tos/features/actions/how-tos/security-hardening#using-github-app-tokens
- https://github.tools.sap/I502888/public_pocs/tree/main/vault-jwt-signing



Hashicorp Vault中的认证方法
- (AppRole)[https://www.vaultproject.io/docs/auth/approle] 
    - Role ID：公开的信息，类似于用户名。
    - Secret ID：机密信息，类似于密码。
    - AppRole：一组策略定义了访问 Vault 的权限。
- Vault-Secret-Operator (K8S)




#### Cheatsheet

```
vault list auth/approle/role
    Keys
      i542016
      si_devops_platouser0
      si_devops_platouser1
      test_approle
      vso
      webapp

vault read auth/approle/role/si_devops_platouser0
Key                     Value                 
bind_secret_id          true                  
local_secret_ids        false                 
policies                ["app_role_read_only"]
secret_id_bound_cidrs   null                  
secret_id_num_uses      0                     
secret_id_ttl           0                     
token_bound_cidrs       []                    
token_explicit_max_ttl  0                     
token_max_ttl           0                     
token_no_default_policy false                 
token_num_uses          0                     
token_period            0                     
token_policies          ["app_role_read_only"]
token_ttl               0                     
token_type              default   

# kv-get <search enginee>/<path>/<path>/<secret>
vault kv-get kv-081/sn1/081

# <important> How-to create approle and HCP Policy
vault write auth/approle/role/<role_name> \
    secret_id_ttl=20m \
    secret_id_num_uses=10 \
    token_num_uses=10 \
    token_ttl=20m \
    token_max_ttl=30m \
    policies=<policy_name> \
    bind_secret_id=true

    ######### Step by step Secret creation
    # Step1: Create a policy
        path "kv-081/sn1/081/*" {
            capabilities = ["read", "list"]
        }
    # Step2: 创建 AppRole 并绑定 policy
        # vault policy read <policy_name>
        vault write auth/approle/role/myapp-role policies="myapp-policy"
        vault write auth/approle/role/httpcli-role policies="http_cli_readonly_bryan"

    i577081@W-PF3NF3XQ ~ $ vault write -f auth/approle/role/httpcli-role/secret-id
    WARN[0000]log.go:244 gosnowflake.(*defaultLogger).Warn DBUS_SESSION_BUS_ADDRESS envvar looks to be not set, this can lead to runaway dbus-daemon processes. To avoid this, set envvar DBUS_SESSION_BUS_ADDRESS=$XDG_RUNTIME_DIR/bus (if it exists) or DBUS_SESSION_BUS_ADDRESS=/dev/null.
    Key                   Value
    ---                   -----
    secret_id             f362194a-9a97-8a50-d955-862861e9d2b9
    secret_id_accessor    861d31db-b10b-7a85-4ca0-4c20570af10a
    secret_id_num_uses    0
    secret_id_ttl         0s
    #########
# Enable kv secret engine for the vault namespace
# Make sure that you are in the admin_users for the child namespace
vault secrets enable -namespace=bd/<child-namespace> -version=2 kv




```