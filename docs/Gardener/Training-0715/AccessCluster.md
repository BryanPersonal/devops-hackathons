


https://gardener.cloud/docs/gardener/shoot/shoot_access/#shootsadminkubeconfig-subresource
```
i577081@W-PF3NF3XQ ~ garden-sni$ echo $NAMESPACE $SHOOT_NAME
garden-sn1 sit081
i577081@W-PF3NF3XQ ~ garden-sni$ kubectl create     -f <(printf '{"spec":{"expirationSeconds":600}}')     --raw /apis/core.gardener.cloud/v1beta1/namespaces/${NAMESPACE}/shoots/${SHOOT_NAME}/adminkubeconfig |     jq -r ".status.kubeconfig" |     base64 -d
```