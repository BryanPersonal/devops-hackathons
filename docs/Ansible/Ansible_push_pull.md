


```

time ansible-pull -i /tmp/inventory_localhost -U file:///tmp/sni_poc_cispatching_playbook -C install neocreatevm.yml | tee /var/log/vm_install_`date +%Y%m%d%H%M`.log
```



```
/usr/bin/ansible-pull \
  -U https://user:token@github.tools.sap/sni-ansible-playbooks/sni_cispatching_playbook.git \
  -d /tmp/ansible-pull-workdir \
  -i localhost \
  -C dev neopatching.yml
```


Infrastructure setup inventory for bootstraping a VM with `ansible-pull` method.
```





NEO Create VM
```
---
- name: "NEO Create VM play"
  hosts: all
  gather_facts: false
  vars:
    install: false
    setup: true
  tasks:
  # To be extended with additional tags

    - name: "Gather facts about virtualization"
      ansible.builtin.setup:
        gather_subset: virtual
      tags: [always, prepare, full, minimal, basicvm]

    # RK: custom CQA processing
    - name: Custom CQA processing
      block:
        - name: Read the local CQA file
          ansible.builtin.slurp:
            src: /tmp/cqa.out
          register: _cqa_main

        - name: Read the additional role params file
          ansible.builtin.slurp:
            src: /tmp/cqa_landscapes_AnsibleAdditionalRoleParams.out
          register: _cqa_ansaddroleparam

        - name: Combine into platocqa
          ansible.builtin.set_fact:
            platocqa: "{{ (_cqa_main['content'] | b64decode | from_json)['VirtualMachine'][inventory_hostname] | ansible.builtin.combine(({\"pool.resourcePools.landscapes.AnsibleAdditionalRoleParams\": {\"String\":[_cqa_ansaddroleparam['content'] | b64decode | from_json ]}}), recursive=True) }}"

        - name: Fix last bits of platocqa
          ansible.builtin.set_fact:
            platocqa: "{{ platocqa | ansible.builtin.combine({\"pool.AnsibleAdditionalRoleParam\": platocqa['pool.AnsibleAdditionalRoleParam_json'] | default({}) }, {\"tags\": platocqa['tags_json'] | default('')}, recursive=True) }}"

    - name: "Prepare GMP parameters"
      ansible.builtin.include_role:
        name: sni_gmp_attributes_role
        apply:
          tags: [prepare, full, minimal, basicvm]
      tags: [always, prepare, full, minimal, basicvm]

    - name: "Include sni_network_role"
      ansible.builtin.include_role:
        name: sni_network_role
        apply:
          tags: [full, basicvm]
      tags: [full, basicvm]

    - name: "Include sni_resolver_role"
      ansible.builtin.include_role:
        name: sni_resolver_role
        apply:
          tags: [full, minimal, basicvm]
      tags: [full, minimal, basicvm]

    - name: "Include sni_zypper_role"
      ansible.builtin.include_role:
        name: sni_zypper_role
        apply:
          tags: [full, minimal, basicvm]
      tags: [full, minimal, basicvm]

    - name: "Include sni_chrony_role"
      ansible.builtin.include_role:
        name: sni_chrony_role
        apply:
          tags: [full, basicvm]
      tags: [full, basicvm]

    - name: "Include sni_packages_role"
      ansible.builtin.include_role:
        name: sni_packages_role
        apply:
          tags: [full, basicvm]
      vars:
        install: true
      tags: [full, basicvm]

    - name: "Include sni_sssd_role"
      ansible.builtin.include_role:
        name: sni_sssd_role
        apply:
          tags: [full, minimal, basicvm]
      vars:
        setup_sssd: true
        setup_pam: true
        setup_nsswitch: true
      tags: [full, minimal, basicvm]

    - name: "Include sni_dns_caching_role"
      ansible.builtin.include_role:
        name: sni_dns_caching_role
        apply:
          tags: [full, basicvm]
      tags: [full, basicvm]

    - name: "Include sni_hardening_role"
      ansible.builtin.include_role:
        name: sni_hardening_role
        apply:
          tags: [full, minimal, basicvm]
      tags: [full, minimal, basicvm]

    - name: "Include sni_ssh_role"
      ansible.builtin.include_role:
        name: sni_ssh_role
        apply:
          tags: [full, minimal, basicvm]
      tags: [full, minimal, basicvm]

    - name: "Include sni_profile_role"
      ansible.builtin.include_role:
        name: sni_profile_role
        apply:
          tags: [full, basicvm]
      tags: [full, basicvm]

    - name: "Include sni_mta_role"
      ansible.builtin.include_role:
        name: sni_mta_role
        apply:
          tags: [full, basicvm]
      tags: [full, basicvm]

    - name: "Include sni_fsmounts_role"
      ansible.builtin.include_role:
        name: sni_fsmounts_role
        apply:
          tags: [full, basicvm]
      tags: [full, basicvm]

    - name: "Include sni_log_role"
      ansible.builtin.include_role:
        name: sni_log_role
        apply:
          tags: [full, basicvm]
      tags: [full, basicvm]

    - name: "Include sni_prometheus_role"
      ansible.builtin.include_role:
        name: sni_prometheus_role
        apply:
          tags: [full]
      tags: [full]

    - name: "Include sni_systemd_role"
      ansible.builtin.include_role:
        name: sni_systemd_role
        apply:
          tags: [full]
      tags: [full]

    # - name: "Include sni_trendmicro_role"
    #   ansible.builtin.include_role:
    #     name: sni_trendmicro_role
    #     apply:
    #       tags: [full, basicvm]
    #   vars:
    #     install: true
    #   tags: [full, basicvm]

    - name: "Include sni_monitoring_role"
      ansible.builtin.include_role:
        name: sni_monitoring_role
        apply:
          tags: [full]
      tags: [full]

    - name: "Include sni_localuser_role"
      ansible.builtin.include_role:
        name: sni_localuser_role
        apply:
          tags: [full, minimal, basicvm]
      tags: [full, minimal, basicvm]

    - name: "Include sni_basic_vm_setup_role"
      ansible.builtin.include_role:
        name: sni_basic_vm_setup_role
        apply:
          tags: [full, basicvm]
      tags: [full, basicvm]

    - name: "Include sni_saphostagent_role"
      ansible.builtin.include_role:
        name: sni_saphostagent_role
        apply:
          tags: [full]
      tags: [full]

    - name: "Include sni_kernel_parameters_role"
      ansible.builtin.include_role:
        name: sni_kernel_parameters_role
        apply:
          tags: [full]
      vars:
        install: true
      tags: [full]

    # - name: "Include sni_sapjvm_role"
    #   ansible.builtin.include_role:
    #     name: sni_sapjvm_role
    #     apply:
    #       tags: [full]
    #   vars:
    #     install: true
    #   tags: [full]

    # - name: "Include sni_customize_role"
    #   ansible.builtin.include_role:
    #     name: sni_customize_role
    #     apply:
    #       tags: [full]
    #   vars:
    #     install: true
    #   tags: [full]

    - name: "Log variables used during VM creation under /var/log/ansiblevars.log"
      ansible.builtin.copy:
        content: "{{ vars | to_nice_yaml }}"
        dest: /var/log/ansiblevars.log
        mode: '0644'
        owner: root
        group: root
      tags: [debugvars]

```