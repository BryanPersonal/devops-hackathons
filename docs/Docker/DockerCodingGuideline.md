

1. Perfer for Multi-stage Build
  - Advantages 
    - 为了编译应用，可能需要安装各种编译工具（如 gcc、make、git 等），这些工具最终在运行镜像中不需要，但会占用几十甚至上百 MB
    - 可以把**编译阶段**和**运行阶段**分开，只把最终可执行文件或产物拷贝到运行镜像中，不需要的工具就不带进最终镜像
    - 最终镜像更轻量，下载和部署速度更快

Sample
```
FROM golang:1.21 AS builder
WORKDIR /app
COPY . .
RUN go build -o myapp

FROM alpine:latest
COPY --from=builder /app/myapp /usr/local/bin/myapp
CMD ["myapp"]
最终镜像只有 Alpine + myapp，没有 Go 工具链。
```

