package controllers

import (
	"context"
	"fmt"
	"time"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"

	webserverv1 "github.com/devops-hackathons/k8s-operator-example/api/v1"
)

// WebServerReconciler 协调 WebServer 资源
type WebServerReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

//+kubebuilder:rbac:groups=webserver.example.com,resources=webservers,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=webserver.example.com,resources=webservers/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=webserver.example.com,resources=webservers/finalizers,verbs=update
//+kubebuilder:rbac:groups=apps,resources=deployments,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=core,resources=services,verbs=get;list;watch;create;update;patch;delete

// Reconcile 是主要的协调循环
func (r *WebServerReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	logger := log.FromContext(ctx)

	// 获取 WebServer 资源
	webserver := &webserverv1.WebServer{}
	if err := r.Get(ctx, req.NamespacedName, webserver); err != nil {
		if errors.IsNotFound(err) {
			// 资源已删除，忽略
			return ctrl.Result{}, nil
		}
		logger.Error(err, "无法获取 WebServer 资源")
		return ctrl.Result{}, err
	}

	// 检查并创建 Deployment
	deployment := &appsv1.Deployment{}
	err := r.Get(ctx, types.NamespacedName{
		Name:      webserver.Name,
		Namespace: webserver.Namespace,
	}, deployment)

	if err != nil && errors.IsNotFound(err) {
		// 创建新的 Deployment
		logger.Info("创建新的 Deployment", "name", webserver.Name)
		deployment = r.createDeployment(webserver)
		if err := r.Create(ctx, deployment); err != nil {
			logger.Error(err, "创建 Deployment 失败")
			return ctrl.Result{}, err
		}
	} else if err != nil {
		logger.Error(err, "获取 Deployment 失败")
		return ctrl.Result{}, err
	} else {
		// 更新现有的 Deployment
		desiredReplicas := webserver.Spec.Replicas
		if *deployment.Spec.Replicas != desiredReplicas {
			logger.Info("更新 Deployment 副本数", "current", *deployment.Spec.Replicas, "desired", desiredReplicas)
			deployment.Spec.Replicas = &desiredReplicas
			if err := r.Update(ctx, deployment); err != nil {
				logger.Error(err, "更新 Deployment 失败")
				return ctrl.Result{}, err
			}
		}
	}

	// 检查并创建 Service
	service := &corev1.Service{}
	err = r.Get(ctx, types.NamespacedName{
		Name:      webserver.Name,
		Namespace: webserver.Namespace,
	}, service)

	if err != nil && errors.IsNotFound(err) {
		// 创建新的 Service
		logger.Info("创建新的 Service", "name", webserver.Name)
		service = r.createService(webserver)
		if err := r.Create(ctx, service); err != nil {
			logger.Error(err, "创建 Service 失败")
			return ctrl.Result{}, err
		}
	} else if err != nil {
		logger.Error(err, "获取 Service 失败")
		return ctrl.Result{}, err
	}

	// 更新 WebServer 状态
	if err := r.updateStatus(ctx, webserver, deployment); err != nil {
		logger.Error(err, "更新状态失败")
		return ctrl.Result{}, err
	}

	return ctrl.Result{RequeueAfter: 30 * time.Second}, nil
}

// createDeployment 创建 Deployment 资源
func (r *WebServerReconciler) createDeployment(webserver *webserverv1.WebServer) *appsv1.Deployment {
	replicas := webserver.Spec.Replicas
	image := webserver.Spec.Image
	if image == "" {
		image = "nginx:latest"
	}
	port := webserver.Spec.Port
	if port == 0 {
		port = 80
	}

	labels := map[string]string{
		"app":       "webserver",
		"webserver": webserver.Name,
	}

	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      webserver.Name,
			Namespace: webserver.Namespace,
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: &replicas,
			Selector: &metav1.LabelSelector{
				MatchLabels: labels,
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: labels,
				},
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{
							Name:  "webserver",
							Image: image,
							Ports: []corev1.ContainerPort{
								{
									ContainerPort: port,
									Name:          "http",
								},
							},
						},
					},
				},
			},
		},
	}

	// 设置 OwnerReference，使 Deployment 属于 WebServer
	ctrl.SetControllerReference(webserver, deployment, r.Scheme)
	return deployment
}

// createService 创建 Service 资源
func (r *WebServerReconciler) createService(webserver *webserverv1.WebServer) *corev1.Service {
	port := webserver.Spec.Port
	if port == 0 {
		port = 80
	}

	labels := map[string]string{
		"app":       "webserver",
		"webserver": webserver.Name,
	}

	service := &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:      webserver.Name,
			Namespace: webserver.Namespace,
		},
		Spec: corev1.ServiceSpec{
			Selector: labels,
			Ports: []corev1.ServicePort{
				{
					Port:     port,
					Protocol: corev1.ProtocolTCP,
					Name:     "http",
				},
			},
			Type: corev1.ServiceTypeClusterIP,
		},
	}

	// 设置 OwnerReference，使 Service 属于 WebServer
	ctrl.SetControllerReference(webserver, service, r.Scheme)
	return service
}

// updateStatus 更新 WebServer 的状态
func (r *WebServerReconciler) updateStatus(ctx context.Context, webserver *webserverv1.WebServer, deployment *appsv1.Deployment) error {
	webserver.Status.Replicas = deployment.Status.Replicas
	webserver.Status.ReadyReplicas = deployment.Status.ReadyReplicas

	// 更新条件
	condition := metav1.Condition{
		Type:               "Ready",
		Status:             metav1.ConditionFalse,
		Reason:             "Reconciling",
		Message:            fmt.Sprintf("Replicas: %d/%d", webserver.Status.ReadyReplicas, webserver.Status.Replicas),
		LastTransitionTime: metav1.Now(),
	}

	if webserver.Status.ReadyReplicas == webserver.Spec.Replicas && webserver.Spec.Replicas > 0 {
		condition.Status = metav1.ConditionTrue
		condition.Reason = "AllReplicasReady"
		condition.Message = "所有副本已就绪"
	}

	// 更新或添加条件
	found := false
	for i, c := range webserver.Status.Conditions {
		if c.Type == condition.Type {
			webserver.Status.Conditions[i] = condition
			found = true
			break
		}
	}
	if !found {
		webserver.Status.Conditions = append(webserver.Status.Conditions, condition)
	}

	return r.Status().Update(ctx, webserver)
}

// SetupWithManager 设置 Controller 与 Manager 的连接
func (r *WebServerReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&webserverv1.WebServer{}).
		Owns(&appsv1.Deployment{}).
		Owns(&corev1.Service{}).
		Complete(r)
}




