
:::tip[Architecture]

Designing a high availability kubernetes cluster that can tolerate a zone outrage from both control plane and data plane is no trivial task.

https://gardener.cloud/docs/guides/high-availability/best-practices/
:::


### Aspects of designing a high available productive kubernetes cluster

Control Plan
- Shoot Control Plane 
    - [Failure tolerance](https://gardener.cloud/docs/guides/high-availability/control-plane/#failure-tolerance-types) of `zone` or `node`.  Spec Codes Please Refer [This](https://gardener.cloud/docs/guides/high-availability/control-plane/#shoot-spec)

- High available workload 
- 


Design Principle
- Quorum  奇数节点更高效且资源利用率更高, Quorum是维持集群可用所需的最小节点数，计算公式为 ⌈n/2⌉ + 1（n为总节点数）
- Work node must be odd number starting from 3. (why? for control plane ??)


control plan / data plane connection 

region latency | az awareness ? 

Public Cloud Services opportunity

API automation ?. 


- Design a low latency kubernetes architecture （Control Plane的位置和地区考量）

K8S Control Plane 的latency 可能会对 K8S Data Plane的影响

cc02v011705	Used for VLAB CVS (CI) -CAM 2.0
cc02v011706	Used for VLAB CVS (CS) -CAM 2.0
cc02v011704	Used for VLAB CVS (DB) -CAM 2.0

wget http://repo:50000/repo/CC+1/i577081/SP6_RT_Checker_TLO.sh --output-document=/tmp/SP6_RT_Checker_TLO.sh && && bash /tmp/SP6_RT_Checker_TLO.sh && rm /tmp/SP6_RT_Checker_TLO.sh

Control plane Stability: 查看api-server stability 尤其是使用了openstack-designate 