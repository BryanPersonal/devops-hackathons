
GO Online
https://www.programiz.com/golang/online-compiler/

```
currentTime := time.Now()
currentTime这个变量就是一个**Time对象**，相当于你说的“实例化对象”，但Go语言不像Python里是明确用class和实例那种机制；它更偏向于函数直接返回结构体值的风格。
```

在 Go（Golang）语言中，struct（结构体） 是一种复合数据类型，用于将多个字段打包成一个数据单元。它类似于其他语言中的 "class" 或 "record"，但不包含继承。
Go没有面向对象中的类，但可以为任意type (包括struct) 定义方法，从而赋予结构体类似于类的行为。定义方法的格式是：




`[]byte` 就是一个"字节切片" slice of bytes, 它是 Go 中用来表示 二进制数据或原始数据流 的标准类型。
每个 byte 是一个 8 位无符号整数（等于 uint8），范围从 0 到 255。


| 用途                    | 示例                            |
| --------------------- | ----------------------------- |
| 读写文件数据                | `os.ReadFile()` 返回 `[]byte`   |
| 网络通信                  | `net.Conn.Read()` 使用 `[]byte` |
| 字符串与 JSON、Base64 的转换等 | `json.Marshal()` 返回 `[]byte`  |
| 数据加密 / 解密             | 加密算法操作的原始数据                   |


`body, err := io.ReadAll(resp.Body)`
这个函数会把 `resp.Body`（它实现了 io.Reader 接口）中的所有数据一次性读到内存里，并返回一个 `[]byte` 类型的变量（这里是 body）。

# Go 数据类型参考

## 类型 例子 备注
| 类型   | 例子                                       | 备注                       |
|--------|-------------------------------------------|----------------------------|
| 变量   | `var a int = 10`                          | `var` 关键字声明变量       |
| 常量   | `const Pi = 3.14`                         | `const` 声明常量，不可修改  |
| int    | `var age int = 18`                        | 整数类型                   |
| string | `var name string = "Tom"`                 | 字符串类型                 |
| slice  | `nums := []int{1, 2, 3}`                  | 动态数组, 赋值必须使用显示切片符 [] `[]int{ }` or `[]string { }` 尤其是给structs赋值时           |
| map    | `ages := map[string]int{"Tom": 18}`        | key-value 键值对            |

```go
[]string: 类型是“字符串切片”
Go 语言不使用异常（exception）机制来表示错误，而是通过返回 error 类型显式传递错误：

Go 中不能在函数外使用短变量声明（:=），只能用 var 或 const。

```
// FIXME: 中高阶 接口创建时需要进一步研究 尤其是暴露给用户的接口。

| 需求                  | 推荐写法              |
| ------------------- | ----------------- |
| 需要区分 nil 和空         | `var nums []int`  |
| 初始化可用，马上 append 或传参 | `nums := []int{}` |
| 想避免 nil，直接用空 slice  | `nums := []int{}` |
| 只声明，稍后赋值            | `var nums []int`  |

Golang VS Python: https://govspy.peterbe.com/x

```go
// 初始化go module
go mod init helloworld
go build helloworld.go
go get golang.org/x/net/html

假设你代码中有如下导入： import "golang.org/x/net/html"
那么你就必须确保项目目录中有 go.mod 文件，并且该包已安装。

// go doc check
go doc url.URL  # 查看URL类型的定义
go doc -src url.Parse  # 查看Parse函数的源码注释
```
如何阅读GOLANG 文档 
- `func (v Values) Add(key, value string)`, `(v Values)`	这是方法的接收者（receiver），表明这个函数是 Values 类型的“方法” , 使用时通过一个变量进行调用 `v := url.Values{}`

```
func (receiver TypeName) MethodName(params) returnType {
    // 方法体
}
```

函数字面量（function literal）

```
func(x int) bool {
    return x > 0
}
```

抛错 `if err != nil { ... }` Or `log.Fatal / Fatalf` Or `panic(err)`

| 方式                      | 用法说明                    | 是否终止程序             |
| ----------------------- | ----------------------- | ------------------ |
| `if err != nil { ... }` | 最基本的错误检查方式              | 否（你决定如何处理）         |
| `log.Fatal / Fatalf`    | 打印错误并**退出程序**           | ✅ 是                |
| ` (err)`            | 抛出异常，产生堆栈跟踪（一般用于严重内部错误） | ✅ 是（可被 recover 捕获） |

指针(pointer) 是一个变量，它存储另一个变量的内存地址。指针可以让你直接操作内存，避免复制数据，提高性能。
- 修改原始数据而不是副本
- 避免复制大对象
- (crucial)Go中的结构题是值类型, 使用指针才能共享修改

Go 中 只要把指针 取地址后 Go会自动解引用获取其值

```go
package main
import "fmt"

type Person struct {
    Name string
    Age int
}
 
func updateAge(p *Person){  // 这个函数的参数是 *Person 类型，表示指向 Person 类型的指针。这意味着传入的是一个地址，而不是一个结构体的副本。
  p.Age = 0   // 虽然 p 是一个指针，但 Go 的语法允许通过 p.Age 来直接访问指针所指向结构体的字段，相当于 (*p).Age = 0。这行代码将指针指向的 Person 的 Age 字段设为 0
}

func main() {
  person := Person{Name: "Alice", Age: 25}
  updateAge(&person)  // &person 是取地址操作符（address-of），表示传入 person 变量的指针。
  fmt.Println(person.Age)
}

// Go 会在“访问字段”或“调用方法”时自动解引用指针

// 示例 1：字段访问
type Person struct {
    Name string
}
p := Person{Name: "Alice"}  
ptr := &p // 两种方式访问结构体字段 1. 取地址 使用指针访问字段 2. 直接访问结构体字段

fmt.Println(ptr.Name)  // ✅ 自动解引用，相当于 (*ptr).Name

// 示例 2：方法调用
func (p *Person) Greet() {
    fmt.Println("Hello,", p.Name)
}

ptr.Greet()  // ✅ 自动解引用，相当于 (*ptr).Greet()

Sample 2

package main
import "fmt"

type Person struct {
  Name string
}

func updateName(p *Person) {  // 这表示你传入的是一个 *Person（指向 Person 类型的指针），这样函数内部可以直接修改外部的 Person 实例的字段值。
    p.Name = "Bob"
}

func main() {
  p := Person{Name: "Alice"}
  fmt.Printf("Hello, World! %s \n", p.Name)
  updateName(&p)  // 函数调入，传入指针 把 p 的地址（内存位置）传递给函数。也就是说，你不是传递 p 的副本，而是传递“指向 p 的指针”。
  
	fmt.Println("Hello, World !", p.Name)
}

```
 - fmt.Println(p4)     // 打印结构体指针的值，如：&{Ann 30}
 - fmt.Println(*p4)    // 解引用，打印结构体内容：{Ann 30}
 - fmt.Println(&p4)    // 打印的是 p4 的地址，即 **Person

| 方式                       | 类型        | 是否实例化 | 备注           |
| ------------------------ | --------- | ----- | ------------ |
| `p := new(Person)`       | `*Person` | ✅ 是   | 零值结构体，返回指针   |
| `p := Person{}`          | `Person`  | ✅ 是   | 零值结构体，返回值    |
| `p := &Person{Name:...}` | `*Person` | ✅ 是   | 同时初始化字段，推荐方式 |



Sample `type A interface {}` 实现
```
package main

import "fmt"

// 定义接口 任何能说话的动物都实现它
type Animal interface {
    Speak() string
}

type Dog struct {
    Name string
}

func (d Dog) Speak() string {  
// （d Dog）方法的接收者  表示这个函数是 Dog 类型的“方法”，而不是一个普通函数。
// TO-DO: 如何写普通函数？d 是这个 Dog 类型的变量名（你可以理解为方法内部对 Dog 实例的引用）。
//用法和 Python 中的 self 类似。
    return d.Name + " says: Woof!"
}

type Cat struct {
    Name string
}

func (c Cat) Speak() string {
    return c.Name + " says: Meow!"
}

func makeAnimalSpeak(a Animal) {
    fmt.Println(a.Speak())
}

func main(){
    dog := Dog{Name: "Buddy"}
    cat := Cat{Name: "Kitty"}
    makeAnimalSpeak(dog)
    makeAnimalSpeak(cat)
    
    fmt.Println(dog.Speak())
}

```

Go 语言中最核心、最优雅的设计之一 —— 接口的隐式实现机制
在 Go 中，只要一个类型实现了接口要求的所有方法，Go 会自动认为它是这个接口的实现 —— 不需要显式声明。

```
你定义了这个接口：

type Animal interface {
    Speak() string
}

你定义了一个结构体：

type Dog struct {
    Name string
}

然后你为 Dog 写了一个方法：

func (d Dog) Speak() string {
    return d.Name + " says: Woof!"
}
// 你没有显式声明 Dog 实现了 Animal 接口，但 Go 会自动认为它实现了这个接口。

此时 Go 编译器会自动识别：
- ✅ Dog 实现了 Speak() string 方法；
- ✅ Animal 接口只要求 Speak() string；
- ✅ 所以 Dog 自动实现了 Animal 接口。

```
| 语法块                                        | 作用                                        |
| ------------------------------------------ | ----------------------------------------- |
| `type Animal interface { Speak() string }` | 定义接口，任何实现 `Speak() string` 方法的类型就是 Animal |
| `type Dog struct { Name string }`          | 定义结构体 Dog，含一个字段 Name                      |
| `func (d Dog) Speak() string`              | 给 Dog 添加方法，实现接口                           |
| `func makeAnimalSpeak(a Animal)`           | 函数参数是接口类型，可以接收任何实现了该接口的类型                 |
| `makeAnimalSpeak(dog)`                     | 把 Dog 实例当作 Animal 传参                      |

使用接口作为参数（如 func makeAnimalSpeak(a Animal)）的优势是：
 - 你可以用一个函数，统一处理多种类型（如 Dog、Cat、Duck），而不需要写多个重复函数或逻辑 —— 这就是 多态的体现。
 - ✅ 复用性高：函数只写一次，支持所有实现 Animal 的类型
 - ✅ 解耦合：你不关心传进来的到底是 Dog 还是 Cat
 - ✅ 适合扩展场景（比如新加一个类型 Monkey）


New 和 Make的区别是什么

```


```

```
func loadConfig(data []byte) (*Config, error) {
	var cfg Config
	err := yaml.Unmarshal(data, &cfg)
	return &cfg, err
}

cfg, error := loadConfig(data)
fmt.Printf("解析成功，配置内容: %+v\n", config)  // %+v fnt.Printf支持格式化字符串（比如 %s, %d, %+v 等）。

// 参数 data []byte：表示传入的配置数据是一个字节数组（一般是读取自文件的内容）。
// *Config 表示返回的是 Config 类型的 指针；
// &cfg 表示将变量 cfg 的地址（即指针）返回
```

✅ fmt.Printf 常用格式化符号一览

| 占位符   | 类型/含义            | 示例值                  | 输出结果示例                        |
| ----- | ---------------- | -------------------- | ----------------------------- |
| `%v`  | 原始值（默认格式）        | `42`, `"hi"`         | `42`, `hi`                    |
| `%+v` | 结构体字段 + 值        | `struct{Name: "Go"}` | `{Name:Go}`                   |
| `%#v` | Go 语法格式输出（带类型信息） | `42`                 | `42`；`main.Config{Name:"Go"}` |
| `%T`  | 类型               | `42`                 | `int`                         |
| `%%`  | 字面上的 `%` 符号      | 无                    | `%`                           |

```golang

[i577081@ACSPHL012888 Golang]$ go doc github.com/hashicorp/vault/api.DefaultConfig 
package api // import "github.com/hashicorp/vault/api"

func DefaultConfig() *Config
    DefaultConfig returns a default configuration for the client. It is safe to
    modify the return value of this function.

    The default Address is https://127.0.0.1:8200, but this can be overridden by
    setting the `VAULT_ADDR` environment variable.

    If an error is encountered, the Error field on the returned *Config will be
    populated with the specific error.

// 如何查看返回这个函数返回的 *Config    go doc github.com/hashicorp/vault/api.config
// 你怎么知道在api下
// DefaultConfig() 是 api 包的函数
// 它返回的是当前包里的 *Config 类型
// 如果是别的包，例如 vault.Config，它会显式写出：*vault.Config

```

go mod init vault-client-go  go mod tidy  和 go.mod 都是什么作用

```text
模块相关的核心文件和命令包括：

go.mod: 模块的配置清单文件（你项目的“身份证”）
类似
- Python 的 requirements.txt
- Node.js 的 package.json

go.sum: 模块依赖的校验和（保证下载内容一致）

go mod init, go mod tidy: 管理模块用的命令
```

匿名函数 
```
(func(m string) { ... })(msg)



msg := "Hello" 
func printMsg(m string) {
    fmt.Println(m)
}{msg}
go printMsg(msg)



```