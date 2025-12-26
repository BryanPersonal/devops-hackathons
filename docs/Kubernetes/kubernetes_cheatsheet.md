
0. How to decode secret fastly

```
kubectl get secret vso-kv -o jsonpath='{.data._raw}' | base64 --decode | jq -r .data
k get secret cloud-provider-config -n kube-system -o jsonpath='{.data.cloudprovider\.conf}' | base64 --decode
```

1. View multi-containers' pod logs: `k logs -f bind-landscape-0 --all-containers -n bind-test --prefix`

```
# Use dry-run to generate yaml file 
kubectl run testpod --image=busybox --dry-run=client -o yaml
# Basic command to run pod with image nginx
kubectl run nginx01 --image=nginx

# In multi-pod container, navigate inside one of the pod inside container
kubectl exec -it test-pod -c nginx --sh

sshh={..user}'  
```
i577081@W-PF3NF3XQ:~$ kubectl config current-context
garden-bryan-demo--01sandbox-external
i577081@W-PF3NF3XQ:~$ kubectl config get-contexts
CURRENT   NAME                                                  CLUSTER                                               AUTHINFO                       NAMESPACE
*         garden-bryan-demo--01sandbox-external                 garden-bryan-demo--01sandbox-external                 garden-bryan-demo--01sandbox   default
          garden-bryan-demo--01sandbox-internal                 garden-bryan-demo--01sandbox-internal                 garden-bryan-demo--01sandbox   default
          garden-bryan-demo--01sandbox-service-account-issuer   garden-bryan-demo--01sandbox-service-account-issuer   garden-bryan-demo--01sandbox   default
```


# launch a pod from cluster for connection testing purpose. (address bottomneck due to missing network debug pkg/utilities from default nginx image)
kubectl run curl --image=appropriate/curl -it --rm -- sh

# Current namespace
kubectl config view --minify --output 'jsonpath={..namespace}'

# Switch namespace
kubectl config set-context --current --namespace=argocd

# Security related / Validate what permission do I have
kubectl auth can-i <verb> <resource> -n <namespace>
kubectl auth can-i get pods -n kube-system
# Validate on behalf of another user
kubectl auth can-i delete pods --as alice
$ kubectl --as system:serviceaccount:argo:argocd-server auth can-i list pods -n argo
no
$ kubectl --as system:serviceaccount:argo:argocd-server auth can-i get pods -n argo
yes
$ kubectl --as system:serviceaccount:argo:argocd-application-controller auth can-i list pods
yes

// create secret with type docker-registry from file
kubectl create secret docker-registry image-cia-registry --from-file=.dockerconfigjson=cia_image_registry.
json -n argocd

# Check RBACs
kubectl get roles/clusterroles/rolebindings/clusterrolebindings

kubectl describe clusterrole view

# Drain the node when one of nodes is unhealthy

kubectl drain shoot--sn1--sit081-sitworker-vd9yy-z1-5f6bd-ct6bp --ignore-daemonsets --delete-emptydir-data


# Label pods
kubectl label -h
kubectl label pod web-0 env=uat

# Check endpoint IPs
kubectl get endpoints suppliers-sts-test -o json | jq '.subsets[0].addresses[] | .ip'

# HPA - autoscale deployment/statefulset
kubectl autoscale sts web --cpu-percent=50 --min=3 --max=10 --dry-run -o yaml

# Check your cluaster supported default storageclass. E.g gardener openstack provider supports cinder where kind local cluster supports standard storageclass
i577081@W-PF3NF3XQ:~/YAML$ kubectl get storageclass
NAME                PROVISIONER                RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
default (default)   cinder.csi.openstack.org   Delete          WaitForFirstConsumer   true                   3d22h
default-class       cinder.csi.openstack.org   Delete          WaitForFirstConsumer   true                   3d22h

// create secret from literal 
kubectl create secret generic com.ppp.datahub.installers.br.rclone-custom-configuration -n datahub --from-literal=extra_conf="bucket_policy_only = true"

# Modify existing resource
kubectl patch deployment my-deployment -p '{"spec": {"replicas":3}}'     // minor updates
kubectl edit // large scale updates

# Worker nodes are overloaded.  `kubectl top pods --all-namespaces`
i577081@W-PF3NF3XQ:~$ kubectl top nodes
NAME                                                     CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%
shoot--bryan-demo--01sandbox-sidevops01-z1-77847-wk2bw   75m          3%     1664Mi          59%
shoot--bryan-demo--01sandbox-sidevops01-z1-77847-zxlcf   100m         5%     2713Mi          97%
shoot--bryan-demo--01sandbox-sidevops02-z1-6fb67-27wdp   132m         6%     2384Mi          85%
shoot--bryan-demo--01sandbox-sidevops02-z1-6fb67-9l8k4   100m         5%     3250Mi          116%

// JSON OUTPUT 
kubectl get secret my-helm-repo-secret -n argocd -o jsonpath="{.data}"
$$$$
kubectl get secret $SECRET_NAME -n $NAMESPACE -o json | jq -r '.data | to_entries[] | "\(.key)=\(.value | @base64d)"'
E.g 
kubectl get secret cia-secret -n argocd -oyaml -o json |jq -r '.data | to_entries[] | "\(.key)=\(.value | @base64d)"'

i577081@W-PF3NF3XQ ~ garden-sni--cis-core-external$ kubectl get ret cia-ret -n argocd -oyaml -o json |jq -r '.data | to_entries[] | "\(.key)=\(.value | @base64d)"'



// check certificate details
kubectl get secret ingress-tls-secret -n web-app -o jsonpath="{.data['tls\.crt']}" | base64 --decode | openssl x509 -text -noout

```

#### Core Files Location
```
# CNI \
\YREASHJ/;.,/;M CXGB HHB B
```



```

```



#### Debugging 

```
# check kube system events
kubectl get events -n kube-system --field-selector involvedObject.name=coredns-5dd5756b68-96ztt

```
    `
