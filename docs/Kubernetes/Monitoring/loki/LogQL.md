
https://grafana.com/docs/loki/latest/query/


```
# Search all available label under job
{job=~".+"}

#
{job=~".+"} |= "VaultStaticSecret"
{app="cassandra"} |= "exact match"

# 
{job=~"fluent-bit"}
| json
| cluster = "maxwell"
| inventory_landscape_name = "SNI-STAGING"
| reportingComponent = "VaultStaticSecret"
| type = "Warning"
```


```
# Check all available labels

curl 'http://<loki-url>/loki/api/v1/label'
~ $ curl http://vali-sidevops-vali.monitoring.svc.cluster.local:3100/vali/api/v1/label
{"status":"success","data":["__name__","hostname","job","namespace","pod"]}
⚠️ 实际只有这五种label WTF？


## Create curl pod
I757038@HP7V70T6MW canary % kubectl -n monitoring run curl-pod --image=curlimages/curl:latest --restart=Never -it --rm -- sh


# Query at a single point of time
# https://grafana.com/docs/loki/latest/reference/loki-http-api/#query-logs-at-a-single-point-in-time
#!/bin/sh
ENDPOINT="http://vali-sidevops-vali:3100/vali/api/v1/query_range"
QUERY='{pod="silicon-canary-sni-github-policy-manager-2509080535-7vjgg"}'
LIMIT=100
ITER=100


for i in $(seq 1 $ITER); do
  curl -G -s "$ENDPOINT" \
    --data-urlencode "query=$QUERY" \
    --data-urlencode "limit=$LIMIT" \
    --data-urlencode "start=0" > "logs_run_$i.json"
  echo "Fetched logs_run_$i.json"
  sleep 2s
done


```
