
```golang

package main

import (
	"fmt"
)

// ===== 泛型工具函数（可复用）=====
func Filter[T any](slice []T, pred func(T) bool) []T {
	var res []T
	for _, v := range slice {
		if pred(v) {
			res = append(res, v)
		}
	}
	return res
}

func Map[T, R any](slice []T, f func(T) R) []R {
	res := make([]R, len(slice))
	for i, v := range slice {
		res[i] = f(v)
	}
	return res
}

// ===== 模拟 K8s Pod 数据 =====
type Pod struct {
	Name   string
	Status string // "Running", "Pending", etc.
}

func main() {
	pods := []Pod{
		{"web-1", "Running"},
		{"db-0", "Pending"},
		{"cache-2", "Running"},
		{"job-5", "Failed"},
	}
	fmt.Printf("%v\n", pods)

	// 泛型链式操作：清晰、类型安全、无断言
	runningPods := Filter(pods, func(p Pod) bool {
		return p.Status == "Running"
	})
	names := Map(runningPods, func(p Pod) string {
		return p.Name
	})

	fmt.Println("Running Pods (Generic):", names)
	// 输出: Running Pods (Generic): [web-1 cache-2]
}
```


```

func Filter[T any](slice []T, pred func(T) bool) []T {

// 为何调用方式如下 
runningPods := Filter(pods, func(p Pod) bool {
		return p.Status == "Running"
	})

```

| 函数定义要求 | 你提供的实参 | 是否符合 | 原因 |
|------------|------------|---------|------|
| slice []T | pods → []Pod | ✅ | ⇒ 推出 T = Pod |
| pred func(T) bool | func(p Pod) bool | ✅ | T=Pod ⇒ 要求 func(Pod) bool，你正好提供 |
| 返回 []T | runningPods | ✅ | T=Pod ⇒ 返回 []Pod，类型匹配 |

为什么 pred func(T) bool 和 func(p Pod) bool 能匹配？
尤其是：pred 本身只是一个参数名，为什么它的类型能“动态适应”？

pred 不是类型，只是参数名（就像 slice 是第一个参数名）
它的类型由 func(T) bool 决定
而 T 是一个泛型类型参数，尚未固定

🎯 终极答案（直击你的疑问）

为什么 pred func(T) bool 和 func(p Pod) bool 能匹配？

因为：

- pred 是参数名，真正起作用的是它的类型 func(T) bool
- 编译器通过 pods ([]Pod) 推出 T = Pod
- 将 T = Pod 代入 func(T) bool → 得到具体类型 func(Pod) bool
- 你传的 func(p Pod) bool 恰好是 func(Pod) bool 类型的值→ 类型匹配，调用合法 ✅