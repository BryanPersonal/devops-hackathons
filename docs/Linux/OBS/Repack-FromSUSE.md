


:heavy_exclamation_mark: Gone through existing SPEC before writting in hands from scratch
https://download.opensuse.org/repositories/home:/tbadm/openSUSE_Leap_15.6/src/
https://obs.cia.net.ppp/package/show/home:i541603/bind_exporter


```
zypper in rpm-build
# make a standard rpmbuild repository
mkdir -p {SPECS,SOURCES,RPMS,SRPMS,BUILD,BUILDROOT}

# Move those build related files inside
cp bind_exporter.spec SPECS/
cp bind_exporter-0.8.0.tar.gz SOURCES/
cp bind_exporter.service SOURCES/
rpmbuild -ba --define "_topdir $(pwd)" SPECS/bind_exporter.spec
```

```
cc01v012086:~/sidevops-bind-exporter # cat SPECS/bind_exporter.spec
#
# spec file for package bind_exporter
#
# Copyright (c) 2020 SUSE LLC
#
# All modifications and additions to the file contributed by third parties
# remain the property of their copyright owners, unless otherwise agreed
# upon. The license for this file, and modifications and additions to the
# file, is the same license as for the pristine package itself (unless the
# license for the pristine package is not an Open Source License, in which
# case the license is the MIT License). An "Open Source License" is a
# license that conforms to the Open Source Definition (Version 1.9)
# published by the Open Source Initiative.

# Please submit bugfixes or comments via https://bugs.opensuse.org/
#

%global prometheus_user prometheus
%global prometheus_group %{prometheus_user}

Name:           bind_exporter
# Version will be processed via set_version source service
Version:        0.8.0
Release:        0
Summary:        Prometheus exporter for bind_exporter
License:        Apache-2.0
Group:          System/Monitoring
URL:            https://github.com/prometheus-community/bind_exporter
Source:         %{name}-%{version}.tar.gz
Source1:        %{shortname}.service
ExclusiveArch:  aarch64 x86_64 ppc64le s390x
BuildRoot:      %{_tmppath}/%{name}-%{version}-build
#BuildRequires:  golang-packaging
BuildRequires:  golang(API) >= 1.15
Provides:       bind_exporter = %{version}-%{release}
Provides:       prometheus(ibind_exporter) = %{version}-%{release}
Requires(pre):  shadow

#%{go_nostrip}

%description
Prometheus exporter for BIND

%prep
%setup -q            # unpack project sources

%define shortname bind_exporter

%build

export CGO_ENABLED=0
go build -buildmode=pie -ldflags '-s -w -X main.version=0.8.0' -o bind_exporter
#go build -buildmode=pie -ldflags '-s -w -X main.version=0.8.0' -o bind_exportergo build -buildmode=pie \
##-mod=vendor \
#         -ldflags=\"-s -w -X main.version=%{version}\" \
#         -o %{shortname}
#
%install

# Install the binary.
install -d -m 0755 %{buildroot}%{_unitdir}
install -m 0644 %{SOURCE1} %{buildroot}%{_unitdir}
install -D -m 0755 -d %{buildroot}/usr/lib/systemd/system-preset
echo "enable %{shortname}.service" > %{buildroot}/usr/lib/systemd/system-preset/13-%{shortname}.preset
install -D -m 0755 %{shortname} "%{buildroot}%{_bindir}/%{shortname}"
install -d -m 0755 %{buildroot}%{_sbindir}
ln -s /usr/sbin/service %{buildroot}%{_sbindir}/rc%{shortname}

%pre
getent group %{prometheus_group} >/dev/null || %{_sbindir}/groupadd -r %{prometheus_group}
getent passwd %{prometheus_user} >/dev/null || %{_sbindir}/useradd -r -g %{prometheus_group} -d %{_localstatedir}/lib/prometheus -s /sbin/nologin %{prometheus_user}
%service_add_pre %{shortname}.service

%post
%service_add_post %{shortname}.service
systemctl start %{shortname}.service || :
# restart systemd service
%restart_on_update %{shortname}.service

%preun
%stop_on_removal   %{shortname}.service
%service_del_preun %{shortname}.service

%postun
%service_del_postun %{shortname}.service

%files
%defattr(-,root,root,-)
%doc README.md
%license LICENSE
%{_unitdir}/%{shortname}.service
%{_sbindir}/rc%{shortname}
%if 0%{?suse_version} >= 1500
%license LICENSE
%else
%doc LICENSE
%endif
%{_bindir}/%{shortname}
/usr/lib/systemd/system-preset
/usr/lib/systemd/system-preset/13-%{shortname}.preset

%changelog
```