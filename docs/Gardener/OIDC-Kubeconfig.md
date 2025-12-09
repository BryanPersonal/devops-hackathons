# AUTHENTICATION

Reference:
https://github.com/int128/kubelogin/blob/master/docs/setup.md


## Question:

You need figure out what the relation of gardenctl/kubelogin/gardenlogin OIDC 

### Configurations
```
/home/i577081/.garden/config ?? 
/home/i577081/.kube/kubeconfig ??

gardenctl ??

```


```
i577081@W-PF3NF3XQ ~ garden-sn1--sit081-external$ kubectl oidc-login setup --oidc-issuer-url=https://gardener-live.accounts.ondemand.com --oidc-client-id=9adf0114-225e-4dc8-a6e7-ad6556722825
authentication in progress...
/usr/bin/xdg-open: 882: www-browser: not found
/usr/bin/xdg-open: 882: links2: not found
/usr/bin/xdg-open: 882: elinks: not found
/usr/bin/xdg-open: 882: links: not found
/usr/bin/xdg-open: 882: lynx: not found
/usr/bin/xdg-open: 882: w3m: not found
xdg-open: no method available for opening 'http://localhost:8000'
error: could not open the browser: exit status 3

Please visit the following URL in your browser manually: http://localhost:8000

## 2. Verify authentication

You got a token with the following claims:

{
  "sub": "bryan.chen01@ppp.com",
  "iss": "https://gardener-live.accounts.ondemand.com",
  "groups": "employee",
  "last_name": "Chen",
  "display_name": "Chen, Bryan",
  "nonce": "tYnyK50rPuMZx0aAQZuQPzlqcJinLhZXrrR2iQDv4FE",
  "sid": "S-SP-1ce34088-9513-4396-9adc-0c8c719b2eff",
  "aud": "9adf0114-225e-4dc8-a6e7-ad6556722825",
  "exp": 1752502013,
  "iat": 1752498413,
  "first_name": "Bryan",
  "jti": "66d1675f-923a-4fff-8fea-3d545e86cca2",
  "email": "bryan.chen01@ppp.com"
}

## 3. Bind a cluster role

Run the following command:

        kubectl create clusterrolebinding oidc-cluster-admin --clusterrole=cluster-admin --user='https://gardener-live.accounts.ondemand.com#bryan.chen01@ppp.com'

## 4. Set up the Kubernetes API server

Add the following options to the kube-apiserver:

        --oidc-issuer-url=https://gardener-live.accounts.ondemand.com
        --oidc-client-id=9adf0114-225e-4dc8-a6e7-ad6556722825

## 5. Set up the kubeconfig

Run the following command:

        kubectl config set-credentials oidc \
          --exec-api-version=client.authentication.k8s.io/v1beta1 \
          --exec-command=kubectl \
          --exec-arg=oidc-login \
          --exec-arg=get-token \
          --exec-arg=--oidc-issuer-url=https://gardener-live.accounts.ondemand.com \
          --exec-arg=--oidc-client-id=9adf0114-225e-4dc8-a6e7-ad6556722825

## 6. Verify cluster access

Make sure you can access the Kubernetes cluster.

        kubectl --user=oidc get nodes

You can switch the default context to oidc.

        kubectl config set-context --current --user=oidc

You can share the kubeconfig to your team members for on-boarding.

```