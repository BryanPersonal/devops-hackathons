

`brew install skopeo`

```

FATA[0005] Error parsing manifest for image: choosing image instance: no image found in manifest list for architecture "arm64", variant "v8", OS "darwin"

# FIX
skopeo inspect \                                                                                                                                                   ✔  took 8s   at 13:30:28 
  --override-os linux \
  --override-arch amd64 \
  docker://cia-docker-live.int.repositories.cloud.sap/vault-secrets-operator/vault-secrets-operator:1.0.1
```