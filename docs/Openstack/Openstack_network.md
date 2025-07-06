
#### Share an external Network to a project 

https://operations.global.cloud.sap/docs/support/playbook/neutron/add-external-network/

Manage Scenario 1: Add SI_DevOps_private_sandbox as __shared network__ to specific project

Catalog:
- Project ID: c9d437fac3dc4e56bab36a9df26fefe8
- SI_DevOps_private_sandbox Network ID: 4d14d9a8-ff1f-4cb3-9272-2151e9727fcd

```
openstack network rbac list
# You can navigate rbac policy ID from above command
| 54565f71-a824-49e1-9935-975e80a839f9 | network     | 4d14d9a8-ff1f-4cb3-9272-2151e9727fcd |

```


```
I577081 @ eu-nl-1 > monsoon3 > SI_DevOps > openstack network rbac create --target-project c9d437fac3dc4e56bab36a9df26fefe8 --action access_as_shared --type network 4d14d9a8-ff1f-4cb3-9272-2151e9727fcd
+-------------------+--------------------------------------+
| Field             | Value                                |
+-------------------+--------------------------------------+
| action            | access_as_shared                     |
| id                | b5296634-9077-4971-becc-5ddc1833c5f5 |   --> this is the rbac policy ID
| object_id         | 4d14d9a8-ff1f-4cb3-9272-2151e9727fcd |
| object_type       | network                              |
| project_id        | adde6fddf0f8457f9b796c337aaa5842     |
| target_project_id | c9d437fac3dc4e56bab36a9df26fefe8     |
+-------------------+--------------------------------------+
```


```
I577081 @ eu-nl-1 > monsoon3 > SI_DevOps > openstack network show 4d14d9a8-ff1f-4cb3-9272-2151e9727fcd
+---------------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Field                     | Value                                                                                                                                                                           |
+---------------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| admin_state_up            | UP                                                                                                                                                                              |
| availability_zone_hints   |                                                                                                                                                                                 |
| availability_zones        | eu-nl-1a, eu-nl-1b                                                                                                                                                              |
| created_at                | 2023-01-13T05:00:30Z                                                                                                                                                            |
| description               |                                                                                                                                                                                 |
| dns_domain                |                                                                                                                                                                                 |
| id                        | 4d14d9a8-ff1f-4cb3-9272-2151e9727fcd                                                                                                                                            |
| ipv4_address_scope        | None                                                                                                                                                                            |
| ipv6_address_scope        | None                                                                                                                                                                            |
| is_default                | None                                                                                                                                                                            |
| is_vlan_transparent       | None                                                                                                                                                                            |
| mtu                       | 8950                                                                                                                                                                            |
| name                      | SI_DevOps_private_sandbox                                                                                                                                                       |
| port_security_enabled     | False                                                                                                                                                                           |
| project_id                | adde6fddf0f8457f9b796c337aaa5842                                                                                                                                                |
| provider:network_type     | None                                                                                                                                                                            |
| provider:physical_network | None                                                                                                                                                                            |
| provider:segmentation_id  | None                                                                                                                                                                            |
| qos_policy_id             | None                                                                                                                                                                            |
| revision_number           | 6                                                                                                                                                                               |
| router:external           | Internal                                                                                                                                                                        |
| segments                  | [{'provider:network_type': 'vxlan', 'provider:physical_network': None, 'provider:segmentation_id': 10247}, {'provider:network_type': 'vlan', 'provider:physical_network':       |
|                           | 'ap010', 'provider:segmentation_id': 2791}, {'provider:network_type': 'vlan', 'provider:physical_network': 'np019-np020', 'provider:segmentation_id': 2441},                    |
|                           | {'provider:network_type': 'vlan', 'provider:physical_network': 'bb248', 'provider:segmentation_id': 2039}, {'provider:network_type': 'vlan', 'provider:physical_network':       |
|                           | 'ap009', 'provider:segmentation_id': 2723}, {'provider:network_type': 'vlan', 'provider:physical_network': 'bb247', 'provider:segmentation_id': 2255}]                          |
| shared                    | False                                                                                                                                                                           |
| status                    | ACTIVE                                                                                                                                                                          |
| subnets                   | fc35bff3-bc1c-4c63-a6a6-2738a52f056e                                                                                                                                            |
| tags                      | monsoon3::aci::tenant::cc-openstack-eu-nl-1-1                                                                                                                                   |
| updated_at                | 2023-04-19T02:16:34Z                                                                                                                                                            |
+---------------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

# network rbac cleanup
`openstack network rbac delete 54565f71-a824-49e1-9935-975e80a839f9`
```


#### Converged Cloud ASN 

Calculate: <REGION_ASN> * 65536 + 4
The route-target value generated from 4-byte dotted representation of region’s ASn by formula: (<REGION_ASN> * 65536 + 4):<UNIQUE_ID>. In this example 65130.4:2000 converted to 4268359684:2000
https://netbox.global.cloud.sap/ipam/asns/


#### RT<->CIS Conn, import/export targets check

```
I577081 @ eu-de-1 > cis > clmam-eu-de-1-tools > os bgpvpn show  fd159372-1911-4536-94a9-9d667a1490a5
+----------------------+------------------------------------------------------------------------------------------------------------------+
| Field                | Value                                                                                                            |
+----------------------+------------------------------------------------------------------------------------------------------------------+
| export_targets       | 4267048964:2000                                                                                                  |
| id                   | fd159372-1911-4536-94a9-9d667a1490a5                                                                             |
| import_targets       | 4267048964:2000                                                                                                  |
| local_pref           | None                                                                                                             |
| name                 | gmp-eu-de-1-cis-spc-tic                                                                                          |
| networks             |                                                                                                                  |
| ports                |                                                                                                                  |
| project_id           | 10c07a3be50043049f104e8cb4bb95c0                                                                                 |
| route_distinguishers |                                                                                                                  |
| route_targets        |                                                                                                                  |
| routers              | 24d1c7cc-0bec-492d-b0b2-3fae465be5df, 488c93e3-5c79-4533-9bd0-04c9af8f440b, 515bab05-d397-4350-b1f2-078dd3aa4738 |
| shared               | True                                                                                                             |
| type                 | l3                                                                                                               |
| vni                  | None                                                                                                             |
+----------------------+------------------------------------------------------------------------------------------------------------------+

Target values explanation/intruction: 
https://operations.global.cloud.sap/docs/operation/network/bgpvpn_troubleshooting/


```


#### CLMAM CIS BPGVPN Design 

From CIS BPGVPN gmp-eu-de-1-cis-spc-tic's Access Control. Add Policy "access as shared" to the following projects (as Target projects). 
Then the BGPVPN will present as the shared BGPVPN in those projects ??

Project ID: bf8e3ed5c8b04050bc166e5921c815b0  EUDE1 Tools
Project ID: d920405ed060493dacf0c221408e377b  EUDE1 Prod

From OADEV, you must add new project ID as target project ID also.


#### HOWTO: configure router to use external network
```
openstack router set --external-gateway <external network ID> <Shoot-router-ID> 

e.g. openstack router set --external-gateway ea58efde-05fd-449a-8e5c-4910ca27ef50 686dbec1-bddd-4d89-9edb-1380d2a47779 
```

##### Share bgpvpn 
`openstack network rbac create --type router --target-project <other-project-id> --action access_as_shared <router-id>`
