
https://mermaid.ai/docs/mermaid-oss/syntax/gantt.html#section-statements

https://mermaid.ai/app/projects/6add848a-d7a6-4115-aa30-ac1cce6de894/diagrams/4ef50062-5378-4308-ba33-f45f36581a47/version/v0.1/edit 

```mermaid
---
config:
  theme: forest
  themeVariables: {}
---
gantt
    title       SPC Runtime Handover, Cutover & Go-live Roadmap
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d
    excludes    weekends
    section Governance
    Weekly GLDS & SNI Forum : active, g1, 2025-02-02, 2025-05-01
    section KT/Handover
    Handover sessions : active, b1, 2025-02-05, 2025-04-15
    section Stateless Migration
    Ansible code migration :  t1, 2025-03-01, 2025-04-01
    MISC Automation migration : t2, 2025-03-01, 2025-04-01
    section Cutover Activities
    Ansible GLDS Cutover : crit, c1,  2025-04-01, 2025-05-01
    TTU Access : crit, c2, 2025-04-15, 2025-05-01
    CCIR Change : crit, c3, 2025-04-15, 2025-05-01
    ServiceNow Alerts : crit, c4, 2025-04-15, 2025-05-01
    section Go-live & Support
    Go-live : milestone, m1, 2025-05-01, 0d
    Shadow support (1 month) : active, s1, after m1, 30d
```