
1.
Question: 结构体 定义一些函数 被另一个 结构体使用是常规用法吗
Answer: 
是的！一个结构体定义方法（函数），被另一个结构体使用，是 Go 语言中非常常规且推荐的用法。这体现了 Go 的核心设计哲学：组合优于继承（Composition over Inheritance）。

Go 没有类继承，而是通过结构体嵌入（embedding） 和 接口（interface） 实现代码复用和行为组合


2. 
| 概念 | 说明 | 例子 |
|------|------|------|
| 字段（Fields） | 结构体存储的数据 | `logger *Logger` |
| 方法（Methods） | 绑定到结构体的行为 | `func (u *UserService) CreateUser(...)` |

3. 
Classical 

```go
package main

import "fmt"

type Logger struct{}

func (l *Logger) Info(msg string) {
	fmt.Println("[INFO]", msg)
} // 【一层套娃】 将函数套在Logger结构体
func (l *Logger) Error(msg string) {
	fmt.Println("[ERROR]", msg)
}

// UserService Use Logger
type UserService struct {
	logger *Logger // hold the logger explicitly
} // 【二层套娃】 将Logger 包在UserService结构体中

// 封装初始化逻辑（Encapsulation）- 封装结构体的构造过程
// 是一个构造函数，用于安全地创建并初始化结构体实例，确保其内部字段（如 logger）处于有效状态，从而让后续的方法调用（如 CreateUser）能够正常工作。
// 这是 Go 中保证对象有效性和避免 nil 指针 panic 的核心实践
// 按照 Go 社区惯例，以 New 开头的函数通常作为构造函数（constructor），用于创建并初始化某个类型的实例
func NewUserService() *UserService { //func 函数名(参数列表) 返回值类型 {
	return &UserService{
		logger: &Logger{},
		// Logger: 为初始化字段名字
		// &Logger{} 1. Logger{} 创建一个 Logger 结构体的零值实例（因为 Logger 是空结构体 struct{}，所以就是 {}）；
		// 2. & 取其地址，得到 *Logger 类型的指针； 3. 赋值给 logger 字段（类型匹配：logger 字段是 *Logger）。
	}
}

// 行代码是 Go 语言中 方法（Method）定义 的标准语法
func (u *UserService) CreateUser(name string) { //表示这个函数是 绑定到 *UserService 类型上的方法。
	u.logger.Info("Creating user: " + name)
	// logical part to create user
	u.logger.Info("User created successfully")
}

func main() {
	svc := NewUserService()
	svc.CreateUser("Alice")
}

main()
│
├─ 调用 NewUserService()
│  └─ 返回 &UserService{logger: &Logger{}}
│
├─ svc = 这个指针
│
└─ 调用 svc.CreateUser("Alice")
   └─ 进入方法：u = svc（接收者）
      ├─ u.logger.Info("Creating user: Alice") → 打印 [INFO] ...
      └─ u.logger.Info("User created successfully") → 打印 [INFO] ...
```

4.  理解 `*RPCError` and `&RPCError`

| 概念 | 说明 |
|------|------|
| *RPCError | 是指针类型，用于声明变量、函数返回值等 |
| \&RPCError\{...\} | 是取地址表达式，创建结构体并返回其指针 |
| 为什么返回指针？| 高效，可为nil 、符合error接口、与标准库一致 |

```golang
package main

import "fmt"

type RPCError struct {
	Code    int64. // 本地逻辑用int 跨平台/存储使用 int64 或 int32
	Message string
}

// return type *RPCError (pointer type)
// 建议：参数类型与字段一致，避免隐式转换
func NewRPCError(code int64, msg string) *RPCError {
	// &RPCError{...} create a pointer type
	return &RPCError{Code: code, Message: msg}
	// 这行代码做了两件事
	// 1. RPCError{Code: 404, Message: "Not Found"} 创建一个 RPCError 结构体的值（value），在内存中分配空间并初始化字段
	// 2. & 取这个结构体值的内存地址，得到一个 *RPCError 类型的指针
}

func main() {
	// declare variable: type is *RPCError
	// 方式1：先声明，再赋值（使用 =）
	var err1 *RPCError
	err1 = &RPCError{Code: 400, Message: "Bad Request"}

	// 方式2：直接短声明（推荐）
	err2 := &RPCError{Code: 401, Message: "Unauthorized"}
	
	// 或使用构造函数
	err3 := NewRPCError(500, "Internal Server Error")

	fmt.Printf("err1: %+v\n", err1)   // %+v 对结构体，输出字段名 + 值
	fmt.Printf("err2: %+v\n", err2)
}
```

5. 