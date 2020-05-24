---
title: "Tactical PHP"
date: "2020-05-24T14:34:00.000Z"
description: Bits of old-school Object-Oriented Programming, applied to PHP
---

"Tactical PHP" is a series in which I introduce a small-scale object-oriented programming pattern adapted to PHP, relevant use cases and the tradeoffs involved.

## Posts so far

* [Execute Around Method](/tactical-php/execute-around-method)

## Introduction

I am far from an OOP evangelist. By nature or culture, my curiosity tends to gravitate towards data-centric and functional approaches, and away from anything resembling a "class" or "state".  

However, one cannot have a heart and not be moved by [Alan Kay talking about OOP](https://www.youtube.com/watch?v=NdSD07U5uBs), one cannot ignore the sheer productivity allowed by the likes of Rails, Laravel and Symfony, one can only accept that many domains are best modeled by objects and messages.

I've recently read [Smalltalk Best Practise Patterns](https://www.oreilly.com/library/view/smalltalk-best-practice/9780132852098/) by Kent Beck (published in 1996).  

![Book Cover](/smalltalk-best-practise-patterns.jpeg)
I've never used Smalltalk, but despite its title, the book focuses on humble, small-scale techniques that can be applied to any modern OOP language now that they have (mostly) caught up.

I use PHP and Symfony in my day job, which is why I'm going to write a series of small blog posts describing patterns I find useful, adapted to PHP's syntax and feature set, and inspired by the book.

> See [this post](/learning-resources/) for other book recommentations.