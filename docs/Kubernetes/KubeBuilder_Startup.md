
Concepts:
1. Operator: a controller that manages custom resources. 
    - CRD: podTracker
2. Controller: CONTROLLERS ARE THE CORE OF KUBERNETES AND OF ANY OPERATOR - QUOTE FROM KUBERBUILDER BOOK
    - Controller is __reconcilation__ loop as the fundamental concept of kubernetes

Reference:
https://book.kubebuilder.io/


```

❯ kubebuilder init --domain devops.toolbox --repo devops.toolbox/controller
INFO Writing kustomize manifests for you to edit...
INFO Writing scaffold for you to edit...
INFO Get controller runtime
go: downloading k8s.io/apimachinery v0.34.1


❯ make manifests

❯ kubebuilder create api --group crd --version v1 --kind PodTracker
INFO Create Resource [y/n]
y
INFO Create Controller [y/n]
y
INFO Writing kustomize manifests for you to edit...
INFO Writing scaffold for you to edit...
INFO api/v1/podtracker_types.go
INFO api/v1/groupversion_info.go
INFO internal/controller/suite_test.go
INFO internal/controller/podtracker_controller.go
INFO internal/controller/podtracker_controller_test.go
INFO Update dependencies
INFO Running makek3d
mkdir -p "/Users/I577081/Workdir/kubernetes/k8s-controll


> make install  // to install the crd

```