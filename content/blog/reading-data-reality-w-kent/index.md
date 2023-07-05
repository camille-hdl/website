---
title: Reading "Data & Reality" by William Kent
date: "2020-04-19T15:20:00.000Z"
description: Notes and highlights
image: cover.png
---

> There is an important difference between truth and utility.

I recently finished the 3rd edition of this book, with commentary from Steve Hoberman, published in 2012 (the first edition was published back in  1978).  

This book is presented as being about data modeling, but it really is about empathy for the user and humility when evaluating your mental representation of the world.  
While it does not dig very deep in technical details on either subject, it does bring useful insights and its share of "aha" moments.  

On multiple occasions, the author managed to challenge my certitudes on topics as varied as my own identity as a living creature or database keys.

What follows are excerpts from the text rearranged by topic, as well as my own comments. Your mileage may vary.

![cover of the audiobook version of "Data & Reality" by William Kent](cover.jpg "Cover of \"Data & Reality\" by William Kent")

> A map simplifies a complex geographic landscape in the same way that a data model simplifies a complex information landscape.

Through inductive~ish logic, the author argues throughout the book that the "real world" is arduous –if not impossible– to model and therefore **any decision made during the modeling process is just that : an arbitrary choice**.

> A model is the basic system of constructs used in describing reality.

It follows, then, that the data Model shouldn't bother trying to be an exact model of reality but merely a pragmatic tool : **a reconciliation of the "mental realities" of the users**, in order to achieve a specific purpose (whatever business the users do).

> "The map is not the territory" - Hayakawa

> Most things are in the database because they "exist" in people's minds, without having any "objective" existence.

> \[...\] most attempts at modeling the entire organization fall short because they fail to acknowledge the many different perceptions.
> \[...\] we also need to "map" each of the concepts on this holistic model to each of the different perspectives.

The model facilitates communication between the users.

> There is a flow of ideas from mind to mind; there are translations along the way, from concept to natural languages to formal languages and back again.

> context plays a role in scope, abstraction, terminology, and definitions. It also plays a role in readability.

A fundamental prerequisite to a successful model is that it should be **informed by the business, not by the existing tools**:

> Tainted thinking means that some business professionals equate how they do their jobs to the software they use.

> A model is more than a passive medium for recording our view of reality. It shapes that view, and limits our perceptions. If a mind is committed to a certain model, then it will perform amazing feats of distortion to see things structures that way\[...\].

Later chapters of the book describe how the concept of "records" in databases often influences the modeling.

### Oneness, Sameness, Existence, Uniqueness, Scope

> When does a thing change to the point that it is no longer the same thing and is now a new thing?

> There is no natural set of categories. The set of categories to be maintained in an information system must be for that system.

> "What is the scope of uniqueness?" The broader the context, the greater the effort to integrate.

### Conceptual, logical and physical data models

Each level of abstraction of the information system has its uses, but the physical model is ephemeral because it is tied to the technologies of the day.  
The logical model, however, is closer to the mental model of the users, making it easier to maintain. It will outlive any technical implementation and can be re-used in the future.

> The conceptual data model captures the business scope of the problem, the logical the business solution, and the physical the technical solution.

> It is sometimes asserted that each entity \[...\] must have a unique identifier. I content that this is a requirement imposed by a particular data model \[...\], but it is not an inherent characteristic of information.

> Data modeling is the process of eliciting business requirements and organizing the data to produce a data model. The data model becomes the artifact that can be used and reused\[...\].

> The logical data model is so valuable because it is technology-independent.

### Names

Names are ambiguous, so we should be careful not to confuse them with surrogates.

> What is a name but a symbol for an idea?

> Systems that depend on symbolic associations for paths, as opposed to internal "unrepresented" paths between entities, cannot readily cope with changing names.

> Whether a name refers to one thing or many frequently depends on the set of candidates available to be referenced. This set \[...\] is often implicit in the environment in which the naming is done.

> A surrogate is intended to be in one-to-one correspondence with some entity which it is representing. In contrast, the correspondence between symbols and entities is often many-to-many.

> Ambiguity appears to be inevitable, in an almost mathematical sense, if we consider the relative magnitudes of the set of concepts and the set of words.

### Relationships

The "reason" of the relationship is at least as important as the entities involved.

> A relationship is an association among several things, with that association having a particular significance.

> the reason is an important part of the relationship.

> a relationship can be specified as an unorderded set of unique role names.

### Categories, Types, Sets

> One common denominator is the notion of grouping. We assume that things can be divided into groups, where the groups are expected to satisfy a number of guidelines

> In making types non-exclusive, we come closer to reality--and suffer the penalty of facing more of the complexities of real life.

> A set is determined by a predicate, whose minimal form involves a relationship to an object.
