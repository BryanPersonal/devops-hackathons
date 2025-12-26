
#### Vault Server Specifics:
1.	`vault secrets list`
2.	`vault version` 
3.	`vault status`


#### Vault Client Specifics
1. Show the `vso-kv-ro` policy contents: `vault policy read vso-kv-ro`
2. Verify Kubernetes auth method is enabled `vault auth list`
3. Show the Kubernetes auth engine configuration: `vault read auth/kubernetes/config`
4. Show the Vault Kubernetes auth role configuration for `vso`: `vault read auth/kubernetes/role/vso`
5. Review Vault Kubernetes auth role configuration for Vault Agent: `vault read auth/kubernetes/role/agent`
6. List out the auth roles you created: `vault list auth/kubernetes/role`
7. enable the vso KV v2 secrets engine mount: `vault secrets enable -path=vso kv-v2`
8. Add secrets to the vso KV v2 mount:
```
vault kv put -mount=vso config \
    username='vso-user' \
    password='vso-suP3rsec(et!' \
    ttl='30s'

# Update password
vault kv put -mount=agent config \
    username='agent-user' \
    password='agent-R0tated' \
    ttl='30s'
```


#### Concepts:
1. The Vault Secrets Operator integrates with Kubernetes by monitoring its supported Kubernetes Custom Resource Definitions (CRD) for any changes and sychronizes specified source Vault secrets to defined Kubernetes destination secrets. While the secrets are replicated from Vault to Kubernetes, your application is responsible to consume, monitor, and continually integrate these from the Kubernetes secret resources.
2. Auth method  https://developer.hashicorp.com/vault/docs/auth/jwt
3. 