

Landscape slave
- With SOA relay pod, it dynatically probe the service endpoint of landscape slave service with 10-30s interval and get all of pods sychronzied which addressed the usual pain points of stateful application.  
Then why still with stateful not stateless design ? It is about restoration cost or upgrade cost. Imagine there are bind data with 500MB. Bind take 3 mins to sync and load all data (TO-DO: evaluation). How long will it take to upgrade one pod ?? Probably 10 mins ??  


Roadmap:
- 
- Check again SNI containerisation guide and SGS Security HardeningContainerOrchestration (https://wiki.one.int.sap/wiki/spaces/itsec/pages/1885283112/Kubernetes+Container+Orchestration+-+Security+Hardening#KubernetesContainerOrchestrationSecurityHardening-1.30NetworkPolicies,CNIandWorkloadSegregation)
- Trendmicro Scan
-
