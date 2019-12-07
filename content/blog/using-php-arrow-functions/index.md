---
title: Using PHP arrow functions
date: "2019-12-07T19:30:00.000Z"
---

PHP 7.4 was released with support for arrow functions, as defined in [this RFC](https://wiki.php.net/rfc/arrow_functions_v2).  
To paraphrase it, the goal is to provide a concise syntax for closures performing simple tasks.  
Basically, we're avoiding many redundant `use` imports.

In the context of this RFC, __"simple task" means a single statement returning a value__.  

If you come from the JavaScript world, be wary of a few key differences in semantics, including but not limited to:

* variables in the outer scope are implicitly captured __by-value__.
The implication is that if you mutate them in the closure, the outer variable won't change.
```php
$outer = 1;
$test = fn() => ++$outer;
assertEquals(2, $test()); // true
assertEquals(2, $outer);  // false
```
* multi-statement bodies are not supported at this time. Note that you can still write _multiline_ single-statements.

That said, there are still many use cases.

## Simple tasks: `array_` functions

The `fn()` syntax obviously works well for simple tasks such as mapping over, reducing or filtering an array:
```php
$users = [
    ["id" => 123, "authorized" => true],
    ["id" => 234, "authorized" => false]
];

$getAuthorized = fn() =>
    array_filter(
        $users, 
        fn($user) => $user["authorized"]
    )
;
assertEquals(1, count($getAuthorized())); // true
```

## Mutation in objects

`$this` binding in arrow functions works the same as in "normal" closures.  
That's one way you can affect the outside world other than returning a value.

```php

class MyObj
{
    protected $count = 0;
    public function increment()
    {
        ++$this->count;
    }
    public function getCount()
    {
        return $this->count;
    }
    public function mapIncrement(array $values)
    {
        return array_map(fn() => $this->increment(), $values);
    }
}
$instance = new MyObj;
$instance->mapIncrement(["a", "b", "c"]);
assertEquals(3, $instance->getCount());
```

## One-liners

The temptation (for me anyway) is to bend the "single-statement" rule by writing crazy one-liners, 
so that you can benefit from the implicit capture of the outer scope.    

For instance this naive yet very unreadable [curry](https://en.wikipedia.org/wiki/Currying) implementation:

```php
function curry(int $arity, callable $function, ...$previousArgs): callable
{
    return fn($arg) =>
        $arity <= count([...$previousArgs, $arg])
            ? $function(...[...$previousArgs, $arg])
            : curry($arity, $function, ...[...$previousArgs, $arg]);
}

$glueThreeValues = curry(
    4, 
    fn($glue, $firstVal, $secondVal, $thirdVal) => 
        implode($glue, [$firstVal, $secondVal, $thirdVal])
);
assertEquals("1-2-3", $glueThreeValues("-")(1)(2)(3));
```

I'll let the reader decide if the benefit is worth the relative ugliness.  
Use responsibly!