


### Pod

1. 优雅关闭 per container

```jsx title="Lifecycle Hook"
  lifecycle:
    preStop:
      exec:
        command:
        - "pkill"
        - "saslauthd"
```

2. 健康检查 (readiness probe / startup probe / healthy probe)

```

```