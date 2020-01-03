---
title: Symfony Maintenance Mode
date: "2020-01-03T21:35:00.000Z"
description: Safely toggle maintenance mode independently from dependency injection or autoload
---

When you perform tasks on your application that could result in a broken layout or even errors displayed on the front-end, you want some kind of maintenance mode to show a waiting page to your users instead.  

A brief survey of the [suggested](http://fabien.potencier.org/symfony4-best-practices.html) [solutions](https://hugo-soltys.com/blog/how-to-make-a-maintenance-mode-for-your-symfony-website) online shows that often, these implementations assume the source code is in a stable state.  

However if you have a corrupted cache, a missing vendor or permission issues on configuration files, a maintenance mode based on Symfony commands, Kernel event listeners and DI won't help you and you will suffer errors.  

Here is a way to safely implement maintenance mode to prevent all access to your front-end while your app is unstable, without having to mess with your nginx configuration.  

## Entrypoints

A Symfony app typically has 2 entrypoints:

* __public/index.php__ for HTTP Requests
* __bin/console__ for the CLI

Both need to be handled, as you could have cron jobs running while you're doing maintenance work.

Edit those file like so:

__bin/console__:  
```php
/** At the top of the file */
if (is_readable(__DIR__.'/../0_MAINTENANCE')) {
    echo "Maintenance mode is enabled";
    exit(1);
}
```
`exit(1)` will return an error code.  
The "flag" file is prefixed with `0_` in order to easily find it in a directory listing.

__public/index.php__:  
```php
/** At the top of the file */

if (is_readable(__DIR__.'/../0_MAINTENANCE')) {
    http_response_code(503);
    include "./maintenance.php";
    die();
}
```
[HTTP 503](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/503) can be properly used in this case.  
__It is crucial that the responses you send while down for maintenance are NOT cached!__  


Add the following file:  

__public/maintenance.php__:  
```php

if (!is_readable(__DIR__ . '/../0_MAINTENANCE')) {
    /**
     * Maintenance page used while not in maintenance mode
     */
    header("HTTP/1.1 301 Moved Permanently"); 
    /**
     * This should be changed according to your directory root
     */
    header("Location: /");
    die();
}
/** 
 * Then, include the actual HTML page 
 * you want to show your users 
 */
```

## Toggle

A simple bash script can be used as a toggle

__scripts/maintenance.sh__:  
```bash
#!/bin/bash

ACTION="$1"
MAINTENANCE_FILE=0_MAINTENANCE

if [ "$ACTION" == enable ];
then
    if [ -f "$MAINTENANCE_FILE" ];
    then
        echo "$MAINTENANCE_FILE already exists"
    else
        touch "$MAINTENANCE_FILE"
        chmod 744 "$MAINTENANCE_FILE"
    fi
elif [ "$ACTION" == disable ];
then
    if [ -f "$MAINTENANCE_FILE" ];
    then
        if [[ ! -w "$MAINTENANCE_FILE" ]]
        then
            echo "$MAINTENANCE_FILE can't be removed : check permissions"
            exit 1
        else
            rm "$MAINTENANCE_FILE"
        fi
    else
        echo "$MAINTENANCE_FILE does not exist"
    fi
else
    echo "Usage : \`scripts/maintenance.sh enable\`, \`maintenance.sh disable\`"
fi
```

Usage:  
From the application root: `scripts/maintenance.sh enable`


## Drawbacks

* This solution won't work if you need to make changes in bin/console or public/index.php. Luckily this shouldn't happen very often.
* If your app is distributed, you will need to create the file on every filesystem.
* This will add a read on the filesystem for every execution of public/index.php or bin/console, which could have a performance cost.