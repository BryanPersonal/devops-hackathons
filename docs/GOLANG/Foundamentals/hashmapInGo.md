


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