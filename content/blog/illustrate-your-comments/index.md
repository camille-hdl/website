---
title: Illustrate your comments
date: "2023-07-06T18:00:00.000Z"
description: Add plaintext diagrams and drawings to your comments with Monodraw
image: monodraw-example.jpg
---

I remember the first time structural sharing in data structures "clicked" for me. It was explained with a drawing of boxes and arrows.

An image is a powerful way to communicate relationships between objects, distance, size, time, all of which are relevant in a program.

![Unflattening, Nick Sousanis](unflattening-relationships.png "In “Unflattening”, Nick Sousanis illustrates how shape, distance, repetition, separation, negative space and other visual tools can communicate relationships by tapping into a common experience of the world.")

Comments in code are communication tools: they explain an abstraction, an implementation, or give context to complex technical problems. They are the documentation closest to the code, where we need it most.  

We should use images in comments more often.   

We should not, however, lose the convenience of plain text: it can be checked in version control, shows up in diffs and works out-of-the-box in any text editor.   
Nor should we entirely remove sentences, because phrases can be searched for in a search engine and can be read by accessibility tools or people who don't like visual communication.

Text-based diagrams are, to me, a good compromise. Look at this example:

```

            No data duplication

┌───────────┐                 ┌───────────┐
│ Version A │                 │ Version B │
└───────────┘                 └───────────┘
      │                             │
      ├─────────────┬───────────────┘
      │             │
┌─────▼────┐  ┌─────▼────┐
│ Data A 1 │  │ Data A 2 │
└──────────┘  └──────────┘
              ──────────────
           With data duplication

┌───────────┐                 ┌───────────┐
│ Version A │                 │ Version B │
└───────────┘                 └───────────┘
      │                             │
      ├─────────────┐               ├─────────────┐
      │             │               │             │
┌─────▼────┐  ┌─────▼────┐    ┌─────▼────┐  ┌─────▼────┐
│ Data A 1 │  │ Data A 2 │    │ Data B 1 │  │ Data B 2 │
└──────────┘  └──────────┘    └──────────┘  └──────────┘
```

I generated this diagram with [monodraw](https://monodraw.helftone.com) a paid (but not expensive) macos app, which can export text-based drawings with options to easily paste into common comment formats.  

![Monodraw text export menu](monodraw-export.png "A list of common comment formats in the monodraw export menu.")

Communicating ideas with pictures seems to be obvious everywhere, from art to education and marketing. Lets use it in code comments.

> Meaning is thus conveyed not only by what's depicted, but through structure:
> the size, shape, placement, and relationship of components - what they're next to, and what they're not, matters.
> <cite><u>Unflattening</u>, Nick Sousanis</cite>