


// 
```
package main

import (
	"fmt"
	"strings"
)

type LabelName string
type LabelValue string
type LabelSet map[LabelName]LabelValue

// 这个并不是一个简单方法，而是一个Go编程思想的体现。 
// 其重写了 fmt包中的Stringer接口，改变了系统默认行为，在fmt.Println(ls) 时候调用，其体现了多态的设计思想
// type Stringer interface {
//     String() string
// }
// https://pkg.go.dev/fmt#Stringer
func (ls LabelSet) String() string {
	var pairs []string
	for k, v := range ls {
		pairs = append(pairs, fmt.Sprintf("%s=%s", k, v))
		fmt.Println(pairs)
	}
	return "LabelSet{" + strings.Join(pairs, ", ") + "}"
}

func main() {
	ls := LabelSet{"env": "prod", "team": "backend"}
	fmt.Println(ls)
}

```