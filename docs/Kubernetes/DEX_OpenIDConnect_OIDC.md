
> 👉 一种基于 Token 的“身份传递体系”

如果你已经在用 Kubernetes / Istio / 企业 SSO，OIDC 几乎是现代云原生身份的基石。



IDP Solutions:
1. Dex 
https://github.com/dexidp/dex
https://dexidp.io/docs/connectors/ldap/#getting-started
https://dexidp.io/docs/openid-connect/

### Deploy Dex:

1. https://charts.dexidp.io/


2. `Values.yml` or `variables.yml`

```
variables:
  CHART_MIRROR: true

chart-mirror:
  variables:
    # renovate: datasource=docker depName=registry-1.docker.io/cloudpirates/memcached versioning=semver
    CHART_VERSION: 0.23.0
    CHART_NAME: dex
    HELM_URL: https://charts.dexidp.io
    CHART_CUSTOM_VALUES: |
      configSecret:
        create: false
        key: config.yaml
        name: dex

      replicaCount: 3

      resources:
        limits:
          cpu: 100m
          memory: 256Mi
        requests:
          cpu: 100m
          memory: 128Mi

      podDisruptionBudget:
        enabled: true
        maxUnavailable: 1

      podSecurityContext:
        fsGroup: 2000

      securityContext:
        capabilities:
          drop:
          - ALL
        readOnlyRootFilesystem: true
        runAsNonRoot: true
        runAsUser: 1000

      # Provide a writable /tmp while keeping root FS read-only
      volumes:
        - name: tmp
          emptyDir: {}
        - name: ldap-ca
          secret:
            secretName: dex-cabundle

      volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: ldap-ca
          mountPath: /etc/dex/ca
          readOnly: true

      rbac:
        create: true
        createClusterScoped: true

      # Fix for Dex not being able to connect to the K8s API with error "failed to initialize storage: cannot get kubernetes version: not found". Don't know why but it works.
      envVars:
        - name: KUBERNETES_SERVICE_HOST
          value: kubernetes.default.svc

      autoscaling:
        enabled: true
        minReplicas: 3
        maxReplicas: 6
        targetCPUUtilizationPercentage: 80
        targetMemoryUtilizationPercentage: 80

      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: DoNotSchedule
          labelSelector:
            matchLabels:
              app.kubernetes.io/name: sidevops-dex
```

3. `Config.yml`
```
issuer: https://dex.k8s.sni.int.sap
oauth2:
  skipApprovalScreen: true
storage:
  type: kubernetes
  config:
    inCluster: true
    namespace: dex
staticClients:
  - id: ArgoCDGitOps
    secret: argocd
    name: ArgoCDGitOps
    redirectURIs:
    - https://argocd.gitops.sni.shoot.live.k8s-hana.ondemand.com/auth/callback
  - id: ArgoCDcoreeu2
    secret: argocd
    name: ArgoCDcoreeu2
    redirectURIs:
    - https://argocd.cis-coreeu2.k8s.sni.int.sap/auth/callback
  - id: argocdgsv
    secret: argocd
    name: argocdgsv
    redirectURIs:
    - https://argocd.gitops-validation.c8s.sni.int.sap/auth/callback
  - id: grafana
    secret: grafana
    name: grafana
    redirectURIs:
    - https://grafana.gitops.k8s.sni.int.sap/login/generic_oauth
  - id: kiali_gitops
    secret: kiali_gitops
    name: kiali_gitops
    redirectURIs:
    - https://kiali.gitops.k8s.sni.int.sap/kiali
    - https://kiali.gitops.k8s.sni.int.sap/kiali/api/authenticate
connectors:
  # GitHub Configuration
  - type: github
    id: github
    name: GitHub
    config:
      hostName: github.tools.sap
      clientID: 10d243b3a534663b2754
      clientSecret: 29af41acfe0befbb77775b7411df282c4f557652
      redirectURI: https://dex.k8s.sni.int.sap/callback
      loadAllGroups: true
      orgs:
      - name: SIDEVOPS
        teams:
        - CAM_SI_DEVOPS_ARGOCD_OWNER
        - CAM_SI_DEVOPS_CONTAINER_OPERATOR
        - CAM_SI_DEVOPS_CONTAINER_SME
  - type: ldap
    id: ldap
    name: LDAP
    config:
      host: ldap-supplier.cis-spc-tic-private-fip.gmp.eu-de-2.cloud.sap:636
      insecureSkipVerify: true
      bindDN: cn=slave,ou=users,ou=SYS,dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap
      bindPW: slavesync
      usernamePrompt: Username
      rootCA: /etc/dex/ca/sap-root-ca.pem
      userSearch:
        baseDN: dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap
        filter: "(objectClass=person)"
        username: uid
        nameAttr: displayName
        preferredUsernameAttr: cn
        idAttr: DN
        emailAttr: mail
      groupSearch:
        baseDN: dc=cis-spc-tic,dc=gmp,dc=eu-de-2,dc=cloud,dc=sap
        filter: "(objectClass=posixGroup)"
        nameAttr: cn
        userMatchers:
        - groupAttr: memberUid
          userAttr: uid
```
Features: - LDAPS (LDAP over TLS) on port 636 - SAP Cloud Platform LDAP integration (cis-spc-tic domain) - Certificate-based authentication (SAP Root CA) - `POSIX` group membership mapping - Service account binding with read-only access - Custom `username` prompt for better `UX`

Important Notes: - CA Certificate: `/etc/dex/ca/sap-root-ca.pem` (mounted from `dex-cabundle` secret) - User attributes: Uses `displayName` for full name, `cn` for preferred username - Group matching: `POSIX groups` via `memberUidattribute` matching user’s `uid`

4. Manage `Config.yml` over `VSS - Vault Static Secrets`

```
RAW: 
    harshicorp namespace/mount: live/gitops/dex/dex-config
    - vault:
        connectionRef: prod
        authMethod: jwt-gitops
        namespace: gcs/pso_sidevops/k8s
        jwt_role: jwt-role-gitops-dex
        method: jwt
        globalMount: sni
      refreshAfter: 15m
      k8s:
        namespace: dex
        serviceAccount: vault-jwt-auth-sa
      secrets:
        - k8s:
            name: dex
          vault:
            path: live/gitops/dex/dex-config


Rendered manifest: 

apiVersion: secrets.hashicorp.com/v1beta1
kind: VaultStaticSecret
metadata:
  name: dex
  namespace: dex
spec:
  type: kv-v2
  mount: sni
  namespace: gcs/pso_sidevops/k8s
  path: canary/gitops-validation/dex/dex-config
  destination:
    name: dex
    create: true
    type: Opaque
    overwrite: false
  refreshAfter: 15m
  hmacSecretData: true
```

5. How to run this Dex server from ArgoCD 

In ArgoCD helm value file. 
```
configs:
  cm:
    oidc.config: |
      name: Dex
      issuer: https://dex.c8s.sni.int.sap
      clientID: ArgoCDMaxwell
      clientSecret: <same-secret-as-dex>
      rootCA: |
        -----BEGIN CERTIFICATE-----
        <SAP Global Root CA>
        -----END CERTIFICATE-----
      requestedScopes:
        - openid
        - profile
        - email
        - groups
  params:
    server.insecure: true
  rbac:
    scopes: "[groups, email]"
```

https://github.com/int128/kubelogin  


