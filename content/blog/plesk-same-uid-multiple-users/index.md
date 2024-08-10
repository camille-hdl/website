---
title: "Plesk: same UID, different user"
date: "2024-08-11T00:00:00.000Z"
description: How to get around Plesk assigning the same UID to multiple users of the same subscription.
---

## The problem

When a new (s)FTP user is added to a subscription in Plesk, he is given the same UID as the original system user created for that subscription.  
According to Plesk gurus, [nothing is strange here](https://talk.plesk.com/threads/file-owner-in-subscription-is-unequal-to-sys-user-actual-file-owner-name-is-set-to-a-ftp-user-name.352967/#post-864912). There is, however, a huge problem with this:

__Upon login through ssh with the "main" user account, you won't know which user you will be logged-in as.__

[Plesk asserts that the system will automatically](https://support.plesk.com/hc/en-us/articles/12377218364311-Additional-FTP-user-displayed-as-the-owner-of-all-subscription-s-content) know that the "real" user associated with a UID is the first matching entry in /etc/passwd. This is, in my experience, bullshit, specifically as far as sshd is concerned.  

In consequence, upon ssh login as `myrealuser@myserver`, you don't know ahead of time which user you will be logged-in as. You may end up as `sftpuser1`, `myrealuser` or any other user associated with the subscription, *even if that user does not have shell access*.  

This is only the first problem. Consider:  

- Each user can have a *different* crontab,
- Each user can have a *different* home directory, which means
- Any script or executable that depends on something being in `~` (such as `git` or `ssh`) will behave unpredictably.

It is completely possible to ssh as a random user, edit a random crontab that will run scripts that don't know which directory `~` will be.

## My workarounds

Steps can be taken to ensure scripts will behave predictably in this situation.  
As all users of a subscription share the same uid, ownership or ACL are not an issue.  

### `$HOME` and `~`

If you end up not being logged-in as the real user, `~` can't be trusted because of reasons. `$HOME`, however, can.

This has consequences, notably with ssh.

### ssh

By default, `ssh` will look for a configuration file in `~/.ssh/config` and for a known_hosts file in ~/.ssh/known_hosts. You have to provide paths with `$HOME` explicitly:

```bash
ssh -F $USER_HOME/.ssh/config -o UserKnownHostsFile=$USER_HOME/.ssh/known_hosts
```

### git

If you use `git` over ssh, you need to provide the `GIT_SSH_COMMAND` environment variable that uses `$HOME` instead of `~`:

```bash
GIT_SSH_COMMAND="ssh -F $USER_HOME/.ssh/config -o UserKnownHostsFile=$USER_HOME/.ssh/known_hosts"

```

### Crontab

This command will actually give you the first entry in /etc/passwd matching your uid:

```shell
awk -F ':' -v uid="$(id -u)" '$3 == uid {print $1; exit}' /etc/passwd
```

This can then be used, for example, to edit the crontab:

```bash
USERID=`id -u`
USERNAME=`awk -F ':' -v uid="$USERID" '$3 == uid {print $1; exit}' /etc/passwd`

cat crontab_template | crontab -u $USERNAME -
```
