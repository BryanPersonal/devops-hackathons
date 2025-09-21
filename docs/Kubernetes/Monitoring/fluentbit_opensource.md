
repository: https://fluent.github.io/helm-charts
```
fluent-bit:
  octobus:
    url: in-https.eude2.ccloud.octobus.tools.sap
    index: c0044
    generic: log
    specific: si_shoot_log
  landscape_name: sitlandscape
  shoot_name: sit081
  image:
    repository:
      dockerio.int.repositories.cloud.sap/fluent/fluent-bit
  serviceMonitor:
    enabled: true
  annotations:
    prometheus.io/path: "/api/v1/metrics/prometheus"
    prometheus.io/port: "2020"
    prometheus.io/scrape: "true"
  service:
    annotations:
      prometheus.io/path: "/api/v1/metrics/prometheus"
      prometheus.io/port: "2020"
      prometheus.io/scrape: "true"
  extraPorts:
    - port: 8080
      containerPort: 8080
      protocol: TCP
      name: input
  persistence:
    enabled: "true"
    size: 1Gi
    storageClass: default
    accessMode: ReadWriteOnce
  logLevel: warn
  extraVolumeMounts:
    - mountPath: /var/log/flb-storage
      name: log-storage
  extraVolumes:
    - name: log-storage
      emptyDir:
        sizeLimit: 1Gi
  resources:
    limits:
      cpu: 200m
      memory: 512Mi
    requests:
      cpu: 15m
      memory: 128Mi
  prometheusRule:
    enabled: true
    rules:
    - alert: NoOutputBytesProcessed
      expr: rate(fluentbit_output_proc_bytes_total[5m]) == 0
      annotations:
        message: "Fluent Bit instance {{ $labels.instance }}'s output plugin {{ $labels.name }} has not processed any bytes for at least 15 minutes."
        summary: No Output Bytes Processed
      for: 15m
      labels:
        severity: critical
  luaScripts:
    #extract_event.lua: |
      # extract_event.lua
    k8s_event.lua: |
      function k8s_event_to_string(tag, timestamp, record)
          local ns = record["metadata"]["namespace"] or "unknown"
          local obj = record["involvedObject"]["name"] or "unknown"
          local kind = record["involvedObject"]["kind"] or "unknown"
          local reason = record["reason"] or ""
          local msg = record["message"] or ""
          local count = record["count"] or 0

          record["event_str"] = string.format("[%s/%s] %s: %s (count=%d)", ns, kind, obj, reason, msg, count)
          return 1, timestamp, record
      end

      function flatten_k8s_event(tag, timestamp, record)
          -- Print all keys for debugging
          print("=== All record keys ===")
          for k, v in pairs(record) do
              print("Key: " .. tostring(k) .. " = " .. tostring(v))
          end
          print("=== End of keys ===")
          
          -- Extract fields
          record["event_ns"] = record["metadata"]["namespace"] or "unknown"
          record["event_kind"] = record["involvedObject"]["kind"] or "unknown"
          record["event_obj"] = record["involvedObject"]["name"] or "unknown"
          record["event_fieldPath"] = record["involvedObject"]["fieldPath"] or "unknown"
          record["reason"] = record["reason"] or ""
          record["message"] = record["message"] or ""
          record["count"] = record["count"] or 0
          record["event_type"] = record["type"] or "Unknown"
          record["pod_uid"] = record["involvedObject"]["uid"] or "unknown"
          
          -- Format timestamp
          local event_time = record["firstTimestamp"] or record["lastTimestamp"] or "unknown"
          
          -- Create detailed event_summary field
          record["event_summary"] = string.format("[%s] %s | %s | %s/%s | %s | %s | %s | %s (count=%d)", 
              event_time,
              record["event_type"],
              record["event_kind"],
              record["event_ns"], 
              record["event_obj"],
              record["pod_uid"],
              record["event_fieldPath"],
              record["reason"], 
              record["message"], 
              record["count"])
          
          -- Ensure event_summary is preserved as a top-level field
          -- record["k8s_event_summary"] = record["event_summary"]
          
          return 1, timestamp, record
      end

  config:
    outputs: |
      [OUTPUT]
          Name stdout
          Match k8s_events
          Format json
      [OUTPUT]
          Name             http
          Match            *
          Host             {{ .Values.octobus.url }}
          Port             443
          URI              /{{ .Values.octobus.index }}/{{ .Values.octobus.generic }}/{{ .Values.octobus.specific }}
          Format           json
          tls              On
          tls.verify       Off  
    inputs: |
      [INPUT]
          Name tail
          Path /var/log/containers/*.log
          multiline.parser docker, cri
          Tag kube.*
          Mem_Buf_Limit 100MB
          Skip_Long_Lines Off
          Skip_Empty_Lines  On
          Key               message
          Exclude_Path      /var/log/pods/*/*/*.gz,/var/log/pods/*/*/*.zip
      [INPUT]
          Name              http
          Listen            0.0.0.0
          Tag               http.*
          Port              8080 # same es in extraPorts defined
          Buffer_Chunk_Size 512k
          Buffer_Max_Size   10M
          storage.type      filesystem
      [INPUT]
          Name kubernetes_events
          Tag k8s_events
          # ask k8s API for updates every 30 seconds
          interval_sec 30
          # fetch at most 250 items per requests (pagination)
          kube_request_limit 250
    filters: |
      [FILTER]
          Name  kubernetes
          Match kube.*
          Kube_URL       https://kubernetes.default.svc:443
          Merge_Log On
          Keep_Log Off
          Labels   Off
          Annotations Off
          Buffer_Size 256KB
      [FILTER]
          Name  record_modifier
          Match kube.*
          Record inventory.landscape_name {{ .Values.landscape_name }}
          Record cluster {{ .Values.shoot_name }}
          Record tenant.id {{ .Values.octobus.index }}
          Record sourcetype.generic {{ .Values.octobus.generic }}
          Record sourcetype.specific {{ .Values.octobus.specific }}
          Remove_key db_*
          Remove_key target_*
          Remove_key redis_*

      # K8s events record_modifier
      [FILTER]
          Name  record_modifier
          Match k8s_events
          Record cluster_events k8s_events  
          Record inventory.landscape_name {{ .Values.landscape_name }}
          Record cluster {{ .Values.shoot_name }}
          Record tenant.id {{ .Values.octobus.index }}
          Record sourcetype.generic {{ .Values.octobus.generic }}
          Record sourcetype.specific {{ .Values.octobus.specific }}


      # [FILTER]
      #     Name    lua
      #     Match   k8s_events
      #     script  /fluent-bit/scripts/extract_event.lua
      #     call    extract

      # [FILTER]
      #     Name   lua
      #     Match  k8s_events
      #     Script /fluent-bit/scripts/k8s_event.lua
      #     Call   k8s_event_to_string
      [FILTER]
          Name   lua
          Match  k8s_events
          Script /fluent-bit/scripts/k8s_event.lua
          Call   flatten_k8s_event

      [FILTER]
          Name  Grep
          Match kube.*
          Exclude subcomponent json
      [FILTER]
          Name modify
          Match kube.*
          Rename log message
          Rename ts time
      [FILTER]
          Name modify
          Match      http.*
          Add REMOTE_REGION yes
      [FILTER]
          Name       record_modifier
          Match      http.*
          Remove_key SERIAL
          Remove_key DT

      [FILTER]
          Name parser
          Match k8s_events
          Key_Name message
          Parser json

      # # 展开 involvedObject 字段
      # [FILTER]
      #     Name   nest
      #     Match  k8s_events
      #     Operation lift
      #     Nested_under involvedObject
      #     Add_prefix obj_

      [FILTER]
          Name   modify
          Match  k8s_events

          # Rename   metadata.namespace    kubernetes.namespace_name
          # Rename   obj_name              kubernetes.pod_name
          # Rename   obj_kind              kubernetes.object_kind
          # Rename   obj_uid               kubernetes.object_uid
          # Rename   obj_namespace         kubernetes.object_namespace

          # Event fields are categorized separately
          Rename reason          event.reason
          Rename message         event.message
          # Rename type            event.type
          Rename count           event.count
          Rename firstTimestamp  event.firstTimestamp
          Rename lastTimestamp   event.lastTimestamp

      [FILTER]
          Name  record_modifier
          Match k8s_events
          Remove_key metadata
          Remove_key involvedObject

  
    customParsers: |
      [PARSER]
          Name  docker_custom
          Format json
          Time_Keep Off
          Time_Key time
          Time_Format %Y-%m-%dT%H:%M:%S.%L
      [PARSER]
          Name   json_custom
          Format json

    service: |
      [SERVICE]
          Daemon Off
          Flush 1
          Log_Level {{ .Values.logLevel }}
          Parsers_File /fluent-bit/etc/parsers.conf
          Parsers_File /fluent-bit/etc/conf/custom_parsers.conf
          HTTP_Server On
          Health_Check On
          net.connect_timeout_log_error true
          net.connect_timeout           100
          net.keepalive                 on
          net.keepalive_idle_timeout    60
          net.dns.mode                  TCP
          net.buffer_max_size           64k
          storage.path              /var/log/flb-storage/
          storage.metrics           on

```