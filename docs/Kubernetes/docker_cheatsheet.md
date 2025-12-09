### Key concepts
- 多阶段构建 multi-stage build 


### docker storage related
```
#  Docker's image cache can become corrupted. You can try clearing the cache and then pulling the image again: 
docker system prune -a --volumes
可以用于清理磁盘，删除关闭的容器、无用的数据卷和网络，以及dangling镜像(即无tag的镜像)。

在 Docker 中，无 tag 的镜像通常被称为 "untagged" 或 "dangling" 镜像。这些镜像没有明确的标签，通常是因为它们是构建或拉取后未命名的中间镜像，或者是由于构建、拉取、推送等操作导致的一些中间状态。
这种类型的镜像通常具有 <none> 标签，表明它们没有具体的标签信息。这些镜像可能是构建多层镜像时的中间层，但它们在构建完成后没有被具体命名。


# To free spaces of /var/lib/overlay2
docker system prune --all --volumes
- 清理停止的容器：删除所有已停止的 Docker 容器。  docker ps -a --filter "status=exited"
- 清理未使用的镜像：删除所有未被任何容器使用的镜像。 docker images --filter "dangling=true"
- 清理未使用的网络：删除所有未被任何容器使用的网络。  docker network ls --filter "dangling=true"
- 清理未被挂载的数据卷：删除所有未被任何容器挂载的数据卷。  docker volume ls --filter "dangling=true"

docker system df -v 
命令可以进一步查看空间占用细节，以确定是哪个镜像、容器或本地卷占用过高空间

# basic login. Or with /bin/sh
docker exec -it ansible-control-node /bin/bash
```
#### 什么是docker overlay2 存储 
Overlay2 存储缓存是 Docker 使用 Overlay2 存储驱动时的一种机制，用于提高文件系统层的读取性能。当 Docker 使用 Overlay2 存储驱动时，它会在 `/var/lib/docker/overlay2/` 目录下创建缓存，以加速文件的访问。

Overlay2 存储驱动是一种联合文件系统，它允许将多个文件系统层叠在一起，形成一个单一的、可写的文件系统。这些文件系统层包括 Docker 镜像的只读层（lower layer）、容器的可写层（diff layer），以及其他可能的层。
	• LowerDir: these are the read-only layers of an overlay filesystem. ...
	• UpperDir: this is the read-write layer of an overlay filesystem. ...
	• WorkDir: this is a required directory for overlay, it needs an empty directory for internal use.
   • MergedDir: this is the result of the overlay filesystem.
   - diff： 容器的可写层。这是容器在运行时对文件系统所做的修改的地方，它覆盖了底层镜像的只读层，使得容器能够修改文件系统。
   - lower： 镜像的只读层。这是 Docker 镜像中包含的文件系统层，它是只读的，不会因为容器的运行而改变。
   - work： OverlayFS 内部使用的工作目录。这是 OverlayFS 在执行层叠操作时使用的临时目录。
   - merged： OverlayFS 的合并视图。这是容器和镜像所有层的联合视图，提供容器运行时所见的完整文件系统。

Overlay2 存储缓存的作用主要有两个方面：

1. **提高性能：** Overlay2 存储缓存通过将经常访问的文件和目录缓存在一个快速的位置，以加速对这些文件的读取。这种缓存机制可以显著提高容器文件系统的访问速度。

2. **减少磁盘 I/O：** Overlay2 存储缓存可以减少对底层文件系统的直接读取操作，从而降低对磁盘 I/O 的负担。这对于提高 Docker 容器的性能和响应速度是有益的。

通常情况下，Docker 使用 Overlay2 存储缓存是透明的，用户无需手动管理。然而，有时可能需要手动清理或调整缓存，尤其是在发现 `/var/lib/docker/overlay2/` 目录占用过多磁盘空间时。在这种情况下，可以考虑使用 `docker system prune --all --volumes` 命令清理未使用的容器、镜像、网络和数据卷，以释放磁盘空间。


docker image history `<imageid>` 查看某个镜像各层内容及对应大小
```
i577081@vsa9425603:/tmp> sudo docker images --filter "dangling=true"
REPOSITORY                                                                        TAG       IMAGE ID       CREATED       SIZE
<none>                                                                            <none>    aa70b42ace47   7 hours ago   67MB
gmpcisautomation.int.repositories.cloud.ppp/cis-automation-container/sles15_sp3   <none>    a2b7a98627a8   4 days ago    3.82GB

i577081@vsa9425603:/tmp> sudo docker image history a2b7a98627a8
IMAGE          CREATED      CREATED BY                                      SIZE      COMMENT
a2b7a98627a8   4 days ago   CMD ["/sbin/init"]                              0B        buildkit.dockerfile.v0
<missing>      4 days ago   STOPSIGNAL SIGRTMIN+3                           0B        buildkit.dockerfile.v0
<missing>      4 days ago   ENV container=docker                            0B        buildkit.dockerfile.v0
<missing>      4 days ago   RUN |2 TARBALL=sles15_sp3_multicloud.x86_64-…   77.8MB    buildkit.dockerfile.v0
<missing>      4 days ago   ADD sles15_sp3_multicloud.x86_64-0.17.1-Buil…   3.74GB    buildkit.dockerfile.v0
<missing>      4 days ago   ARG IMGVER                                      0B        buildkit.dockerfile.v0
<missing>      4 days ago   ARG TARBALL                                     0B        buildkit.dockerfile.v0

# 具体查看镜像的内容
docker image inspect a2b7a98627a8 | jq . 

```

```
Docker 镜像默认存储在 /var/lib/docker/中，可通过 DOCKER_OPTS 或者 docker daemon 运行时指定 --graph= 或 -g 指定

#### 20231030 hands-on experience to update docker image
```

```
#### Enter container
docker exec -it <容器ID或容器名称> /bin/bash

#### Config file
/home/i577081/.docker/config.jsone

docker tag sidevops.int.repositories.cloud.ppp/sidevops/perl-critic:latest sidevops.int.repositories.cloud.ppp/sidevops/perl-critic:bkp_latest

#### build docker image
docker build -t sidevops.int.repositories.cloud.ppp/sidevops/perl-critic:$tag .

#### quickly build an image locally.
docker build -t bindprototype:1.0 .

#### push to remove private githut repo
docker push sidevops.int.repositories.cloud.ppp/sidevops/perl-critic

#### remove container
docker rm checklib_test 

#### Run container 
docker run -it --name checklib_test sidevops.int.repositories.cloud.ppp/sidevops/perl-critic:latest /bin/sh

#### Check image history
docker history sidevops.int.repositories.cloud.ppp/sidevops/perl-critic


#### remove docker (dangling) volume
docker volume rm $(docker volume ls -qf dangling=true)

#### move image from one to the other.
docker tag sidevops.int.repositories.cloud.ppp/sidevops/pycheck keppel.eu-de-1.cloud.ppp/si-cicd/pycheck-081:latest
```

About docker authentication

After `docker login` docker_service_api/kepple service, a base64 encrypted credential will be updated in `~/.docker/config.json`

```
k create secret docker-registry keppel-regcred-eu2 \ 
   --docker-server=kepple.eu-de-2.cloud.ppp \
   --docker-username=I577081@cis/sni-dev-k8s@cis \
   --docker-password=$ccpw \ 
   -n bind-test

# You mush have .* policy in kepple service/UI
```