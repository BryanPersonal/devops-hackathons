

在Kubernetes中 选用的是运行在Openstack 上的Gardener K8S 集群， 
我希望设计基于bind dns hiddenmaster 提供一个endpoint 给某个用户进行nsupdate 更新zone的数据。  
在设计k8s 程序的时候，需要解决几个重要的问题
1. 在客户写入数据时数据持久话存储 
2. 数据只又一个pod 上的bind 写入
3. 高并发写入的健康写入或处理