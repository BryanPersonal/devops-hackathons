

```
kubectl exec -i consumer-0 -n ldap -- sh -c "echo | openssl s_client -connect localhost:60636 -showcerts 2>/dev/null | openssl x509 -noout -text | grep "Not After :""


# 如何使用AI去loop多个Gardener 集群并生成一个报告
```