
```
find . -type f -mtime -1 -exec ls -l {} \;
```


sed, grep, awk cheatsheets

```
# 删除空白格和注释行，展示。
grep -vE '^\s*#|^\s*$' /etc/named.conf

\s*：匹配 0 个或多个空白字符
^\s*#：匹配前面可能有空格的注释行
^\s*$：匹配空白行

```