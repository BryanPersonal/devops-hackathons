

```Golang
// 当你调用 SetQuestion(z, t) 时，你传入的 t (uint16) 最终会被变成数据包里那精确的 2 个字节

// 为了让全世界的 DNS 服务器都能互相通信，大家必须遵守一套统一的“数字字典”。IANA（互联网号码分配局）定义了这些数字的含义：
// 数字 1 统一代表 A 记录（IPv4 地址）。
// 数字 15 统一代表 MX 记录（邮件服务器）。
// 数字 28 统一代表 AAAA 记录（IPv6 地址）。

const (
    TypeA      uint16 = 1
    TypeNS     uint16 = 2
    TypeCNAME  uint16 = 5
    TypeMX     uint16 = 15
    TypeAAAA   uint16 = 28
    // ... 其他数百种类型
)

func (dns *Msg) SetQuestion(z string, t uint16) *Msg {
	dns.Id = Id()
	dns.RecursionDesired = true
	dns.Question = make([]Question, 1)
	dns.Question[0] = Question{z, t, ClassINET}
	return dns
}


```


basic minimum DNS query program

```Golang
package main

import (
	"fmt"
	"github.com/miekg/dns"
)

func main() {
	c := new(dns.Client)
	m := new(dns.Msg)
	m.SetQuestion(dns.Fqdn("example.com."), dns.TypeA)

	r, _, err := c.Exchange(m, "8.8.8.8:53")
	if err != nil {
		panic(err)
	}

	if len(r.Answer) > 0 {
		// .(*dns.A) 不是普通的访问指针，它是 类型断言。 它用于将通用的 接口类型 转换为具体的 结构体类型。
		if a, ok := r.Answer[0].(*dns.A); ok {
			// Answer   []RR
			// 通过定义接口 RR： 只要一个结构体（无论是 A、MX 还是 CNAME）
			// 实现了 RR 接口所要求的方法（例如 Header()、String()、len() 等），它就可以被放进 []RR 这个容器里
			fmt.Println("A:", a.A)
		}
	}
}
```