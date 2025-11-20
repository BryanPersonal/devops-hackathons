

```golang

//Ticker 是一个封装了定时资源的对象，你通过 C 接收事件，通过指针调用 Stop() 释放资源。这是 Go 中“资源即对象”设计的典型范例



type Ticker struct {
	C <-chan Time // The channel on which the ticks are delivered.   //公共只读 channel，用于接收“滴答”时间 - 在 Go 中，首字母大写的标识符是导出的（public）
	// contains filtered or unexported fields
}
```

Ticker basic program with explanations
```
package main

import (
	"fmt"
	"time"
)

func main() {
	ticker := time.NewTicker(time.Second).   无法通过打印 ticker.C 看到里面的时间值 —— 要看数据，必须 从 channel 接收（<-ticker.C）。
	defer ticker.Stop()
	done := make(chan bool)
	go func() {
		time.Sleep(10 * time.Second)
		done <- true
	}()
	for {
		select {。 // select 语句的设计初衷和唯一用途就是处理 channel 操作
		  // 这是 Go CSP（Communicating Sequential Processes）并发模型的核心机制
		  // 它类似于 switch，但专为 channel 通信设计
		  // 它能同时监听多个 channel，哪个先有数据（或可发送），就执行哪个分支
		  // 如果没有 default，且所有 channel 都未就绪，select 会阻塞，直到某个 channel 就绪
		case <-done:
			fmt.Println("Done!")
			return
		case t := <-ticker.C:  
			fmt.Println("Current time: ", t)
		}
	}
}

// Other quick sample

ready := make(chan bool)
go func() {
    // 模拟某些耗时操作
    time.Sleep(2 * time.Second)
    ready <- true // 条件满足时发送信号
}()

select {
case <-ready:
    fmt.Println("Condition met!")
case <-time.After(5 * time.Second):
    fmt.Println("Timeout!")
}
```