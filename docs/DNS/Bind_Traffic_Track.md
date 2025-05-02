


```
sed -n 's/querylog no;/querylog yes;/gp' /etc/named.conf

sed -i 's/querylog no;/querylog yes;/' /etc/named.conf && named-checkconf && systemctl restart named && ls -l /var/lib/named/log/queries.log

export IPRANGE="127\.0\.0\.1|100\.84\.64\.|100\.84\.65\."

100.84.64.0/23

````