



#### Bug1:  dns-api transation stuck in PS
`dns-api` won't update view list from primary slave with `dns-api view list` while the former transaction is still running. 

Solution: You will have to `dns-api work status` and `dns-api work commit` from PS then re-run `/usr/bin/dns-api-check-slaves -d` from HM. SO! Be careful with `failed with exit:42 signal:0`

```
checking primary slave 100.70.226.41
*** running remotely dns-api@100.70.226.41: sudo dns-api --log-reads view list
Transaction in process
Running cmd 'sudo dns-api --log-reads view list' failed with exit:42 signal:0
W: 100.70.226.41: dns-api command 'view list' on primary slave: running remote command ssh dns-api@100.70.226.41 sudo dns-api --log-reads view list (exit=42 signal=0)
fixing primary slave 100.70.226.31
*** running remotely dns-api@100.70.226.31: sudo dns-api --log-reads work begin
no changes on 100.70.226.31
*** running remotely dns-api@100.70.226.31: sudo dns-api --log-reads work rollback
skipping primary slave 100.70.226.41 because of previous errors
```