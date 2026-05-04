
```
nodesh-i577081-maxwell-az-alpha-z1-86495-5hzgt:/ # iptables -t nat -L  |grep fluent-bit
KUBE-MARK-MASQ  all  --  100.104.7.89         anywhere             /* monitoring/fluent-bit:input */
DNAT       tcp  --  anywhere             anywhere             /* monitoring/fluent-bit:input */ tcp to:100.104.7.89:8080
KUBE-MARK-MASQ  all  --  100.104.1.4          anywhere             /* monitoring/fluent-bit:http */
DNAT       tcp  --  anywhere             anywhere             /* monitoring/fluent-bit:http */ tcp to:100.104.1.4:2020
KUBE-MARK-MASQ  all  --  100.104.5.16         anywhere             /* monitoring/fluent-bit:http */
DNAT       tcp  --  anywhere             anywhere             /* monitoring/fluent-bit:http */ tcp to:100.104.5.16:2020
KUBE-MARK-MASQ  all  --  100.104.1.4          anywhere             /* monitoring/fluent-bit:input */
DNAT       tcp  --  anywhere             anywhere             /* monitoring/fluent-bit:input */ tcp to:100.104.1.4:8080
KUBE-MARK-MASQ  all  --  100.104.5.16         anywhere             /* monitoring/fluent-bit:input */
DNAT       tcp  --  anywhere             anywhere             /* monitoring/fluent-bit:input */ tcp to:100.104.5.16:8080
KUBE-MARK-MASQ  all  --  100.104.7.89         anywhere             /* monitoring/fluent-bit:http */
DNAT       tcp  --  anywhere             anywhere             /* monitoring/fluent-bit:http */ tcp to:100.104.7.89:2020
KUBE-MARK-MASQ  all  --  100.104.6.251        anywhere             /* monitoring/fluent-bit:http */
DNAT       tcp  --  anywhere             anywhere             /* monitoring/fluent-bit:http */ tcp to:100.104.6.251:2020
KUBE-MARK-MASQ  all  --  100.104.6.251        anywhere             /* monitoring/fluent-bit:input */
DNAT       tcp  --  anywhere             anywhere             /* monitoring/fluent-bit:input */ tcp to:100.104.6.251:8080
KUBE-SVC-JXAWHQJ4TWOO5OLQ  tcp  --  anywhere             100.104.104.112      /* monitoring/fluent-bit:http cluster IP */ tcp dpt:xinupageserver
KUBE-SVC-W5XLKHDUNWN4HHWD  tcp  --  anywhere             100.104.104.112      /* monitoring/fluent-bit:input cluster IP */ tcp dpt:http-alt
KUBE-MARK-MASQ  tcp  -- !100.104.0.0/18       100.104.104.112      /* monitoring/fluent-bit:http cluster IP */ tcp dpt:xinupageserver
KUBE-SEP-6LTZJUSN2WI4L7UA  all  --  anywhere             anywhere             /* monitoring/fluent-bit:http -> 100.104.1.4:2020 */ statistic mode random probability 0.25000000000
KUBE-SEP-CYOVMJPAPGHQXHXT  all  --  anywhere             anywhere             /* monitoring/fluent-bit:http -> 100.104.5.16:2020 */ statistic mode random probability 0.33333333349
KUBE-SEP-PPI2HUMEK34PDU6F  all  --  anywhere             anywhere             /* monitoring/fluent-bit:http -> 100.104.6.251:2020 */ statistic mode random probability 0.50000000000
KUBE-SEP-OGFQV6RG7YG5JWNJ  all  --  anywhere             anywhere             /* monitoring/fluent-bit:http -> 100.104.7.89:2020 */
KUBE-MARK-MASQ  tcp  -- !100.104.0.0/18       100.104.104.112      /* monitoring/fluent-bit:input cluster IP */ tcp dpt:http-alt
KUBE-SEP-LB7PE3AWDTR7P77N  all  --  anywhere             anywhere             /* monitoring/fluent-bit:input -> 100.104.1.4:8080 */ statistic mode random probability 0.25000000000
KUBE-SEP-NKQKB2SCB457HUCG  all  --  anywhere             anywhere             /* monitoring/fluent-bit:input -> 100.104.5.16:8080 */ statistic mode random probability 0.33333333349
KUBE-SEP-TEYHZSWI6ZPKIQVS  all  --  anywhere             anywhere             /* monitoring/fluent-bit:input -> 100.104.6.251:8080 */ statistic mode random probability 0.50000000000
KUBE-SEP-5XDESUV3QJGCZYI5  all  --  anywhere             anywhere             /* monitoring/fluent-bit:input -> 100.104.7.89:8080 */
```


很好，这一步我们把你那一堆“flatten 输出”的规则，**还原成真实执行顺序**，并在每一段后面加上**工程级注释**。最后我会给你一个**一段话总结**，可以直接用于文档/面试。

---

# 🧭 一、按真实执行顺序重排（非常关键）

> ⚠️ 注意：iptables 实际是“链调用”，不是你看到的平铺顺序
> 下面是**逻辑执行顺序（从入口到出口）**

---

## 🧩 ① Service 入口（KUBE-SERVICES → KUBE-SVC）

```bash
KUBE-SVC-JXAWHQJ4TWOO5OLQ  tcp  --  anywhere  100.104.104.112  /* monitoring/fluent-bit:http cluster IP */ tcp dpt:2020
KUBE-SVC-W5XLKHDUNWN4HHWD  tcp  --  anywhere  100.104.104.112  /* monitoring/fluent-bit:input cluster IP */ tcp dpt:8080
```

👉 注释：

```text
匹配访问 fluent-bit ClusterIP (100.104.104.112) 的流量
根据端口（2020 / 8080）进入不同的 Service 链
```

---

## 🧩 ② 判断是否需要 SNAT（第一次 MARK）

```bash
KUBE-MARK-MASQ  tcp  -- !100.104.0.0/18  100.104.104.112  /* monitoring/fluent-bit:http */
KUBE-MARK-MASQ  tcp  -- !100.104.0.0/18  100.104.104.112  /* monitoring/fluent-bit:input */
```

👉 注释：

```text
如果源 IP 不属于 Pod CIDR（100.104.0.0/18），则打上 SNAT 标记（0x4000）
这里只是“标记”，不会立即执行 SNAT
```

---

## 🧩 ③ 负载均衡（KUBE-SVC → KUBE-SEP）

```bash
KUBE-SEP-6LTZJUSN2WI4L7UA  ... probability 0.25  /* → 100.104.1.4:2020 */
KUBE-SEP-CYOVMJPAPGHQXHXT  ... probability 0.33  /* → 100.104.5.16:2020 */
KUBE-SEP-PPI2HUMEK34PDU6F  ... probability 0.5   /* → 100.104.6.251:2020 */
KUBE-SEP-OGFQV6RG7YG5JWNJ  ...                   /* → 100.104.7.89:2020 */

KUBE-SEP-LB7PE3AWDTR7P77N  ... probability 0.25  /* → 100.104.1.4:8080 */
KUBE-SEP-NKQKB2SCB457HUCG  ... probability 0.33  /* → 100.104.5.16:8080 */
KUBE-SEP-TEYHZSWI6ZPKIQVS  ... probability 0.5   /* → 100.104.6.251:8080 */
KUBE-SEP-5XDESUV3QJGCZYI5  ...                   /* → 100.104.7.89:8080 */
```

👉 注释：

```text
使用概率匹配（statistic）实现负载均衡
逐条规则判断，最终随机选择一个后端 Pod
```

---

## 🧩 ④ 进入具体 Pod 链（KUBE-SEP 内部）

（你看到的“展开版”）

```bash
KUBE-MARK-MASQ  all  --  100.104.1.4   anywhere  /* fluent-bit */
KUBE-MARK-MASQ  all  --  100.104.5.16  anywhere
KUBE-MARK-MASQ  all  --  100.104.6.251 anywhere
KUBE-MARK-MASQ  all  --  100.104.7.89  anywhere
```

👉 注释：

```text
在具体 Pod 链中再次执行 MARK（补充/兜底）
用于处理跨节点、hairpin 等复杂场景
保证需要 SNAT 的流量不会漏标记
```

---

## 🧩 ⑤ DNAT（真正转发到 Pod）

```bash
DNAT  tcp  --  anywhere  anywhere  /* → 100.104.1.4:2020 */
DNAT  tcp  --  anywhere  anywhere  /* → 100.104.5.16:2020 */
DNAT  tcp  --  anywhere  anywhere  /* → 100.104.6.251:2020 */
DNAT  tcp  --  anywhere  anywhere  /* → 100.104.7.89:2020 */

DNAT  tcp  --  anywhere  anywhere  /* → 100.104.1.4:8080 */
DNAT  tcp  --  anywhere  anywhere  /* → 100.104.5.16:8080 */
DNAT  tcp  --  anywhere  anywhere  /* → 100.104.6.251:8080 */
DNAT  tcp  --  anywhere  anywhere  /* → 100.104.7.89:8080 */
```

👉 注释：

```text
将目标地址从 ClusterIP:Port 改写为选中的 PodIP:Port
这是 Service 转发的核心（DNAT）
```

---

## 🧩 ⑥ POSTROUTING（未在你输出中，但必须存在）

```bash
-A POSTROUTING -m mark --mark 0x4000 -j MASQUERADE
```

👉 注释：

```text
对已打标记的流量执行 SNAT
将源地址从 ClientIP 改为 NodeIP
确保回包路径对称
```

---

# 🔁 二、完整执行链（串起来）

```text
PREROUTING
  ↓
KUBE-SERVICES
  ↓
KUBE-SVC（匹配 ClusterIP）
  ↓
KUBE-MARK-MASQ（判断是否需要 SNAT → 打标记）
  ↓
KUBE-SEP（负载均衡选 Pod）
  ↓
KUBE-MARK-MASQ（再次确认标记）
  ↓
DNAT（改目标 IP → Pod）
  ↓
Routing
  ↓
POSTROUTING
  ↓
MASQUERADE（真正 SNAT）
```

---

# 🎯 三、最终总结（一段话，直接可用）

> When traffic hits the fluent-bit ClusterIP, kube-proxy first matches it in the KUBE-SVC chain and determines whether SNAT is required by applying KUBE-MARK-MASQ based on the source CIDR. It then performs probabilistic load balancing via KUBE-SEP chains to select a backend Pod. Inside the selected KUBE-SEP chain, DNAT rewrites the destination IP to the Pod IP. Finally, in POSTROUTING, packets previously marked for masquerading are SNATed to the node IP, ensuring symmetric return paths and correct conntrack behavior.

---

# 🧠 四、给你一个“终极理解模型”

你可以把整个过程简化为：

```text
1. 选服务（KUBE-SVC）
2. 决定是否 SNAT（MARK）
3. 选 Pod（KUBE-SEP）
4. DNAT（转发）
5. SNAT（回程保证）
```

---

如果你下一步想再进阶，我建议你看这个：

👉 **同一条流量在 conntrack 表里的变化（原始五元组 vs NAT 后五元组）**

这个会让你把 DNAT + SNAT + 回包彻底串起来（很多高级排障都靠这个）。
