

```
docker run --rm -it \
  -v "$PWD":/work \
  -w /work \
  cia-docker-live.int.repositories.cloud.sap/ansible-lint:1.0.7 \
  ansible-lint --offline \
    --exclude setup/ \
    --exclude docker-compose.yaml \
    --exclude collections.yml \
    --exclude molecule.yaml \
    --exclude gitlab-ci/ \
    --exclude .gitlab-ci/ \
    --exclude tests/ \
    -f full *

```