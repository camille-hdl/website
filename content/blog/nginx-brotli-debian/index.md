---
title: Use Brotli compression with Nginx on Debian
date: "2024-06-21T00:12:00.000Z"
description: Enable Brotli compression without having to build a module.
---

Brotli is a general-purpose compression algorithm, arguably better than gzip for the web.  
It is [supported on all major evergreen browsers](https://caniuse.com/brotli).  

To have Nginx compress your web pages and assets with Brotli, you need to install the module and enable it in the configuration.

Despite what can be read online, if you're running Debian and you're using the official Debian nginx package, you don't *have* to compile the module yourself.

<aside class="my-comment">
    <p>
    Note that while using the official nginx package can make your life easier, it means you won't be getting the latest updates.
    </p>
</aside>


## Install the package

```shell
apt install libnginx-mod-http-brotli-filter
```

This package is available from Debian 12 "Bookworm" (at the time of writing, the "stable" release).

## Include the module

If /etc/nginx/modules-enabled is already included in your nginx configuration, then you can skip to the next part.  
Otherwise, add this line to your configuration (for example /etc/nginx/nginx.conf):

```
include /etc/nginx/modules-enabled/50-mod-http-brotli-filter.conf;
```

## Brotli configuration directives

Edit the `http { ... }` block in your nginx configuration with the new brotli directives. For example:

```
# ...
http {
    # ...

    brotli on;
    brotli_comp_level 6;
    brotli_types text/plain text/html text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript image/svg+xml;

    # ...
}
```

[Configuration reference](https://github.com/google/ngx_brotli?tab=readme-ov-file#sample-configuration)

## Check response headers

Restart nginx ( `sudo systemctl restart nginx`) then check the response headers of your website. You should see:

```
Content-Encoding: br
```