

```
echo | openssl s_client -connect ccplusDev.rot.s4h.sap.corp:443 -servername ccplusDev.rot.s4h.sap.corp 2>/dev/null | openssl x509 -noout -text
```