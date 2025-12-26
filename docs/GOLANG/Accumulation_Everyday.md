

1. How can I use those fragments (`[]byte()`, `json.Marshal(v any) ([]byte, error)`, `json.Unmarshal(data []byte, v any) error` ) as flexible as chopstick ? `;)`
- Marshal 的作用不是“打印给人看”，而是“把 Go 数据变成标准 JSON 文本，供机器交换使用”。 `Marshal`是序列化为`JSON`

2. `fmt.Println ( %+v )`  ? and Logging ??   

3. `safe` Package and `Sync` or `RWMUTEX` Package ?

4. 写函数的时候，什么时候需要返回结构图指针? 什么需要返回值 ?

5. Golang 中两种Receiver 类型 1. 值receiver `func (v T) Method()` （少见但合理） , 方法操作T副本 2. 指针receiver `func (p *T) Method()`， 方法操作T的原始实例

6. JSON-RPC2 and transport understanding ? 

7. Golang泛型应用场景？ 

8. `aMap := make(map[string]struct{}, len(a))` 是高效构建集合（set）的经典写法。  `make(...)` Go 中创建 map / slice / chan 的内置函数（不能用 `new`） 
> `map[T]struct{}`   是 Go 社区广泛采用的、事实标准的「集合（set）模拟方式」, 因为golang中没有像python中的 `set()`  

