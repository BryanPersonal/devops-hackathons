
```
helm show all plutono/plutono

https://plutono.com/docs/plutono/latest/auth/github/#enable-github-in-plutono

helm repo add plutono https://credativ.github.io/helmcharts/charts
helm show all plutono/plutono |less

sni-plutono-c899c749c-m86xw:/usr/share/plutono$ plutono-cli admin reset-admin-password adminpassword
INFO[10-21|09:57:24] Connecting to DB                         logger=sqlstore dbtype=sqlite3
INFO[10-21|09:57:24] Starting DB migrations                   logger=migrator
INFO[10-21|09:57:24] migrations completed                     logger=migrator performed=0 skipped=279 duration=414.365µs

Admin password changed successfully ✔

```