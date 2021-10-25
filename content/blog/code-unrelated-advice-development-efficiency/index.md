---
title: Code-unrelated advice for development efficiency
date: "2021-10-25T19:05:00.000Z"
description: Things I now do that I wish I did earlier
---

What follows are a few techniques and tools that have helped me release software faster in the small team I am a part of (more on this at the end). You won't find a comprehensive methodology nor universal wisdom here, just advices I wish I'd given myself earlier.

This is a very rough summary of my typical feature development workflow:

![Feature development workflow](code-loop.svg "Feature development workflow")

Optimizing this would mean to reach step « 4. Done » faster without sacrificing quality at step « 3. Good enough? ».

To achieve this, I have a few options:

1. get better at coding,
2. get better at the rest,
3. have less things to code.

The following suggestions have almost nothing to do with coding itself, but everything to do with getting better feedback, requiring less iterations and better understanding the work so that I don't waist coding time. 

## Before coding: sketch

When I'm working on UI, before I even start to code, I hand draw a very rough sketch of the elements and/or behaviour I'm going to implement, and show it to whosever input I value (usually users or the person who gave me the requirements).  
I try not to go beyond simple boxes and arrows: I want to stay abstract yet find out as early as possible any problem related to how things are placed in space or how user actions are ordered.  
Iterating on UI on a piece of paper is cheap, in code less so.

See also: [Fat marker sketches in Shape-up](https://basecamp.com/shapeup/1.3-chapter-04#fat-marker-sketches)

If I'm working on a back-end feature such as a new API, I can get a similar benefit by sketching a sequence of requests and responses.

## Use screen capture in pull requests descriptions

It is unfortunately common that getting feedback on pull requests can be difficult, for a wide range of reasons.  
I found that taking the time to record my screen while I'm using the new feature, grab a few screenshots of the most important UI elements, and adding that at the top of the pull request description __greatly increased both the quantity and the diversity of the feedback__ I received, which resulted in a better feature.  

There are people in any team that may not have the time, will or technical background to review code, but anyone can watch a short video and contribute some feedback.  
Doing this also gives more context to my fellow developers doing the actual code review.

## Use a personal "feature document" instead of a shared to-do list

In a team, it makes sense to have some kind of centralized tasks list, such as an issue tracker or backlog in a project management tool.  
These tools generally aim to help planning and get a big picture of who does what, and when, on a project.  
Once a task is on my desk however, the shared to-do list becomes a hindrance. I want my to-do list to be more of a "feature document" in which I dump my brain while I'm working, without polluting my colleagues work with notifications, noise, and context they don't need.  

This is what I want out of my feature document:

- I want to be able to divide the work into sub-tasks
    - constantly add and remove new tasks as my understanding of the work grows,
    - group and ungroup them,
    - prioritize and re-prioritize between groups
- I want long text to live besides my task list
    - go from requirements to design document to tasks and vice-versa,
    - link drawings, diagrams
    - reference emails, meeting notes, logs
- It only needs to be relevant to me, not necessarily to others

This document helps me:

- understand the requirements and the context better,
- do the most important work first,
- communicate as precisely as I can on my status,
- get all that context back into my head after an interruption,
- and serve as a basis for my pull request description and documentation when I'm done.

I found that a markdown file works great for that. I use Obsidian and sometimes Drafts.

The shared to-do list stays relevant as a space where I can request for precisions on the requirements and broadcast updates to others.

## Know common CLI programs enough to be ~~dangerous~~ productive

Some may consider it code, but I think of them more as tools. I reach for them when I need them usually without caring for long-term maintenance.

I cannot give an exhaustive list of the times `grep`, `awk` or `xargs` made my work easier in one way or another, but I can select a few:

- searching logs on virtually any system
- repairing data from a client
- deployment, CI/CD glue code
- [dependency management](/update-latest-version-many-npm-dependencies)
- ...

Some of these programs, such as `awk`, do have a relatively high skill floor, but also an incredibly high skill ceiling. Time invested in learning them will pay off.  
You don't need to know their man pages by heart, you don't need to write the cleanest, cleverest one-liners out there: you just need to know enough of what they can do to glue them together and get work done. Each time, you can do a bit more.

See: [The Art of Command Line](https://github.com/jlevy/the-art-of-command-line)

## Conclusion

My way of working may not be suited to yours, which is fine. It's the process that matters.  
As developers, depending on our seniority, we have more or less control over the "software development system" of our team. Never the whole system, but always more than just strictly coding.  
It pays off to take a step back, be conscious of the sub-system on which we can act, and experiment. See what works with your team, and improve, just like we would optimize code.

> Some context about me:  
> I'm part of a company/team of 6, 3 of which are developers (including me).  
> I mainly work on two products, each with a ~5 years old PHP/JS codebase, which are our main sources of revenue.
