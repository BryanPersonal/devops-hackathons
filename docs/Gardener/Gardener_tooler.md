

```
function prompt_gardenctl() {
  local condition
  local gardenctl_target=$(gardenctl target view -ojson)
  local gardenctl_garden=$(echo ${gardenctl_target}| jq -r '.garden')
  if [[ ${gardenctl_garden} != null ]]; then
    condition="1"
  fi
  local gardenctl_project=$(echo ${gardenctl_target}| jq -r '.project')
  if [[ ${gardenctl_project} == null ]]; then
    gardenctl_project=""
  else
    gardenctl_project="|🏡 ${gardenctl_project}"
  fi
  local gardenctl_shoot=$(echo ${gardenctl_target}| jq -r '.shoot')
  if [[ ${gardenctl_shoot} == null ]]; then
    gardenctl_shoot=""
  else
    gardenctl_shoot="|🌱 ${gardenctl_shoot}"
  fi
  local gardenctl_cp=$(echo ${gardenctl_target}| jq -r '.controlPlane')
  if [[ ${gardenctl_cp} == null ]]; then
    gardenctl_cp=""
  else
    gardenctl_cp="|🛰️ "
  fi
  p10k segment -f 040 -c "${condition}" -t "🪐 ${gardenctl_garden} ${gardenctl_project} ${gardenctl_shoot} ${gardenctl_cp}"
}
```