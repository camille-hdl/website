---
title: "Troubleshoot homebrew MySQL / MariaDB on Apple Silicon"
date: "2024-08-21T10:00:00.000Z"
description: Fix Homebrew MySQL or MariaDB service not running on macOS with Apple Silicon.
image: mysql-mariadb-homebrew.jpg
---

# Symptoms

You are running homebrew MariaDB or MySQL with Homebrew on Apple Silicon.

Your MySQL client is throwing "SQLSTATE[HY000] [2002] No such file or directory" errors.

`brew services start mysql/mariadb` is successful but the service does not run.

`/bin/launchctl bootstrap gui/<yourid> /Users/you/Library/LaunchAgents/homebrew.mxcl.mysql.plist` shows "Bootstrap failed: 5: Input/output error".

# Fix

## 1. Login items

Go into System Settings > Login items > Allow in the Background and check that you don't have multiple instances of `mysqld_safe`. This could be the case if you installed multiple versions of MySQL or MariaDB on your machine.

If you do have duplicates, you can click on the small ℹ️ icon to reveal the corresonding plist file in Finder and see if its one you want to keep or not.

## 2. File permissions

mysqld should not run as root, therefore the files it needs to write to should not belong to root.  

Check the permissions in the datadir `/opt/homebrew/var/mysql` and look for anything not belonging to your user:

```shell
ls -al /opt/homebrew/var/mysql
```
Everything should be owned by you.  
If something belongs to root, you should fix it:  
```shell
sudo chown youruser:admin /opt/homebrew/var/mysql/*.err
```

## 3. If nothing works, start `mysqld_safe` manually

You will get much clearer error messages this way.  
For example, for MariaDB 10.11:
```shell
/opt/homebrew/opt/mariadb@10.11/bin/mysqld_safe --datadir=/opt/homebrew/var/mysql
```