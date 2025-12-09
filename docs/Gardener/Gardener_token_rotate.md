


Gardener Hierarchy -> Garden -> Project -> Shoot. 

```
gardenctl target --garden ppp-landscape-canary --project sni --shoot sni-validation
```

Dockerfile source codes
```
# Stage 1: prepare banaries in alpine
FROM dockerio.int.repositories.cloud.ppp/alpine/curl AS downloader

ARG KUBECTL_VERSION=v1.30.1
ARG VAULT_VERSION=1.15.5

RUN apk add --no-cache unzip bash util-linux ca-certificates

# Download kubectl
RUN curl -L "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl" -o /kubectl && \
    chmod +x /kubectl


# Download vault and unzip
RUN curl -L "https://releases.hashicorp.com/vault/${VAULT_VERSION}/vault_${VAULT_VERSION}_linux_amd64.zip" -o /vault.zip && \
    unzip /vault.zip -d / && \
    chmod +x /vault && \
    rm /vault.zip

# Download jq
RUN curl -L "https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64" -o /jq && \
    chmod +x /jq

# Download yq
RUN curl -L "https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64" -o /yq && \
    chmod +x /yq

# Stage 2: Final image with busybox
FROM suse.int.repositories.cloud.ppp/bci/bci-busybox:15.6.36.1

# Parameters normally passed by the build process
ARG VERSION=0.0.1
ARG CI_JOB_TOKEN
ARG CI_COMMIT_SHORT_SHA

# Parameters according to https://github.com/opencontainers/image-spec/blob/main/annotations.md
LABEL org.opencontainers.image.authors='SNI ppp Allan Yu'
LABEL org.opencontainers.image.url='https://github.tools.ppp/sni-docker-images/sidevops-gardener-token-rotation'
LABEL org.opencontainers.image.documentation='https://dev-docs.cia.net.ppp/docs/garm/sni-docker-images/sidevops-gardener-token-rotation'
LABEL org.opencontainers.image.source='https://github.tools.ppp/sni-docker-images/sidevops-gardener-token-rotation.git'
LABEL org.opencontainers.image.version=${VERSION}
LABEL org.opencontainers.image.revision=${CI_COMMIT_SHORT_SHA}
LABEL org.opencontainers.image.vendor='ppp SE'
LABEL org.opencontainers.image.licenses="ppp"
LABEL org.opencontainers.image.title='sidevops-gardener-token-rotation'
LABEL org.opencontainers.image.description='base image used to achieve gardener token rotation automatically'
LABEL org.opencontainers.image.base.name="alpine"

# Create folders inside the image
RUN mkdir -p /k8s /vault /root/.kube /usr/local/bin /lib /lib64 /etc/ssl/certs

# Copy binaries from downloader
COPY --from=downloader /kubectl /usr/local/bin/kubectl
COPY --from=downloader /vault /usr/local/bin/vault
COPY --from=downloader /jq /usr/local/bin/jq
COPY --from=downloader /yq /usr/local/bin/yq

# Copy kubeconfig files (this will be done in helm chart part with the integration of vault)
#COPY canary-kubeconfig.yaml /root/.kube/canary-config.yaml
#COPY live-kubeconfig.yaml /root/.kube/live-config.yaml

# COPY the CA certificates bundle from alpine
COPY --from=downloader /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt

# Environment setup
ENV PATH="/usr/local/bin:$PATH"

ENTRYPOINT ["/bin/sh"]
```