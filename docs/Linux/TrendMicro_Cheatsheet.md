


```
ACL is required for newly build-up landscape to connect AV proxy (Presumbly from FIP to TrendMicro AV Proxy). 

# Self-healing. (baseline some static file has been dropped by Ansible from VM)
/opt/imal/bin/dsupdstat.sh

# Policy has been updated from remote side without client change. 
(vadb02nza) cc02v019827:~ # /opt/ds_agent/sendCommand --get GetConfiguration | grep "SecurityProfile"
 <SecurityProfile id='2689' name='$$#84aa#$$_$$%GCS-TM-VISION1%$$CLMAM_Linux_IPS_TEST'>
 </SecurityProfile>
 ```

