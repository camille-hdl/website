---
title: "Tactical PHP : Collecting Parameter"
date: "2020-07-05T23:00:00.000Z"
description: Avoid using a property as a temporary variable
---

Why are class member variables (aka *properties* or *instance variables*) different from temporary variables?  

Ideally, a property is a representative for a characteristic or a relationship of an object of your model. It communicates something about your domain (the part of the real world your program cares about). It is about modeling, not coding, and should stay relevant in any technical implementation of your model.

By contrast, a temporary variable is a pure artifact of coding: you may need it because of the constraints of your current programming environment, because of performance reasons, because you want to communicate something about your algorithm to your coworkers or any other reason unrelated to your domain.

But what if, during refactoring, you want to divide the logic of a method into smaller methods and aggregate the result? You now need something to store the intermediate results.  

Using a property for this purpose may seem obvious at first, but it could be detrimental for a few reasons:

1. It "taints" your model (for the reasons explained above),
2. it creates an implicit chronological dependency between these methods (the order in which you execute them matters),
3. your methods now have a hidden side-effect —the mutation of the object— that you will have to communicate through naming or documentation.

Your code will likely end up being harder to understand and reuse, which is the opposite of what you want out of refactoring.

Alternatively, you can add a **collecting parameter** to each of the smaller methods.  
Let's say we want to get the notes and bookmarks of an ebook:

```php
class Ebook {
    public function getNotesAndBookmarks(): array
    {
        $result = [];
        $this->addNotesTo($result);
        $this->addBookmarksTo($result);
        return $result;
    }
    protected function addNotesTo(array &$result)
    { /** ... **/ }
    protected function addBookmarksTo(array &$result)
    { /** ... **/ }
}
```

There is no hidden mutation here, and the model isn't compromised by implementation details.

## Tradeoffs

* Adding an extra parameter may be undesirable if your methods already have many.  
* Some might prefer returning the result instead of mutating it by reference, but then, what do you do if you have multiple results?

> In [Tactical PHP](/tactical-php/) I briefly introduce an object-oriented pattern, the use cases in which it can be useful, and the inevitable tradeoffs.  
> I draw most of the inspiration for this series from "Smalltalk Best Practise Patterns", by Kent Beck.
