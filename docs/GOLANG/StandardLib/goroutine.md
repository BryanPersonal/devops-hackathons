


Wrong VS Correct sample, add() was added within goroutine
```
for i := 1; i <= 3; i++ {
    go func(id int) {
        wg.Add(1)             // ❌ goroutine 自己登记任务
        defer wg.Done()
        fmt.Printf("Worker %d done\n", id)
    }(i)
}
wg.Wait()                     // ❗ 可能比 Add() 更早执行

go --race run code.go

main goroutine:   go()     go()     go()     →  Wait() ←┐
                      ↓        ↓        ↓              │
worker goroutine: (may delay)  Add() → Done()          │
                                                    (Done too late)

```


```
for i := 1; i <= 3; i++ {
    wg.Add(1)                  // ① 主线程明确登记了任务
    go func(id int) {
        defer wg.Done()       // ③ goroutine 完成后 Done
        fmt.Printf("Worker %d done\n", id)
    }(i)
}
wg.Wait()                      // ② 等待所有登记的任务完成


main goroutine:   Add()    Add()    Add()    →  Wait() ←┐
                      ↓        ↓        ↓               │
worker goroutine:   [run]   [run]   [run]   →  Done() --┘

📌 小技巧：三句话记住
- Add 在外，goroutine 外部加任务数
- Done 在内，任务完成自己报
- Wait 等完，主线程安心退出

```


