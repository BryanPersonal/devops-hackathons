

1. How can I use those fragments (`[]byte()`, `json.Marshal(v any) ([]byte, error)`, `json.Unmarshal(data []byte, v any) error` ) as flexible as chopstick ? `;)`
- Marshal 的作用不是“打印给人看”，而是“把 Go 数据变成标准 JSON 文本，供机器交换使用”。 `Marshal`是序列化为`JSON`

2. `fmt.Println ( %+v )`  ? and Logging ??   

3. `safe` Package and `Sync` or `RWMUTEX` Package ? 
- `sync.RWMutex`  像是图书馆，是读写互斥锁， `RWMutex` 防止写者被无限的读者淹没(即“写者饥饿”问题)，当有写锁在等待时，后续新来的读者会被阻塞，直到写锁完成。
- `sync.Mutex` 像一个单人电话亭, 不管你是想往公告栏贴东西（写），还是只想看一眼（读），你都必须拿到唯一的钥匙。当你在里面时，其他所有人都得排队
- `Mutex` 和 `RWMutex` 是实现 “Safe” 的工具，而 “Safe” 是我们想要达到的目标. 在 Go 中，如果一个函数、类型或变量在被多个 Goroutine 同时访问时，不会产生竞态条件（Race Condition），不会导致数据损坏或程序崩溃，我们就称它是 Safe 的。


```golang
package main

import (
	"fmt"
	"sync"
	"time"
)

func main() {
	var mu sync.Mutex
	var counter int
	// 10 goroutine concurrent modify counter
	for i := 0; i < 10; i++ {
		go func(id int) {
			mu.Lock() // 互斥体现 only one goroutine can acquire the lock

			// 临界区开始
			fmt.Printf("Goroutine %d Enter 临界区, counter=%d\n", id, counter)
			time.Sleep(100 * time.Millisecond) // simulate time consuming operation
			counter++                          // 互斥锁保证了在并发环境下，多个协程对共享资源的访问是串行化（Serializing）的
			fmt.Printf("Goroutine %d completed modification, counter=%d\n", id, counter)

			// 临界区关闭
			mu.Unlock()
		}(i) // 解决异步竞态问题, 闭包传参。 每次循环时，i 的当前数值会被立即复制一份传递给 id。即使后面 i 变成了 10，已经启动的 Goroutine 手里拿到的 id 依然是当时传入的那个拷贝
	}

	time.Sleep(2 * time.Second)
	fmt.Printf("Final result: %d\n", counter)
}

```


4. 写函数的时候，什么时候需要返回结构图指针? 什么需要返回值 ?

5. Golang 中两种Receiver 类型 1. 值receiver `func (v T) Method()` （少见但合理） , 方法操作T副本 2. 指针receiver `func (p *T) Method()`， 方法操作T的原始实例

6. JSON-RPC2 and transport understanding ? 

7. Golang泛型应用场景？ 

8. `aMap := make(map[string]struct{}, len(a))` 是高效构建集合（set）的经典写法。  `make(...)` Go 中创建 map / slice / chan 的内置函数（不能用 `new`） 
> `map[T]struct{}`   是 Go 社区广泛采用的、事实标准的「集合（set）模拟方式」, 因为golang中没有像python中的 `set()`  

9. `c := make(chan Time, 1)`