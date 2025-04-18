


```
# source: /root/multidc-addzone

rndc addzone $zone '{type slave; masters { $masterip; }; file \"slave/${zone}zone\"; };'

rndc -k /etc/rndc.key status

Generate TSIG Key
- tsig-keygen (recommended)
- rndc-confgen
- openssl rand -base64 32
- dnssec-keygen -a HMAC-SHA256 -b 256 -n HOST mykeyname

rndc-confgen -a -c /etc/rndc.key -A hmac-sha512 -b 512  # Don't run from a live VM. Please note the risk of breaking the running bind server
Limitation:  Can use dnssec-keygen to generate TISG key as hmac-sha512 is a must but not being supported by dnssec-keygen

```