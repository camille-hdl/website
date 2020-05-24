---
title: "Tactical PHP : Execute around method"
date: "2020-05-24T15:34:00.000Z"
description: Ensure actions are performed together
---

Let's say we want to model a file with a class:
* It must be opened before reading, writing, or doing anything to it.  
* It must be closed afterwards, lest bad things happen.

Of couse, we *could* simply expose `open()` and `close()` public methods, but that's delegating the burden of calling the right thing at the right time to the user, which is rarely a good idea.

Alternatively we could write composed, specialized methods like `readWhileOpen()`, `writeWhileOpen()`, but we would make heavy assumptions on how the object can be used and potentially introduce redudant openings or closings.

Instead, we can expose a single method that takes a `callable` as an argument. The method only ensures the proper opening and closing of the file, without any external code having to care, by calling `open()` and `close()` *around* an arbitrary action:

```php
class File
{
    public function openDuring(callable $action)
    {
        $this->open();
        try {
            $action();
        } finally {
            // ensure the file is always closed 
            $this->close();
        }
    }
    private function open()
    { /** ... **/ }
    private function close()
    { /** ... **/ }
}

$file = new File();
$file->openDuring(function() {
    // $file will always be open here
});
```

## Tradeoffs

While this pattern produces very flexible code, it also makes it harder to analyse statically. Nobody can read the `openDuring()` method and understand everything it can do : only the constraints it enforces.  
To limit the negative effect on code readablity, we should pay special attention to the naming of such a method.  

> In [Tactical PHP](/tactical-php/) I briefly introduce an object-oriented pattern, the use cases in which it can be useful, and the inevitable tradeoffs.  
> I draw most of the inspiration for this series from "Smalltalk Best Practise Patterns", by Kent Beck.
