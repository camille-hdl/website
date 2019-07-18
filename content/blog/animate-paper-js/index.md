---
title: animatePaper.js
date: "2015-03-23T20:00:00.000Z"
description: An animation library for paper.js
---

An animation library for paper.js. 

* [examples](http://camille-hdl.github.io/animatePaper.js/) and [API documentation](http://camille-hdl.github.io/animatePaper.js/doc/)
* [demo](https://jsbin.com/nadanon/1/edit?js,output)
* [repo](https://github.com/camille-hdl/animatePaper.js)
* [npm](https://www.npmjs.com/package/paper-animate) `npm install --save paper-animate`


__Update: As a result of me not using it professionnally, I unfortunately do not maintain this library anymore. It still works, but now that paper.js  ships with the [Tween class](http://paperjs.org/reference/item/#tween-from-to-options), which has an API similar to this one, you might want to look at that instead.__

## How it works

I'm not going to paraphrase the [readme](https://github.com/camille-hdl/animatePaper.js/blob/master/README.md) here, but will talk about 
what this library does and how it is designed.

Its main goal is to help paper.js users predictably change properties of their objects over time, without having to rewrite their own easing functions over and over.  

### API

The API has 3 "levels":

* A collection of premade animations called ["effects"](https://output.jsbin.com/gitaso/5/) - [API](http://camille-hdl.github.io/animatePaper.js/doc/classes/fx.html)
* Tweening of properties through `animatePaper.animate()` - [API](http://camille-hdl.github.io/animatePaper.js/doc/classes/animatePaper.html#method_animate)
* Hooks to extend the API to [animate unsupported properties](http://camille-hdl.github.io/animatePaper.js/doc/classes/animatePaper.html#method_extendEasing) or [add easing functions](http://camille-hdl.github.io/animatePaper.js/doc/classes/animatePaper.html#method_extendPropHooks).

### Tweens

A common approach used to achieve this is the *tween*, which describes the transition between two known states (the beginning and the end) by interpolating intermediate values.  
Depending on the visual effect you want to communicate, the interpolation will be done using different *easing* functions.  

For instance, a linear animation:
```javascript
function linear(p) {
    return p;
}
```

or a "swing" effect:
```javascript
function swing(p) {
    return 0.5 - Math.cos(p * Math.PI) / 2;
}
```

__An easing function basically maps time to value.__


### Application to paper.js

Tweens and easing functions aren't specific to paper.js or any other library.  
You may have used them in jQuery or elsewhere.  
It's a generic solution that requires two things to be applied:

* __access to time__ (when do I update values?)
* __access to values__ (how do I update values?)


Time is solved by [wrapping](https://github.com/camille-hdl/animatePaper.js/blob/master/src/frameManager.ts) the `onFrame` callback provided by paper.js. Alternatively, animations can run on `setTimeout`.  
The values are read and updated by ["prophooks"](https://github.com/camille-hdl/animatePaper.js/blob/master/src/prophooks.ts), an extensible abstraction
over paper.js data types (colors, points, etc.) and quirks (scale...).

A "propHook" is a simple object describing how to read, update and ease an `Item`s properties (more info in the readme):
```javascript
{
    get: function(tween) {
        // return ...
    },
    set: function(tween, percent) {
        // ...
    },
    ease: function(tween, eased) {
        // return ...
    }
}
```
