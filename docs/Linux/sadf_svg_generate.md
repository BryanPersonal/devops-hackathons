
This is for RCA
```
#!/bin/bash
# 用法: ./gen_sadf_svgs.sh sa_file start_time end_time output_dir
# 示例: ./gen_sadf_svgs.sh sa20250916 00:00:00 24:00:00 /tmp

SA_FILE=$1
START_TIME=$2
END_TIME=$3
OUTDIR=$4

mkdir -p "$OUTDIR/$(uname -n)_svgs" && chmod 755 "$OUTDIR"

# 定义指标数组 (sar 参数 : 输出文件名)
declare -A charts=(
  ["-u"]="cpu_usage.svg"              # CPU 利用率
  ["-P ALL"]="cpu_per_core.svg"       # 每个 CPU 核
  ["-r"]="memory_usage.svg"           # 内存使用
  ["-B"]="paging.svg"                 # 内存分页/交换
  ["-b"]="io_transfer.svg"            # IO 传输速率


  ["-n DEV"]="net_dev.svg"            # 网卡吞吐
  ["-n EDEV"]="net_err.svg"           # 网卡错误
  ["-n NFS"]="nfs_client.svg"         # NFS 客户端
  ["-q"]="sysload.svg"                # 系统负载
)

for key in "${!/tmp/mem[@]}"; do
  outfile="$OUTDIR/$(uname -n)_svgs/$(uname -n)_${charts[$key]}"
  echo "生成: $outfile"
  sadf -g "$SA_FILE" -s "$START_TIME" -e "$END_TIME" -- $key > "$outfile"
  chmod -r 755 $OUTDIR/$(uname -n)_svgs/*
done



echo "✅ 所有图表已生成到目录: $OUTDIR/$(uname -n)_svgs"
```