AdmissionController 
https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/

Admission Control（准入控制） 是 API Server 在“接收并持久化资源之前”的最后一道关卡。


Intercept the request at different stages. 
1. Mutating Admission Webhook 
2. Validating Admission Webhook