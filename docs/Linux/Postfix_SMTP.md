

Concept:
- Mail Relay Server:  SMTP 中继（SMTP Relay）是一种专门用于接收并转发电子邮件的服务器。它的核心作用是：作为“中间人”，帮助其他服务器或应用程序将邮件安全、可靠地投递到目标收件人邮箱，而无需自己直接连接到外部邮件服务器（如 Gmail、Outlook、企业邮箱等）
- 



```
if you use the local postfix, the mails will be forwarded to our CIS MTA and will be processed further to the ppp internal mail gateway mail.ppp.corp.

But mind, only these recipient domains are forwarded:
/.*@od.ppp.biz/ relay:mail.ppp.corp:587
/.*@.*od.ppp.biz/ relay:mail.ppp.corp:587
/.*@.*cloud.ppp/ relay:mail.ppp.corp:587
/.*@global.corp.ppp/ relay:mail.ppp.corp:587
/.*@.*ppp.com/ relay:mail.ppp.corp:587

Everything else, especially external addresses, will not processed.

smtpdem01.smtp.ppp-ag.de, you mentioned in the initial comment while raising this INC, is from this perspective treated as an external domain, hence it will NOT be relayed and is discarded by our MTA.

The attached screenshot (https://itsm.services.ppp/sys_attachment.do?view=true&sys_id=859a979c2f657a9c56b1692cbfa4e3d5) is all about external for what we are not responsible. These addresses are out of our scope.

For external recipients, pls use another mail gateway and NOT the local MTA. I´d refer to https://internet.ppp.corp/services/smtp/description/#relays --> Zone 5 (outside of ppp's networks).
```

What is local MTA ? 
