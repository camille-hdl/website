---
title: Flow types for Immutable.js Records
date: "2020-03-08T10:20:00.000Z"
description: Type safety for Immutable.js data structures
---

## What is a Record?

An `Immutable.Record` instance is an object with a defined set of keys and default values.  
They are instanciated by factories, which are created by calling `Immutable.Record({ ...defaultValues })`.  

Learn more [here](https://immutable-js.github.io/immutable-js/docs/#/Record).

(For the sake of brevity, the following mentions of `Record` and `Map` assume the `Immutable.` namespace)

## Records: when and why?

Whenever  

* you have a `Map` with string keys and
* you wish you had some kind of __garantees about which keys you can expect__ and
* you wish you had some __safety about the types of the values__ of those keys and
* you don't want to write tens of lines of defensive programming,

consider using a `Record`.

One such case could be the state in a React application.  

## Typing Records in Flow

If you're typing your JavaScript with Flow, you have to explain it what a `Record` is.  
Luckily, Immutable.js 4 provides 2 useful types: `RecordOf` and `RecordFactory`.

```js
//@flow

import type { RecordOf, RecordFactory } from "immutable";
import { Record, List } from "immutable";

/**
 * Describe the shape of your object
 */
type MyObject = {|
    key1: string,
    key2: number,
    key3: boolean,
    key4: List<string>,
|};

type MyRecord = RecordOf<MyObject>;

/**
 * Create the factory with the default values
 */
const makeRecord: RecordFactory<MyObject> = Record({
    key1: "defaultString",
    key2: 1,
    key3: false,
    key4: List()
});

// create an instance with default values
const myRecordInstance = makeRecord();
// Inference works as expected
myRecordInstance.get("key1"); // Works
myRecordInstance.get("wrongKey"); // Error

// create an instance from an object
const myOtherInstance = makeRecord({
    key1: "My string",
    key4: List(["a", "b", "c"])
});
myOtherInstance.get("key4").toSet(); // Works
myOtherInstance.get("key2"); // Works

```

__The garantees you'll get:__

* `MyRecord` instances will always have the expected keys,
* they won't have unexpected keys,
* the values will always have the expected type.
