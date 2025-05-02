

```
currentTime := time.Now()
currentTime这个变量就是一个**Time对象**，相当于你说的“实例化对象”，但Go语言不像Python里是明确用class和实例那种机制；它更偏向于函数直接返回结构体值的风格。
```


# Go 数据类型参考

## 类型 例子 备注
| 类型   | 例子                                       | 备注                       |
|--------|-------------------------------------------|----------------------------|
| 变量   | `var a int = 10`                          | `var` 关键字声明变量       |
| 常量   | `const Pi = 3.14`                         | `const` 声明常量，不可修改  |
| int    | `var age int = 18`                        | 整数类型                   |
| string | `var name string = "Tom"`                 | 字符串类型                 |
| slice  | `nums := []int{1, 2, 3}`                  | 动态数组                   |
| map    | `ages := map[string]int{"Tom": 18}`        | key-value 键值对            |

```go
[]string: 类型是“字符串切片”
Go 语言不使用异常（exception）机制来表示错误，而是通过返回 error 类型显式传递错误：
```


Golang VS Python: https://govspy.peterbe.com/x


```go
// 初始化go module
go mod init helloworld
go build helloworld.go
go get golang.org/x/net/html

假设你代码中有如下导入： import "golang.org/x/net/html"
那么你就必须确保项目目录中有 go.mod 文件，并且该包已安装。
```