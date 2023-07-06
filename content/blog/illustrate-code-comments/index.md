---
title: Illustrate your code comments
date: "2023-07-06T18:00:00.000Z"
description: Add plaintext diagrams and drawings to your code comments with Monodraw
image: monodraw-example.jpg
---

Code comments are communication: they explain an abstraction, an implementation, or give context to complex technical problems. They are the documentation closest to the code, where we need it most.  

An image is a powerful tool to communicate relationships between objects, distance, size, time, all of which are relevant in a program.

![Unflattening, Nick Sousanis](unflattening-relationships.png "In “Unflattening”, Nick Sousanis illustrates how shape, distance, repetition, separation, negative space and other visual tools can communicate relationships by tapping into a common experience of the world.")

I think we should use images in comments more often.   
We should not, however, lose the convenience of plain text: it can be checked in version control, shows up in diffs and works out-of-the-box in any text editor.   
Nor should we entirely remove sentences, because phrases can be searched for in a search engine and can be read by accessibility tools or people who don't like visual communication.

Text-based diagrams are, to me, a good compromise. See this comment I wrote recently, to explain something about structural sharing:

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