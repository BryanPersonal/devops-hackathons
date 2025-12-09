


Source:
sudo tcpdump -i any host hana-a3q-factoryus4-vtdfvhfu.us4.scp.net.ppp and port 30013 -nn -vv -s 0 -w client_test.pcap


DEST:
sudo tcpdump -i any host 100.81.53.245 and port 30013 -nn -vv -s 0 -w hana30013.pcap


HOW TO READ: 
tcpdump -nn -r capture.pcap | less

| 字段/符号       | 含义                   |
| ----------- | -------------------- |
| Flags \[S]  | SYN，同步请求，开始连接        |
| Flags \[S.] | SYN+ACK，确认连接请求       |
| Flags \[.]  | ACK，确认               |
| Flags \[F.] | FIN+ACK，连接断开请求       |
| Flags \[R.] | RST+ACK，复位连接，拒绝连接或异常 |
