

```


cc01v012422:/var/lib/named # curl http://127.0.0.1:8053/json/v1/server | jq '.views["_default"].resolver.cachestats'
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  3011  100  3011    0     0  2973k      0 --:--:-- --:--:-- --:--:-- 2940k
{
  "CacheHits": 61542,
  "CacheMisses": 16227,
  "QueryHits": 61542,
  "QueryMisses": 8159,
  "DeleteLRU": 0,
  "DeleteTTL": 4309,
  "CoveringNSEC": 0,
  "CacheNodes": 13,
  "CacheNSECNodes": 0,
  "CacheBuckets": 0,
  "TreeMemInUse": 167678,
  "HeapMemInUse": 32992
}


# Look CPU tread allocation while stress testing 

watch -n 2 "pidstat -t -p $(pgrep named)"

```

```
cc01v012394

Ref:
https://software.opensuse.org/download/package?package=dnsperf&project=network:dns-oarc 
https://linux.die.net/man/1/dnsperf 


seq 10000 | awk '{print "random-"$1".test.example.com A"}' > cold-domains.txt 

watch -n5 'curl -s http://127.0.0.1:8053/json/v1/server | jq ".views[\"_default\"].resolver.cachestats"' 

cc01v012422:~ # dnsperf -s 127.0.0.1 -d cold-domains.txt -c 1 -n 1
DNS Performance Testing Tool
Version 2.14.0

[Status] Command line: dnsperf -s 127.0.0.1 -d cold-domains.txt -c 1 -n 1
[Status] Sending queries (to 127.0.0.1:53)
[Status] Started at: Thu Dec  4 10:39:20 2025
[Status] Stopping after 1 run through file
[Status] Testing complete (end of file)

Statistics:

  Queries sent:         10000
  Queries completed:    10000 (100.00%)
  Queries lost:         0 (0.00%)

  Response codes:       NXDOMAIN 10000 (100.00%)
  Average packet size:  request 45, response 101
  Run time (s):         15.524197
  Queries per second:   644.155701

  Average Latency (s):  0.152368 (min 0.028954, max 1.382291)
  Latency StdDev (s):   0.063233


{
  "CacheHits": 81828,
  "CacheMisses": 16276,
  "QueryHits": 61796,
  "QueryMisses": 18213,
  "DeleteLRU": 0,
  "DeleteTTL": 4314,
  "CoveringNSEC": 0,
  "CacheNodes": 10012,
  "CacheNSECNodes": 0,
  "CacheBuckets": 0,
  "TreeMemInUse": 12886951,
  "HeapMemInUse": 98528
}

Caching hit rate: 83.4 % 

// Part 2. 

dnsperf -s 127.0.0.1 -d hot-domains.txt -p 53 -c 50 -n 2000 -l 30 -S 5 -t 2

Statistics:

  Queries sent:         9098959
  Queries completed:    9082843 (99.82%)
  Queries lost:         16116 (0.18%)

  Response codes:       NXDOMAIN 9082843 (100.00%)
  Average packet size:  request 29, response 104
  Run time (s):         60.000256
  Queries per second:   151380.070778

  Average Latency (s):  0.000990 (min 0.000010, max 0.092730)
  Latency StdDev (s):   0.001167


{
  "CacheHits": 9179805,
  "CacheMisses": 16276,
  "QueryHits": 9150737,
  "QueryMisses": 23718,
  "DeleteLRU": 0,
  "DeleteTTL": 14319,
  "CoveringNSEC": 0,
  "CacheNodes": 517,
  "CacheNSECNodes": 0,
  "CacheBuckets": 0,
  "TreeMemInUse": 259343,
  "HeapMemInUse": 98528
}

```