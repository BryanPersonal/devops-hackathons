### Ansible Env setup procedure
1. Over docker-compose env 

2. AWX Manage code with Git To-do: what else advantage of running with AWX console ?? 

3. Locally install python environment 
```
#!/bin/bash
ansible-playbook roles.yml --extra-vars 'debug=true setup_style="SAAS"'

1.	zypper install python39
2.	#make sure the python3 on your VM is pointing to python3.9 not python3.6
3.	mkdir -p /data/venv
4.	python3.9 -m venv /data/venv
5.	source /data/venv/bin/activate
6.	pip3 install -r requirements.txt
 
Usage:
When you saw there’s “(venv)” ahead of your command prompt, you entered the ansible test environment

Setting up. 
```
mkdir tests

```jsx title="local exeuction codes"
cat << EOF > tests/quick_test.yml
---
- name: Quick test for sni_dns_role
  hosts: localhost
  connection: local
  become: yes
  become: true
  vars:
    # 覆盖你的角色变量（根据 vars/main.yml 或 defaults/main.yml 调整）
    vip_suffix: "-cicd"
    required_var1: "test_value"
    ansibleheader: "#ansibleheader"
    ansiblefooter: "#ansiblefooter"
    sni_dnsapi_attributes:
      hiddenmaster:
        fsmount:
          dnsapi:
            device: 100.70.222.70:/share_6a40942a_f737_4152_a9ab_3eb35e8a8b66
          named:
            device: 100.70.222.70:/share_6a40942a_f737_4152_a9ab_3eb35e8a8b66
    required_var2: "/tmp/dummy_path"
    setup_hm01: true
  tasks:
    - name: Include role
      include_role:
        name: sni_dns_role
EOF

```


a.	deactivate
You will quit from the ansible test environment

```
ansible-lint  -- it can check syntax of the ansible playbook
ansible-playbook – it can test run the ansible role
```


requirements.txt
```
ansible==8.7.0
ansible-compat==24.6.1
ansible-core==2.15.12
ansible-lint==6.22.2
attrs==23.2.0
black==24.4.2
bracex==2.4
cffi==1.16.0
click==8.1.7
cryptography==42.0.8
filelock==3.15.4
importlib-resources==5.0.7
Jinja2==3.1.4
jsonschema==4.22.0
jsonschema-specifications==2023.12.1
markdown-it-py==3.0.0
MarkupSafe==2.1.5
mdurl==0.1.2
mypy-extensions==1.0.0
packaging==24.1
pathspec==0.12.1
platformdirs==4.2.2
pycparser==2.22
Pygments==2.18.0
PyYAML==6.0.1
referencing==0.35.1
resolvelib==1.0.1
rich==13.7.1
rpds-py==0.18.1
ruamel.yaml==0.18.6
ruamel.yaml.clib==0.2.8
subprocess-tee==0.4.2
tomli==2.0.1
typing_extensions==4.12.2
wcmatch==8.5.2
yamllint==1.35.1
```