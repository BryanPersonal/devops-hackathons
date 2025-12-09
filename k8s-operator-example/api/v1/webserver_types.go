package v1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// WebServerSpec 定义了 WebServer 资源的期望状态
type WebServerSpec struct {
	// Replicas 指定要创建的 Pod 副本数
	// +kubebuilder:validation:Minimum=1
	// +kubebuilder:validation:Maximum=10
	Replicas int32 `json:"replicas"`

	// Image 指定要使用的容器镜像
	// +kubebuilder:default="nginx:latest"
	Image string `json:"image,omitempty"`

	// Port 指定容器监听的端口
	// +kubebuilder:default=80
	Port int32 `json:"port,omitempty"`
}

// WebServerStatus 定义了 WebServer 资源的实际状态
type WebServerStatus struct {
	// Replicas 当前运行的 Pod 数量
	Replicas int32 `json:"replicas"`

	// ReadyReplicas 就绪的 Pod 数量
	ReadyReplicas int32 `json:"readyReplicas"`

	// Conditions 表示资源的各种状态条件
	Conditions []metav1.Condition `json:"conditions,omitempty"`
}

// +kubebuilder:object:root=true
// +kubebuilder:subresource:status
// +kubebuilder:printcolumn:name="Replicas",type="integer",JSONPath=".spec.replicas"
// +kubebuilder:printcolumn:name="Ready",type="integer",JSONPath=".status.readyReplicas"
// +kubebuilder:printcolumn:name="Age",type="date",JSONPath=".metadata.creationTimestamp"

// WebServer 是 WebServer 资源的 Schema
type WebServer struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   WebServerSpec   `json:"spec,omitempty"`
	Status WebServerStatus `json:"status,omitempty"`
}

// +kubebuilder:object:root=true

// WebServerList 包含 WebServer 资源的列表
type WebServerList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []WebServer `json:"items"`
}

func init() {
	SchemeBuilder.Register(&WebServer{}, &WebServerList{})
}




