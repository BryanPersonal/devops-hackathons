

Hi,
Old problem new evidence gathered :)

During my last upgrade from sp6 to sp7, on reboot of one of the HANA DB servers, the server was “hanging” quite a lot of time on the screen:
Screenshot 2026-02-16 at 5.37.45.png
With usual error above for unmounting some file systems.

As discussed with Alex Ringe, and coordinated with the LoB, I was able to extract some more DEBUG logs, where we hope to find out where, the problem might be.

```
Commands executed: (As advised by Suse and Alex R):
 Before reboot/shotdown:
systemd-analyze log-level debug
systemd-analyze log-target kmsg
mkdir -p /run/initramfs/etc/cmdline.d
echo "rd.debug rd.break=shutdown" > /run/initramfs/etc/cmdline.d/debug.conf
touch /run/initramfs/.need_shutdown

This will drop you to emergency shell, where this commands needs to be executed:

mkdir -p /mnt/efi
mount /dev/sda1 /mnt/efi
cp over the rdsosreport from /run/initramfs
- Save the ring buffer: dmesg > /mnt/efi/dmesg.out
umount /mnt/efi
```

Exit from the debug shell

After the reboot collect the files which should be in /boot/efi/

Today I was able to work on this to DBs2 and 1 APP witch happened to have this symptoms.
Attaching the archive.

Since this week I’m planned to do upgrade on secveral more DBs (which usually hangs), I will later more dogs, which we/suse could investigate
