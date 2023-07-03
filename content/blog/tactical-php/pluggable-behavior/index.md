---
title: "Tactical PHP : Pluggable Behavior"
date: "2020-06-01T10:00:00.000Z"
description: Variable behavior without inheritance
---

In OOP, the usual answer to a need of variable behavior within a class are subclasses : you create a subclass and overload the (hopefully not many) desired methods.  

However, **each new class comes at a cost**:

* we have to communicate its function (through naming, documentation...),
* it increases the complexity of our class hierarchy.

What if the subclass requires additional dependencies not shared with the superclass?  
What if the code in the changing behavior has nothing to do with the other responsibilities of the class?  
Is expressing this requirement through inheritance the right choice?

We may consider using another pattern : pluggable behavior.  

Let's say we have a User class, and need to support many different ways of generating IDs. Instead of using subclasses or strategies, we could store a closure in a property and use it when we need to.

```php
class User {
    protected $id;
    protected $idGenerator;
    public function setIdGenerator(callable $idGenerator)
    {
        $this->idGenerator = $idGenerator;
    }
    public function generateId()
    {
        if (!\is_callable($this->idGenerator)) {
            throw new \LogicException("No idGenerator");
        }
        $generator = $this->idGenerator;
        $this->id = $generator();
    }
}

$user = new User();
// ... later ...
$user->setIdGenerator($myUUIDGenerator);
// ... later ...
$user->generateId();
```

The User class does not need to know how the ID is generated.  
A closure could reference completely unrelated objects (UUID libraries for instance) that have nothing to do with its responsibilities, and contain an arbitrary amount of code without adding complexity to the class.

## Tradeoffs

As always when using arbitrary `callable`s: there is no way for a reader of the User class to statically understand what `setIdGenerator` does exactly. You have to choose your evil between a potentially unnecessary subclass, adding complexity in your main class or using black-box closures.  
It is also difficult to store a closure in a database or a file (and if you do, it comes with a completely new set of problems). In our example, only the ID needs to be stored, the code used to create it is irrelevant.

<aside class="my-comment">
<p>
In <a href="/tactical-php/">Tactical PHP</a> I briefly introduce an object-oriented pattern, the use cases in which it can be useful, and the inevitable tradeoffs.<br />
I draw most of the inspiration for this series from "Smalltalk Best Practise Patterns", by Kent Beck.
</p>
</aside>