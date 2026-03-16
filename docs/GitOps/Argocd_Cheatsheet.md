

```
# Allow disabling auto-sync temporarily

  # allow-temporarily-toggling-auto-sync
  ignoreApplicationDifferences:
    - jsonPointers:
        - /spec/syncPolicy
```

How to make cleanup of an ArgoCD application: https://jira.tools.sap/browse/CIEA-21126

```
- argocd app delete gmp-fluentbit --cascade -y
- argocd app delete gmp-fluentbit --cascade -y
- argocd app delete ansible-fluentbit --cascade -y
```