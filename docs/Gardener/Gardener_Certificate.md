
- Default domain's certificates can be requested via 3 resources type in Gardener. Follow [Issue a certificate](https://gardener.cloud/docs/extensions/others/gardener-extension-shoot-cert-service/request_default_domain_cert/#issue-a-certificate)
- Default domain's Wildcard certificates is being supported from [request-a-wildcard-certificate](https://gardener.cloud/docs/extensions/others/gardener-extension-shoot-cert-service/request_default_domain_cert/#request-a-wildcard-certificate)


- https://pages.github.tools.sap/kubernetes/gardener/docs/guides/sap-internal/networking-lb/managed-certs-from-sap-ca/#overview
- [Configure a Custom Certificate Issuer](https://pages.github.tools.sap/kubernetes/gardener/docs/guides/sap-internal/networking-lb/managed-certs-from-sap-ca/#configure-a-custom-certificate-issuer)  - not in use so far
- https://github.com/gardener/gardener-extension-shoot-cert-service
- https://github.com/gardener/cert-management

__ONLY TWO scenarios for Gardener Certificate Extensions__:
- [manage-certificates-with-gardener-for-default-domain](https://gardener.cloud/docs/guides/networking/certificate-extension-default-domain/#manage-certificates-with-gardener-for-default-domain)
- [manage-certificates-with-gardener-for-public-domain](https://pages.github.tools.sap/kubernetes/gardener/docs/guides/networking/certificate-extension/#manage-certificates-with-gardener-for-public-domain) but you must follow the [prerequisite](https://pages.github.tools.sap/kubernetes/gardener/docs/guides/sap-internal/networking-lb/managed-certs-from-sap-ca/#prerequisites)

__! Procedure of certificate management for public domain__:
- Generate domain's certificate and key - testsecret-tls | certificate requested by `kind: certificate` ???
- [using-a-custom-issuer-with-an-ingress](https://pages.github.tools.sap/kubernetes/gardener/docs/guides/sap-internal/networking-lb/managed-certs-from-sap-ca/#using-a-custom-issuer-with-an-ingress) or requesting-a-certificate-for-a-service-type-loadbalancer


__Gardener Certificates Extension Feature__:
- [Supported annotations](https://pages.github.tools.sap/kubernetes/gardener/docs/guides/networking/certificate-extension/#supported-attributes)
- 

:::danger Known Cert Limitations
:::
- CN name comply with 64 character limits 
- Wildcard requests are not supported as of now by the Vendor, according to [SAPNETCAG2+ACME+Guide](https://wiki.one.int.sap/wiki/display/PKI/SAPNETCAG2+ACME+Guide). 



YOU also need to know about ACME:
a. The server needs to be able to reach the API endpoint on port 443. For Converge Cloud : acme.pki.net.sap

__Question????__

As stated before, cert-manager uses the ACME challenge protocol to authenticate that you are the DNS owner for the domain’s certificate you are requesting. This works by creating a DNS TXT record in your DNS provider under _acme-challenge.example.example.com containing a token to compare with. The TXT record is only visible during the domain validation. Typically, the record is propagated within a few minutes. But if the record is not visible to the ACME server for any reasons, the certificate request is retried again after several minutes. This means you may have to wait up to one hour after the propagation problem has been resolved before the certificate request is retried. Take a look in the events with kubectl describe ingress example for troubleshooting


Manifest of using a custom Issuer with an Ingress:
```
# ingress-example.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-example-ingress
  annotations:
    # Annotation to let Gardener now that it should manage the certificates for this Ingress
    cert.gardener.cloud/purpose: managed
    # Indicating cert-manager to use the custom issuer
    cert.gardener.cloud/issuer: sapca
    # Optional but recommended, this is going to create the DNS entry at the same time
    dns.gardener.cloud/class: garden
    dns.gardener.cloud/ttl: "600"
spec:
  tls:
    - hosts:
        - "web-081.in.sidevops.c.eu-de-1.cloud.sap"
      # Certificate and private key reside in this secret.
      secretName: testsecret-tls
  rules:
    - host: "web-081.in.sidevops.c.eu-de-1.cloud.sap"
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: nginx-service
                port:
                  number: 80

```