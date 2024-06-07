---
title: Workaround for PHP max_execution_time reached too early on Apple Silicon
date: "2024-06-03T17:35:00.000Z"
description: "Affects php-fpm and built-in web server on macOS > 14 with M1/2/3 chips"
---

There is a bug in PHP that causes the `max_execution_time` to be reached too early (sometimes instantly) on Apple Silicon. This affects both `php-fpm` and `php -S` on macOS 14 (Sonoma).  

I have encountered this issue with macOS 14.5 on an M3 pro chip, and other users have reported it with different configurations.

## Workaround

The workaround is to set the `max_execution_time` to a very high value in your `php.ini` file. 

```
max_execution_time = 99999999
```

Setting it to `0` or `-1`, despite working in CLI, does not help.

## Long-term solution

At the time of writing, a fix has been merged for 8.2 and 8.3, but not released yet. 

When it is released, upgrading should solve the issue. For php 8.2, it should be 8.2.20 or 8.2.21.

It is unclear if it will be backported to 8.1 as well.

For more information, see:  

- https://github.com/php/php-src/issues/12814
- https://github.com/php/php-src/pull/13567/files

## Update

The PHP 8.1 [homebrew shivammathur formula](https://github.com/shivammathur/homebrew-php/issues/2732) has been patched to include the fix, since it won't be merged upstream in php itself.
