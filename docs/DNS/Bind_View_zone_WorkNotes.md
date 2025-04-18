

```
sh-5.2# dig @172.17.0.2 int.example.com AXFR

; <<>> DiG 9.20.7 <<>> @172.17.0.2 int.example.com AXFR
; (1 server found)
;; global options: +cmd
int.example.com.        86400   IN      SOA     ns1.int.example.com. admin.int.example.com. 2024041502 3600 1800 1209600 86400
int.example.com.        86400   IN      NS      ns1.int.example.com.
ns1.int.example.com.    86400   IN      A       192.168.9.1
int.example.com.        86400   IN      SOA     ns1.int.example.com. admin.int.example.com. 2024041502 3600 1800 1209600 86400
;; Query time: 2 msec
;; SERVER: 172.17.0.2#53(172.17.0.2) (TCP)
;; WHEN: Wed Apr 16 17:15:02 UTC 2025
;; XFR size: 4 records (messages 1, bytes 184)

```



Manifest of View based zone details 

Master.  FIXME: I assume acl can be key also
```
acl internal_clients {
    127.0.0.1;
    172.17.0.2;  // Docker host Or other trusted IP
    172.17.0.3;
};

view "internal" {
    match-clients { internal_clients; };

    zone "int.example.com" IN {
        type master;
        file "/var/lib/named/dyn/int.example.com.internal.zone";
        allow-update { key "rndc-key"; };
        allow-transfer { 172.17.0.3; };  // slave IP
        also-notify { 172.17.0.3; };
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

};
```


开启了 `allow-new-zones yes;` 后，通过rndc添加 zone 

```
# 必须先在dyn下创建zone文件

sh-5.2#  cat b2.example.com.internal.zone
$TTL 86400      ; 1 day
b2.example.com.            IN SOA  ns1.b2.example.com. admin.b2.example.com. (
                                2024041502 ; serial
                                3600       ; refresh (1 hour)
                                1800       ; retry (30 minutes)
                                1209600    ; expire (2 weeks)
                                86400      ; minimum (1 day)
                                )
                        NS      b2.int.example.com.
ns1       A   192.168.9.3


# ⭐rndc 添加master zone  到 internal view 
sh-5.2# rndc addzone b2.example.com in internal '{
    type master;
    file "dyn/b2.example.com.internal.zone";  // 路径需相对于 BIND 工作目录（如 /var/named）
    allow-update { key "rndc-key"; };
    allow-transfer { 172.17.0.3; };
    also-notify { 172.17.0.3; };
};'

# 如何验证？ 通过`rndc addzone`添加后 会自动生成`internal.nzf` 在bind的 workdir下`/var/lib/named`   

验证1：
sh-5.2# cat internal.nzf
# New zone file for view: internal
# This file contains configuration for zones added by
# the 'rndc addzone' command. DO NOT EDIT BY HAND.
zone "b2.example.com" in internal { type master; file "dyn/b2.example.com.internal.zone"; allow-transfer  { 172.17.0.3/32; }; allow-update { key "rndc-key"; }; also-notify { 172.17.0.3; }; };

验证2：
rndc showzone b2.example.com.

```


#### Issue Encountered

```
16-Apr-2025 20:11:35.756 dumping master file: /var/lib/named/slaves/tmp-e4hjELJJWD: open: file not found
16-Apr-2025 20:11:35.756 zone int.example.com/IN/internal: dump failed: file not found
```

Solution: wrong slave zone path mentioned in /etc/named.conf


#### ⭐SAP Productive ACL configuration，good reference
```
acl "gmp-global" {
        key "gmp-0-global";
};
acl "slaves-global" {
        key "slave-0-global";
};

view "global" {
        match-clients {
                "gmp-global";
                "slaves-global";
        };
        server 100.70.226.31/32 {
                keys "slave-0-global";
        };
        server 100.70.226.41/32 {
                keys "slave-0-global";
        };
        zone "global.catalog" {
                type master;
                file "dyn/global/global.catalog";
        };
        allow-new-zones yes;
        allow-recursion {
                "none";
        };
        recursion no;
        allow-transfer {
                "slaves-global";
        };
        allow-update {
                "gmp-global";
        };
        also-notify {
                100.70.226.31;
                100.70.226.41;
        };
        notify yes;
};

```