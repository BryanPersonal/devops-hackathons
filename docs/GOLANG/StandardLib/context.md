
https://go-proverbs.github.io/
https://pkg.go.dev/context#pkg-overview


Package context defines the Context type, which carries deadlines, cancellation signals, and other request-scoped values across API boundaries and between processes.

| 英文 | 中文 | 说明 |
|------|------|------|
| **deadlines** | 截止时间 | 为操作设定超时上限（例如：5秒内必须完成），超时后自动取消。可通过 `context.WithTimeout()` 或 `context.WithDeadline()` 设置。 |
| **cancellation signals** | 取消信号 | 表示"提前终止"操作的指令（如用户取消请求、父操作失败等），子 goroutine 可监听并优雅退出。常用 `context.WithCancel()` 创建。 |
| **request-scoped values** | 请求作用域的值 | 与**当前请求生命周期绑定**的数据（如用户ID、traceID、认证令牌），通过 `context.WithValue()` 传递，**禁止用于传递可选函数参数**（这是常见误用！）。 |
| **across API boundaries** | 跨 API 边界 | 指在函数调用链中（如 handler → service → repository），`Context` 作为**第一个参数**层层透传，确保上下文一致性。 |
| **between processes** | 跨进程（需配合其他机制） | `Context` 本身不直接跨进程（如 RPC），但其携带的信息（如 traceID、deadline）可通过协议（如 gRPC metadata）在进程间传递，接收方重建 `Context`。 |


```golang
  //所以说捕捉到ctx.Done() 则进入逻辑
    // Source: http://cs.opensource.google/go/go/+/refs/tags/go1.25.1:src/context/context.go;l=83
	// WithCancel arranges for Done to be closed when cancel is called;
	// WithDeadline arranges for Done to be closed when the deadlineexpires; 
    // WithTimeout arranges for Done to be closed when the timeout elapses.

package main

import (
	"context"
	"fmt"
	"time"
)

func main() {
	// create 3 auto-cancel context 创建带超时的上下文(Context)
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel() // avoid leak resource

	// start a long running mission
	go doWork(ctx)

	select {
	case <-time.After(5 * time.Second):
		fmt.Println("Main: wait for 5 seconds but the task was supposed to be closed")

	case <-ctx.Done():
		fmt.Println("Main: receive cancellation signal! Reason:", ctx.Err())
	}
}

func doWork(ctx context.Context) {
	for i := 1; ; i++ {
		time.Sleep(1 * time.Second)
		fmt.Println("Working...", i)

		// check if context has been cancelled
		select {
		case <-ctx.Done():
			fmt.Println("doWork: called for stop ! Reason:", ctx.Err())
			return
		default:

		}
	}
}
```

Sample2: ticker + context 

```golang
package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"
)

// Worker 模拟一个领导者工作器
type Worker struct {
	id       string
	stopChan chan struct{} // 可用于外部通知停止（本例中主要用 ctx）
}

// NewWorker 是 Go 中常见的“构造函数”约定 →
// NewWorker 是 Worker 的构造函数，负责创建、初始化并返回一个可用的 *Worker 实例  // 这是 Go 中最常见、最推荐的面向对象风格（尽管 Go 没有 class）：
// 返回 *Worker 指针，初始化内部字段
func NewWorker(id string) *Worker {
	if id == "" {
		panic("worker id must not be empty")
	}
	return &Worker{
		id:       id,
		stopChan: make(chan struct{}),
	}
}

// Start 启动工作循环
// 接收 context.Context 用于监听取消信号（如 leadership 丢失 或 用户 Ctrl+C）
func (w *Worker) Start(ctx context.Context) {
	fmt.Printf("[%s] 已当选 leader，开始工作...\n", w.id)

	// 启动一个 goroutine 做周期性任务
	go func() {
		ticker := time.NewTicker(1 * time.Second)
		now := time.Now()
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				fmt.Printf("[%s] [%s] 心跳：正在工作...\n", w.id, now.Format("15:04:05.000"))
			case <-ctx.Done():
				fmt.Printf("[%s] 超时或收到停止信号，退出工作循环\n", w.id)
				return
			}
		}
	}()

	// 阻塞等待 context 被取消（模拟“持有 leadership”）
	<-ctx.Done()
	fmt.Printf("[%s] leadership 结束，Worker 停止\n", w.id)
}

func main() {
	// 创建一个可被信号取消的 context
	baseCtx,baseCancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer baseCancel()

	// Logic to timeout 10 seconds
	timeout := 15 * time.Second 
	ctx, cancel := context.WithTimeout(baseCtx, timeout)
	defer cancel()

	// 创建 Worker（模拟从 leader election 回调中启动）
	worker := NewWorker("node-1")

	fmt.Println("启动 leader worker，按 Ctrl+C 退出...")

	// 启动 worker（通常在 OnStartedLeading 回调中调用）
	worker.Start(ctx)

	fmt.Println("程序已退出")
}


```