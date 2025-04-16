



Drop zone file to dyn
```
sh-5.2#  cat example.com.zone
$TTL 86400
@   IN  SOA ns1.example.com. admin.example.com. (
        2024041501 ; serial
        3600       ; refresh
        1800       ; retry
        1209600    ; expire
        86400 )    ; minimum
    IN  NS  ns1.example.com.

ns1 IN A 192.168.1.1
```

Check zone integrity
```
named-checkzone example.com /var/lib/named/dyn/example.com.zone
```

RNDC Reload - To load the zone to bind
```
15-Apr-2025 09:54:02.447 reloading zones succeeded
15-Apr-2025 09:54:02.449 zone example.com/IN: loaded serial 2024041501
15-Apr-2025 09:54:02.449 all zones loaded
15-Apr-2025 09:54:02.449 FIPS mode is disabled
15-Apr-2025 09:54:02.449 running
15-Apr-2025 09:54:02.452 managed-keys-zone: Key 20326 for zone . is now trusted (acceptance timer complete)
15-Apr-2025 09:54:02.452 managed-keys-zone: Key 38696 for zone . is now trusted (acceptance timer complete)
```


Validate
```
sh-5.2#  dig @127.0.0.1 ns1.example.com +short
192.168.1.1
```

Test nsupdate 

```

include "/etc/rndc.key";  in /etc/named.conf

/usr/bin/nsupdate -v -r 30 -l -k /etc/named.d/sapcp.key
update add test1.<btpdc>.scp.net.sap. 3600 IN A 11.0.0.1
update add test2.<btpdc>.scp.net.sap. 3600 IN A 11.0.0.2
update add test3.<btpdc>.scp.net.sap. 3600 IN A 11.0.0.3
update add test4.<btpdc>.scp.net.sap. 3600 IN A 11.0.0.4
update add test5.<btpdc>.scp.net.sap. 3600 IN A 11.0.0.5
update add test-cname.<btpdc>.scp.net.sap. 3600 IN CNAME test1.<btpdc>.scp.net.sap.
update add text.<btpdc>.scp.net.sap. 3600 TXT "Some arbitrary text."
update add text.<btpdc>.scp.net.sap. 3600 TXT "Guess what, it seems to be working."
send

sh-5.2# nsupdate -v -r 30 -l -k /etc/rndc.key
> update add test1.example.com. 3600 IN A 11.0.0.1
> send
; Communication with ::1#53 failed: address not available

Solution: nsupdate -4 -v -r 30 -l -k /etc/rndc.key
```

Docker container 开了端口映射后 `-p 53:53 `，在宿主/host VM 可以通过docker inspect获取容器IP 并进行DNS 请求测试。
`docker run -d --rm -v /srv/bind:/data --name bind -p 53:53/tcp -p 53:53/udp registry.opensuse.org/opensuse/bind`

```
bash-4.4$ dig @172.17.0.2 test1.example.com +short
11.0.0.1
bash-4.4$ dig @172.17.0.2 ns1.example.com +short
192.168.1.1
```


Adding example zone to slave server 

Option1:
```
zone "example.com" {
    type slave;
    file "/var/lib/named/slave/example.com.zone";
    masters { 172.17.0.2; };  //
    allow-query { any; };       // allow query to anyone
};
```
Option2:
```
rndc addzone $zone '{type slave; masters { $masterip; }; file \"slave/${zone}zone\"; };

rndc addzone example.com '{type slave; masters { 172.17.0.2; }; file "slave/example.comzone"; };'
```

Option2 failed below, but why ????

```
sh-5.2# rndc addzone example.com '{type slave; masters { 172.17.0.2; }; file "slave/example.comzone"; };'
rndc: 'addzone' failed: permission denied
Not allowing new zones in view '_default'
```

Finally,
Option1: worked

From slave it present the following logs.
```
15-Apr-2025 14:56:08.857 reloading configuration succeeded
15-Apr-2025 14:56:08.857 reloading zones succeeded
15-Apr-2025 14:56:08.860 all zones loaded
15-Apr-2025 14:56:08.860 FIPS mode is disabled
15-Apr-2025 14:56:08.860 running
15-Apr-2025 14:56:08.862 managed-keys-zone: Key 20326 for zone . is now trusted (acceptance timer complete)
15-Apr-2025 14:56:08.862 managed-keys-zone: Key 38696 for zone . is now trusted (acceptance timer complete)
15-Apr-2025 14:56:08.862 zone example.com/IN: Transfer started.
15-Apr-2025 14:56:08.863 0x7f8307d2f000: transfer of 'example.com/IN' from 172.17.0.2#53: connected using 172.17.0.2#53
15-Apr-2025 14:56:08.864 zone example.com/IN: transferred serial 2024041502
15-Apr-2025 14:56:08.864 0x7f8307d2f000: transfer of 'example.com/IN' from 172.17.0.2#53: Transfer status: success
15-Apr-2025 14:56:08.864 0x7f8307d2f000: transfer of 'example.com/IN' from 172.17.0.2#53: Transfer completed: 1 messages, 5 records, 174 bytes, 0.001 secs (174000 bytes/sec) (serial 2024041502)
```

Test another zone transfer but not working - FIXME

```
sh-5.2# dig +tcp @172.17.0.3 AXFR example.com

; <<>> DiG 9.20.7 <<>> +tcp @172.17.0.3 AXFR example.com
; (1 server found)
;; global options: +cmd
; Transfer failed.
```


### Appendix:
MISC:
- install iputils for conn testing. `zypper in iputils vim`

Bind master server's `named.conf`
```
sh-5.2# grep -vE '^\s*#|^\s*$' /etc/named.conf
include "/etc/rndc.key";
options {
        stale-answer-enable no;
        directory "/var/lib/named";
        managed-keys-directory "/var/lib/named/dyn/";
        include "/etc/crypto-policies/back-ends/bind.config";
        dump-file "/var/log/named/dump.db";
        statistics-file "/var/log/named/stats";
        listen-on port 53 { 127.0.0.1; any; };
        allow-update { localhost; };
        listen-on-v6 { none; };
        notify no;
    disable-empty-zone "1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.IP6.ARPA";
    geoip-directory none;
};
zone "." in {
        type hint;
        file "root.hint";
};
zone "localhost" in {
        type master;
        file "localhost.zone";
};
zone "0.0.127.in-addr.arpa" in {
        type master;
        file "127.0.0.zone";
};
zone "example.com" IN {
    type master;
    file "/var/lib/named/dyn/example.com.zone";
    allow-update { key "rndc-key"; };  //
    allow-transfer { 172.17.0.3; };  // slave node IP, here is dockercontainer IP inside bridge network. docker network ls
    also-notify { 172.17.0.3; };
};

Bind slave server's named.conf

```
sh-5.2#  grep -vE '^\s*#|^\s*$' /etc/named.conf
include "/etc/rndc.key";
options {
        stale-answer-enable no;
        directory "/var/lib/named";
        managed-keys-directory "/var/lib/named/dyn/";
        include "/etc/crypto-policies/back-ends/bind.config";
        dump-file "/var/log/named/dump.db";
        statistics-file "/var/log/named/stats";
        listen-on port 53 { any; };
        allow-update { any; };
        listen-on-v6 { none; };
        notify no;
    disable-empty-zone "1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.IP6.ARPA";
    geoip-directory none;
};
zone "." in {
        type hint;
        file "root.hint";
};
zone "localhost" in {
        type master;
        file "localhost.zone";
};
zone "0.0.127.in-addr.arpa" in {
        type master;
        file "127.0.0.zone";
};
zone "example.com" {
    type slave;
    file "/var/lib/named/slave/example.com.zone";
    masters { 172.17.0.2; };  //
    allow-query { any; };       // allow query to anyone
};

```

sh-5.2# cat /var/lib/named/dyn/example.com.zone
$TTL 86400      ; 1 day
example.com.            IN SOA  ns1.example.com. admin.example.com. (
                                2024041502 ; serial
                                3600       ; refresh (1 hour)
                                1800       ; retry (30 minutes)
                                1209600    ; expire (2 weeks)
                                86400      ; minimum (1 day)
                                )
                        NS      ns1.example.com.
ns1.example.com.        A       192.168.1.1
$TTL 3600       ; 1 hour
test1.example.com.      A       11.0.0.1
```