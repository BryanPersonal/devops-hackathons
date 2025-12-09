
1. `zypper se -i --requires` 反向查找依赖 i.e. `zypper se --requires libpng.so.16`
2.  `zypper info --requires perl-XML-Simple` 查看包所需依赖

```
(vawd11wpe) cc01v008254:~ #
#  zypper info --requires perl-XML-Simple
Loading repository data...
Reading installed packages...


Information for package perl-XML-Simple:
----------------------------------------
Repository     : SLE-Module-Basesystem-product
Name           : perl-XML-Simple
Version        : 2.24-1.22
Arch           : noarch
Vendor         : SUSE LLC <https://www.suse.com/>
Support Level  : Level 3
Installed Size : 175.7 KiB
Installed      : Yes
Status         : up-to-date
Source package : perl-XML-Simple-2.24-1.22.src
Upstream URL   : http://search.cpan.org/dist/XML-Simple/
Summary        : An API for simple XML files
Description    :
    The XML::Simple module provides a simple API layer on top of an underlying
    XML parsing module (either XML::Parser or one of the SAX2 parser modules).
    Two functions are exported: 'XMLin()' and 'XMLout()'. Note: you can
    explicitly request the lower case versions of the function names:
    'xml_in()' and 'xml_out()'.

    The simplest approach is to call these two functions directly, but an
    optional object oriented interface (see "OPTIONAL OO INTERFACE" below)
    allows them to be called as methods of an *XML::Simple* object. The object
    interface can also be used at either end of a SAX pipeline.
Requires       : [4]
    perl(:MODULE_COMPAT_5.26.1)
    perl(XML::SAX::Expat)
    perl(XML::NamespaceSupport) >= 1.04
    perl(XML::SAX) >= 0.15
```


```
 // down pkg only with different version and compare difference
 zypper install --oldpackage --download-only 'perl-Bootloader=0.945-150400.3.9.1'
 zypper install --download-only 'perl-Bootloader=0.947-150400.3.12.1'
 rpm2cpio <package.rpm> | cpio -idmv
 diff -Naur
```


```

 // down pkg only with different version and compare difference
 zypper install --oldpackage --download-only 'perl-Bootloader=0.945-150400.3.9.1'
 zypper install --download-only 'perl-Bootloader=0.947-150400.3.12.1'
 rpm2cpio <package.rpm> | cpio -idmv
 diff -Naur

# List patch/CVE info 
zypper lp -a --cve=CVE-2023-38546

# 
zypper patch-info  SUSE-SLE-SDK-12-SP5-2023-4043


# they will be cached in /var/cache/zypp/packages per MAN page.
zypper install --oldpackage --download-only 'perl-Bootloader=0.945-150400.3.9.1'

# 有没有rpm-md 的区别是什么
zypper ar -fgt rpm-md http://repo:50000/repo/obs/SI-DevOps:/CIS:/Testing/SLES12 SI-DevOps:CIS:testing  

// one time installation
zypper in http://repo:50000/repo/obs/ppp-Cloud:/PublicCloud/SLES15/x86_64/lsyncd-2.3.1-4.1.ppp.x86_64.rpm


// 列出所有 已安装 的软件包中，哪些包的元数据中声明了 Requires: vim-data（即运行时依赖 vim-data
i577081@cc02v003788:/tmp> zypper se -i --requires vim-data
Loading repository data...
Reading installed packages...

S  | Name     | Summary                                          | Type
---+----------+--------------------------------------------------+--------
i+ | vim      | Vi IMproved                                      | package
i+ | vim-data | Data files needed for extended vim functionality | package

// 查 vim-data 被哪些包 提供（如替代包），用 zypper what-provides vim-data。



// after patching, validate what are (deleted) files still being used by running process 
zypper ps -sss
// check if reboot is required
zypper needs-rebooting    ///etc/zypp/needreboot

Our current process is 
1. Change frozenRepo 2. zypper ref 3. zypper list-patches –cve 

zypper --non-interactive rm kernel-default-4.12.14-122.212.1


```