


gitlab pipeline to synchronize github repository to gitlab
```

stages:
  - sync

repo-pull-push:
  image: cia-docker-live.int.repositories.cloud.sap/ciea-pipeline-tools:4.0.9
  stage: sync
  script:
    # - env
    - echo "Fetching repository info from GitHub App payload"
    - export REPO_OWNER=$(cat $TRIGGER_PAYLOAD | jq -r '.repository.owner.login')
    - echo "REPO_OWNER $REPO_OWNER"
    - export REPO_NAME=$(cat $TRIGGER_PAYLOAD | jq -r '.repository.name')
    - echo "REPO_NAME $REPO_NAME"
    - export GITLAB_GROUP=$REPO_OWNER
    - export CI_GIT_URL=$(cat $TRIGGER_PAYLOAD | jq -r '.repository.clone_url')
    - echo "CI_GIT_URL $CI_GIT_URL"
    - |
          if ! curl -f --header "Authorization: Bearer $SYNC_TOKEN" "$CI_API_V4_URL/projects/$(echo -n $GITLAB_GROUP/$REPO_NAME | jq -s -R -r @uri)"; then
            echo "Repository does not exist. Creating repository $REPO_NAME in group $GITLAB_GROUP"
            NAMESPACE_ID=$(curl --header "PRIVATE-TOKEN: $SYNC_TOKEN" "$CI_API_V4_URL/groups?search=$GITLAB_GROUP" | jq '.[0].id')
            echo "NAMESPACE_ID $NAMESPACE_ID"
            curl --request POST --header "Authorization: Bearer $SYNC_TOKEN" --header "Content-Type: application/json" --data "{ \"name\": \"$REPO_NAME\", \"namespace_id\": \"$NAMESPACE_ID\" }" "$CI_API_V4_URL/projects"
          else
            echo "Repository already exists"
          fi
    - echo "Cloning repository from GitHub"
    # - git config --global user.name "${GITHUB_USER}"
    # - git config --global user.password "${GITHUB_TOKEN}"
    # - git clone --mirror $CI_GIT_URL pipeline-${REPO_NAME}
    - git clone --mirror https://${GITHUB_USER}:${GITHUB_TOKEN}@github.tools.sap/${REPO_OWNER}/${REPO_NAME}.git pipeline-${REPO_NAME}
    - cd pipeline-$REPO_NAME
    # - git remote add gitlab https://oauth2:${CI_JOB_TOKEN}@$CI_SERVER_HOST/$GITLAB_GROUP/$REPO_NAME.git
    - git remote add gitlab https://user:${SYNC_TOKEN}@$CI_SERVER_HOST/$GITLAB_GROUP/$REPO_NAME.git
    - echo "Pushing to GitLab"
    - git push --mirror gitlab
  rules:
    - if: ! $TRIGGER_PAYLOAD

```