


From Client - Similar to pppcp.key for BTP NEO
```
k run nsupdate-pod --rm -it --image=alpine -- sh
apk install bind-tools

/ # nsupdate -v -k /etc/rndc.key <<EOF
> server 100.114.88.204
> zone dyn.example.com
> update add ttest.dyn.example.com 60 A 192.0.2.123
> send
> EOF
/ # dig @100.114.88.204 ttest.dyn.example.com



cat <<EOF > /etc/bind/pppcp.key
// TSIG pppcp key for BTP PSA Multidc secure dynamic update
key "pppcp-key" {
    algorithm hmac-sha256;
    secret "64x88jYklWnCuU/JOrIoz58Fy+sYrILJGBlObvB/16E="; // Use dnssec-keygen 
};
EOF
```


ServerSide logs:
```
11-Jul-2025 06:35:09.168 client @0x7f4a700131b8 100.104.0.154#37009/key update-key: signer "update-key" approved
11-Jul-2025 06:35:09.168 client @0x7f4a700131b8 100.104.0.154#37009/key update-key: updating zone 'dyn.example.com/IN': adding an RR at 'ttest.dyn.example.com' A 192.0.2.123
11-Jul-2025 06:35:09.172 zone dyn.example.com/IN: sending notifies (serial 2)
11-Jul-2025 06:35:09.172 network unreachable resolving 'dns01.dummy/A/IN': 2001:500:2f::f#53
11-Jul-2025 06:35:09.172 network unreachable resolving 'dns02.dummy/A/IN': 2001:500:2f::f#53
11-Jul-2025 06:35:09.172 network unreachable resolving 'dns01.dummy/AAAA/IN': 2001:500:2f::f#53
11-Jul-2025 06:35:09.172 network unreachable resolving 'dns02.dummy/AAAA/IN': 2001:500:2f::f#53

TO-DO: remove IPv6 listen

```

forwarder testing pod.
```
k run podtest-forwarder --image=cytopia/bind --env="DNS_FORWARDER=100.114.88.213"
```