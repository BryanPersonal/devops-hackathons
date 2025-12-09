
`ctx context.Context`是Go语言中最核心、最高频、也最容易被误用的机制之一，它不是上下文对象，而是一种请求作用域的__控制信号__与__元数据__传递管道。

- Context 是一棵信号传播树 + 附带只读元数据
- 元数据只用于跨 API 边界传递（如 trace_id），禁止存业务状态！
- Go 没有 TLS；Context 必须显式传递（作为函数第一参数）

```golang
type WeatherServer interface {
    Fetch(ctx context.Context, location string)(*WeatherData, error)
    Name() string // for logging and debugging
}
```