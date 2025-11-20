

Issue description: 


FIX: emergency change number:  CHG2745942

```
TLSCACertificateFile /etc/openldap/CA.crt
TLSCertificateFile /etc/openldap/ldapmaster.cis-factory.gmp.ap-cn-1.cloud.sap.crt
TLSCertificateKeyFile /etc/openldap/ldapmaster.cis-factory.gmp.ap-cn-1.cloud.sap.key
TLSCipherSuite HIGH
TLSProtocolMin 3.3
```

CLI

```
// Check slapd certificate validatiy
openssl x509 -in $(awk '/TLSCertificateFile/ {print $NF}' /etc/openldap/slapd.conf) -noout -text -enddate | grep -i "notAfter\|Subject:"
openssl x509 -in $(awk '/TLSCACertificateFile/ {print $NF}' /etc/openldap/slapd.conf) -noout -text -enddate | grep -i "notAfter\|Subject:"

```

Other worknodes: 
```
#  rpm -ql sap-global-cacerts
/etc/pki/trust/anchors/SAPNetCA_G2.crl
 // checking -- openssl crl -in SAPNetCA_G2.crl -text -noout

/etc/pki/trust/anchors/SAPNetCA_G2.pem
/etc/pki/trust/anchors/SAP_Global_Root_CA.crl
/etc/pki/trust/anchors/SAP_Global_Root_CA.pem
```

What are the root or intermediate certificate usually installed on server ? And how could we monitor ? 

Wiki reference:
https://wiki.one.int.sap/wiki/display/PKI/SAP+Global+PKI   
https://wiki.one.int.sap/wiki/display/PKI/SAP+PKI's+Trust+Chain



Helper script to check CA bundle certificates

```
#!/bin/bash

file="filename.crt"
awk 'BEGIN {c=0;} /-----BEGIN CERTIFICATE-----/ {if (c>0) close("cert" c ".crt"); c++;} {print > "cert" c ".crt"}' "$file"

for cert in cert*.crt; do
    echo "Viewing $cert"
    openssl x509 -in "$cert" -text -noout
    echo ""
done

# 删除临时证书文件
# rm cert*.crt


```


Knowledge collection:

```
.crl 代表证书吊销列表（Certificate Revocation List），是一种由证书颁发机构 (CA) 发布的文件，其中包含已被吊销但尚未过期的证书的列表。CRL 文件的主要用途是帮助客户端确定某个证书是否被吊销。

特点：
内容：包含被吊销的证书的序列号和吊销日期。
目的：用于验证证书是否被吊销。
发布：定期由 CA 发布和更新。

.crt 代表证书（Certificate），是用来证明公钥持有者的身份的数字文档。证书由 CA 签发，并包含公钥、持有者信息、颁发者信息、有效期等。

特点：
内容：包含公钥、持有者信息、CA 的签名等。
目的：用于加密通信和身份验证。
类型：通常为 X.509 格式，可以是 PEM 编码或 DER 编码。

1. 证书文件
.pem 文件可以存储 X.509 证书。这些证书用于在网络通信中验证服务器或客户端的身份。

作用：
验证服务器身份：例如，浏览器使用服务器的 .pem 证书来验证连接的服务器是否可信。
验证客户端身份：服务器可以使用客户端的 .pem 证书来验证连接的客户端是否可信。
2. 私钥文件
.pem 文件也可以存储私钥。这些私钥用于解密通过公钥加密的消息或创建数字签名。

作用：
解密：例如，服务器使用其私钥解密客户端发送的消息。
签名：例如，服务器使用其私钥对数据进行签名，以确保数据的完整性和真实性。
3. 证书请求文件
.pem 文件可以存储证书签名请求 (Certificate Signing Request, CSR)。CSR 是请求证书颁发机构 (CA) 签署并颁发证书的文件。

作用：
申请证书：CSR 文件包含申请者的公钥和身份信息，提交给 CA 以获取证书。

```