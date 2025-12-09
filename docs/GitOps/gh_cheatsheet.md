

```

gh auth login
# Assume there are two github instance 
# and we try appointing export GH_HOST=github.wdf.ppp.corp
gh repo list CloudChef

# fastly clone repo under one github instance
gh repo list CloudChef --limit 1000 \
  | grep '^CloudChef/ccloud_' \
  | awk '{print $1}' \
  | xargs -I {} gh repo clone {}

gh repo list WOO-chef --limit 1000 \
  | awk '{print $1}' \
  | xargs -I {} gh repo clone {}

gh org list
```