---
title: Pre-commit, pre-push or pre-merge ?
date: "2020-11-14T07:30:00.000Z"
description: When to run tests, linters, static analysis...
---

Here are three of the things I typically may want to run on my codebase:

* a linter,
* static analysis,
* tests.

While I can run them manually, I find it easier for everyone involved if it just happens on its own.

It's about **getting feedback as soon as possible without breaking the flow of work**.

## When and where should they run?

* on save: runs every time I save a file on disk,
* pre-commit: runs before I commit my changes,
* pre-push: runs before I push mu changes to a remote,
* pre-merge: runs on CI when I do a merge request (or "pull-request").

|   |When|How often|Where|
|---|---|---|---|
|on save|very early|very often|locally|
|pre-commit|early|often|locally|
|pre-push|late|sometimes|locally|
|pre-merge|later|rarely|CI|

The right answer will depend on the execution time of each task. 

**The slower the task, the later it should run.**

If something *feels* slow, it will get in the way and people (me included) *will* work around it.  
If I have to wait a long time before knowing if my tests pass or not, I probably will switch to another task and waste time.

Here is my rule of thumb, to be adapted to your needs:

|Runtime|Earliest it can run|
|--:|---|
|less than 100 milliseconds|on save|
|less than 3 seconds|pre-commit|
|less than 10 seconds|pre-push|
|above 10 seconds|pre-merge|
|above 5 minutes|split into sub-tasks|

## Fine-tuning

Every team is different, what works for one won't necessarily work for others.

The tools we use give us even more options to choose when to run what, according to our preferences:

* IDE Integrations,
* manual or conditional tasks on CI,
* third party tools integrating with our cvs...

For instance, I choose to run linters on pre-commit, and not on save even if it's fast, because I find it distracting to have code jumping around on the screen.

I run unit tests pre-merge, but trigger end-to-end tests manually because they are very slow, and would delay feedback too much.

Experiment is key.

## External links

* [pre-commit](https://pre-commit.com)
* [Documentation on git hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
* [bitbucket pipelines](https://support.atlassian.com/bitbucket-cloud/docs/get-started-with-bitbucket-pipelines/)