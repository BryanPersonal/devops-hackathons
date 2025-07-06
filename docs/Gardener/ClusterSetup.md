

   nodes: <subnet for worker node (see below)>
   pods: 100.104.0.0/18
   services: 100.104.64.0/18

- POD and SVC's CIDR can't be overlapped, otherwise it cause route collision and kube-proxy/Network CNI run abnormally
- Different cluster can have same POD&SVC CIDR as they virtual network within cluster . __Node CIDR__ is critical as multiple can connected to each other over BGPVPN in openstack which can't be overlapped per Openstack network design.
- 