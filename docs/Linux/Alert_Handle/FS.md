


```

# VARFS
df -hP /var && find /var/ -xdev -type f -size +10000k -exec du -h {} \; | sort -h


df -h /tmp && find /tmp/ -xdev -type f -size +20000k -exec ls -lah {} \;


df -h /; ls -lahS $(find / -xdev -type f -size +50000k)

```

```
tar -czvf /basmnt/tempdata/i577081/var_log_cc02v015288.tar.gz /var/log
```