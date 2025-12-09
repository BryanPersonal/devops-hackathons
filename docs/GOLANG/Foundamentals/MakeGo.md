
`make` is a built-in function to initialize quote type
- slice
- map
- chan



1. Slice: `make([]T, length, capacity)` /
- `[]T` is just a placeholder represent any type of the slice, eg. `[]int`, `[]string`, `[]Mystruct` 
- `map[K]V` represent key is with type: __K__, value is tpye: __V__'s For E.g `map[string]int`

```golang
package main

import "fmt"

func main() {
    // 创建一个长度为 3、容量为 5 的 int slice
    s := make([]int, 3, 5)
    fmt.Println("slice:", s)           // [0 0 0]
    fmt.Println("length:", len(s))     // 3
    fmt.Println("capacity:", cap(s))   // 5

    // 可以安全地赋值前 3 个元素
    s[0] = 10
    s[1] = 20
    s[2] = 30
    fmt.Println("after assignment:", s) // [10 20 30]

    // 追加元素不会立即扩容（因为容量为 5）
    s = append(s, 40, 50)
    fmt.Println("after append:", s)     // [10 20 30 40 50]
    fmt.Println("cap after append:", cap(s)) // 5（未扩容）
}
```
2. Map: `make(map[K]V, initialCapacity)`


```golang

func main() {
    m := make(map[string]int, 10)
    m["apple"] = 5
    m["banana"] = 3
    fmt.Println("map:", m) //OP: map[apple:5 banana:3]

    // initialCapacity 只是性能提示，不影响功能
    // 即使超过 10 个元素也能继续插入
    for i := 0; i < 20; i++ {
        m[fmt.Printf("key%d", i)] = i
    }
    fmt.Println("map size:", len(m)) // 22
}

```

