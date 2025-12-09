https://github.com/gardener/gardener/tree/master/docs/usage/shoot-operations


Lifecycle/Patching

1. Gardener backbone infrastructure release cycle
    a. gardenlinux release: https://github.com/gardenlinux/gardenlinux/releases
    b. gardener supported K8s release https://pages.github.tools.ppp/kubernetes/gardener/docs/landscapes/live/pam/#supported-kubernetes-versions
    c. gardener control plane maintenance: 
2. Under Garden K8S cluster, check cloudprofile `k get cloudprofile converged-cloud-cis -oyaml |less` to find the latest `supported` version
3. 