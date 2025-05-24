

```go
package main

import (
    "fmt"
    "math/rand"
    "time"
    "os"
)

func addTwoNumbers(a, b int) int {
    total := a + b
    return total
}

func sayHello(name string) (msgPrinted bool, err error) {
    msg := fmt.Sprintf("Hello %s, how are you today?", name)

    // write into a file
    f, err := os.Create("hello.txt")
    if err != nil {
        fmt.Println("Error creating file:", err)
        return
    }
    defer f.Close()  // CLOSE FileDescriptor 确保在函数退出时关闭打开的资源，比如文件、HTTP响应、数据库连接等。

    _, err = f.WriteString(msg + "\n")
    if err != nil {
        fmt.Println("Error writing to file:", err)
        return
    }

    fmt.Println(msg)
    msgPrinted = true
    return
}

func pickRandom(idx int) int {
    ints := []int{} // 创建随机整数切片
    for i := 0; i < 100; i++ {
        ints = append(ints, rand.Intn(100))
    }

    if idx < 0 || idx >= len(ints) {
        fmt.Println("Index out of range, returning 0")
        return 0
    }

    return ints[idx]
}

func main() {
    rand.Seed(time.Now().UnixNano())

    result := addTwoNumbers(10, 5)
    fmt.Println("Sum is:", result)

    // fmt.Print("What is your name: ")
    // fmt.Scanln(&name)    // this is similar to shell command: read -p "What is your name: " name
    var name string = "aa"

    sayHello(name)

    randomNumber := pickRandom(10)
    fmt.Println("Random number at index 10 is:", randomNumber)
}

```