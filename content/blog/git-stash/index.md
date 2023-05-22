---
title: git stash
date: "2023-05-22T16:00:00.000Z"
description: Setting changes aside without committing
---

When my work on a repository is interrupted, `git stash` helps set my work aside safely without having to create an actual commit.

Lets say I am on branch `feature/A` and have unstaged changes and new files in the `src/` subdirectory. The following command will push all changes under `src/` to a stash entry named `my_work_on_feature_a`:

```
git stash push -u -m "my_work_on_feature_a" src/
```

I can now view my stash with:
```
git stash list
```

My working directory is now "clean", allowing me to freely switch to another branch.  

Later, I can get back to my original work the command:
```
git stash pop
```

The changes that I stashed will now be re-applied to my working directory, either on the original `feature/A` branch or another (unless there are conflicts).

`git stash` supports many other options and use-cases which you can discover with:
```
man git-stash
```

### Benefits of the `git stash` workflow

- branch history is not polluted with unnecessary commits
- compatible with other git-based workflows
- no need to copy/paste code in another tool

### Risks

- the stash is local to your repository and cannot be pushed as-is to a remote. Therefore, it can be lost if your device is damaged.
