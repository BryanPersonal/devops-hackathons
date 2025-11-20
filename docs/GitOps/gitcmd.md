

```
# revert commit from a035460 to latest but not including a035460.
git log --oneline --no-merges a035460..HEAD |awk '{print $1}'| xargs -r git revert --no-commit
git revert --continue. # to commit the change 

# validate to ensure no diff
git diff a035460 

```