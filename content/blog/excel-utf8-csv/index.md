---
title: UTF-8 csv fix for Excel
date: "2019-07-16T22:00:00.000Z"
---

Using *utf-8* for your CSV files sounds obvious and works well in most software processing them.  
Most software except Micrososft's Excel, which, considering its number of users, can sadden your day.

Excel seems to assume *windows-1252* __unless a [Byte order mark](https://en.wikipedia.org/wiki/Byte_order_mark) is provided__.


To fix this without asking your users to navigate a maze of hidden menus, you can add a BOM to a string before saving it to a file or triggering a download.


In JavaScript:
```javascript
let csvString = ["a,b,c", "1,2,3"].join("\n");
csvString = "\ufeff" + csvString;
```

or in PHP:
```php
$csvString = implode("\n", ["a,b,c", "1,2,3"]);
$csvString = chr(0xEF) . chr(0xBB) . chr(0xBF) . $csvString;
```

If you look at the hex dump, you can check for the presence of this byte sequence at the very beginning: `EF BB BF`.
