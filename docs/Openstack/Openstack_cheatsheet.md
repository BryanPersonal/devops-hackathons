


1. os port list --fixed-ip subnet=cis-clmam-eu-de-2-tools-private-01-01 | grep -c ip_address
2. openstack network list --long | --external
3. 

```
I577081 @ eu-de-1 > cis > clmam-eu-de-1-prod > openstack server list --format value --column Name --column Flavor |grep hana | sort -k2

cc01v008556 hana_c192_m2917
cc01v008750 hana_c192_m2917
cc01v011451 hana_c192_m2917
cc01v011743 hana_c192_m2917
```


// Glance /Image one-one match 
```
echo "Object,UUID,ImageName,Status"
for obj in $(swift list | grep '^glance_'); do
  uuid=${obj#glance_}
  image=$(openstack image show $uuid -f value -c name 2>/dev/null)
  if [ -n "$image" ]; then
    echo "$obj,$uuid,$image"
  else
    echo "$obj,$uuid,NOT_FOUND"
  fi
done

```



```
openstack security group show default_SG_clmam-eu-de-2-vlab | grep '10.180.12.0'

```

#### Ceph

```
pip install swift (under venv)

swift --os-service-type object-store-ceph upload 3rd-party-package-maintenance ./filebeat-9.0.2-x86_64.rpm --object-name repo/3rdparty/SI-DevOps/testing/SLES15/manual/filebeat-9.0.2-x86_64.rpm
Warning: failed to create container '3rd-party-package-maintenance': 409 Conflict: BucketAlreadyExists
repo/3rdparty/SI-DevOps/testing/SLES15/manual/filebeat-9.0.2-x86_64.rpm
```

#### openstack neutron port operations

```
#
openstack server list -f csv --status ERROR --quote none -c ID -c Name -c Status 

# List network
openstack network list 

# List all the port
openstack port list

# To target the problem, you will have to find out the UUID of the Fixed IP from converged cloud.  -> list down from it's private network. 

openstack port show 8f35fbe5-387c-4787-96d9-3c09b7b909a

# Change dns-name 
openstack port set --dns-name initvm 8f35fbe5-387c-4787-96d9-3c09b7b909a7

# List user's permission
openstack group/user list / openstack group/user show

# Create Openstack application credential / zypper in python3-openstackclient / source download openrc file 

openstack application    create <CredentialName> <roles> | --role compute_admin --role sharedfilesystem_admin --role registry_admin --role securitygroup_admin --role network_admin --role image_admin --role volume_admin


# check Openstack session persistence 
neutron lbaas-pool-show fe70e906-c81c-4b68-a365-1785c0211e20  //ps. neutron CLI will be deprecated

openstack loadbalancer pool show 77c347bc-be33-4bbf-86e9-df61f26c2072 -f json |jq '.session_persistence'
"type=SOURCE_IP\ncookie_name=None\npersistence_timeout=None\npersistence_granularity=None"

// unset load balancer session-persistence
openstack loadbalancer pool unset --session-persistence 4f82382c-cd42-45fd-b541-2b5bf03fcd6e

// set load balancer session-persistence back
openstack loadbalancer pool set --session-persistence=  "type=SOURCE_IP" 4f82382c-cd42-45fd-b541-2b5bf03fcd6e

// list EC2 credential
//https://documentation.global.cloud.sap/docs/customer/storage/object-storage/api-and-cli-4/objectstore-features-s3api/
openstack ec2 credential list 

// list project - in case object storage has an ACL
openstack project list
openstack user list
// 

openstack bgpvpn list
openstack router list -c ID -c Name -c Project
```

```
// check share status/state

I577081 @ na-us-2 > neo > neo-na-us-2-factoryus4-st-b01 > openstack share list --name ec2volume80816 -f json 
[
  {
    "ID": "ae225fe5-13cc-47e5-bf60-603a9dcb2452",
    "Name": "ec2volume80816",
    "Size": 2500,
    "Share Proto": "NFS",
    "Status": "available",
    "Is Public": false,
    "Share Type Name": "default",
    "Host": "",
    "Availability Zone": "na-us-2b"
  }
]
I577081 @ na-us-2 > neo > neo-na-us-2-factoryus4-st-b01 > openstack share set --help
usage: openstack share set [-h] [--property <key=value>] [--name <name>] [--description <description>] [--public <public>] [--status <status>] <share>

Set share properties

positional arguments:
  <share>       Share to modify (name or ID)

options:
  -h, --help            show this help message and exit
  --property <key=value>
                        Set a property to this share (repeat option to set multiple properties)
  --name <name>
                        New share name. (Default=None)
  --description <description>
                        New share description. (Default=None)
  --public <public>
                        Level of visibility for share. Defines whether other tenants are able to see it or not.
  --status <status>
                        Explicitly update the status of a share (Admin only). Examples include: available, error, creating, deleting, error_deleting.

```