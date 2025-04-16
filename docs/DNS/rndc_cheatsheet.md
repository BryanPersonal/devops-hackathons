


```
# source: /root/multidc-addzone

rndc addzone $zone '{type slave; masters { $masterip; }; file \"slave/${zone}zone\"; };'

```