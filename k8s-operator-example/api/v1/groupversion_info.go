// +kubebuilder:object:generate=true
// +groupName=webserver.example.com
package v1

import (
	"k8s.io/apimachinery/pkg/runtime/schema"
	"sigs.k8s.io/controller-runtime/pkg/scheme"
)

var (
	// GroupVersion 是 API 的组版本
	GroupVersion = schema.GroupVersion{Group: "webserver.example.com", Version: "v1"}

	// SchemeBuilder 用于将 Go 类型注册到 GroupVersionKind scheme
	SchemeBuilder = &scheme.Builder{GroupVersion: GroupVersion}

	// AddToScheme 将类型添加到 scheme
	AddToScheme = SchemeBuilder.AddToScheme
)




