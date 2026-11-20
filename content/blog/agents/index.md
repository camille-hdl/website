---
title: How I work with agents
date: "2026-11-20T18:00:00.000Z"
---

This is how I currently work with agents for software engineering as of November 2026.
I'll try to update this when I change things significantly.
I won't pretend this is the best way to go, and for that matter you shouldn't trust anyone trying to sell you a definitive "agentic workflow" or whatever. This is a brand-new world in software engineering; things that are "best practices" today will be obsolete in a week, so enjoy the ride.  

## The orchestrator

### A single orchestrator agent
I mostly interact with a single agent: my orchestrator, in a single session.  
It is instructed to do as little work by itself as possible: it should [`/delegate`](https://github.com/camille-hdl/skills/blob/main/skills/delegate/SKILL.md) instead whenever possible.

Doing many things from a single session is suboptimal in many ways (easy to miss things in the chat, and context grows fast). I hedge against some of them (see below).

### A home repo
"Home repo", "second brain", call it whatever you want. This is the repo from which I start my orchestrator agent.  
This repo contains instructions for the orchestrators (in `AGENTS.md`), knowledge about the projects I'm working on, knowledge about my setup.  
It lives in a private git repo, and has a strict "NO RISKY DATA" rule enforced by hooks.

My top-level directories are:
- `memory/`: long-term memory: knowledge about things and people, and how I like to work.
- `context/`: briefs for subagents and temporary context for current projects live here.
- `output/`: deliverables such as markdown files, archives, etc.
- `wiki/`: structured knowledge.
- `packages/`: re-usable scripts and binaries (more on this later).
- and the usual `.agents/skills/`, etc.

The orchestrator is tasked with keeping things tidy within those directories in whatever way it likes best, optimising for efficient information retrieval.

The repo can be used by multiple agents, should I need it. For example, when my Mac isn't available, my orchestrator can run in Grok Bot.

The orchestrator maintains a "context/recovery.md" file that points to everything it is currently working on. If I restart it with a clean context, it simply reads this file and gets back to work.

### Packages
The orchestrator is instructed to recognize when its tasks can and should be made re-usable, deterministic and testable. When this is the case, it creates a (Node, usually) "package".  
If necessary, such packages can then be shared with co-workers.

### Herdr
I open a single pane in Herdr and run my orchestrator.  
Through Herdr's API, it can then launch and monitor other agents in any harness, on my machine or others through ssh.

You can probably do the same in other programs such as T3 Code or even plain Claude Code if you only use this harness.

#### The "decisions & PR" pane
The Herdr GUI lets you change its layout. I added a "Decisions & PRs" pane: the orchestrator is instructed to use it to display any PRs it deems ready to merge and any blocking questions for me. That way, I don't miss a question lost in the flow of conversation.


### Communication channels
My orchestrator, when it runs on my machine and not in Grok Bot, can reach me safely through email and encrypted instant messaging. I have an `/afk` skill that toggles this behavior when necessary.

## Software development
I'm not original: I like [Matt Pocock's skills](https://github.com/mattpocock/skills) and [pstack](https://github.com/cursor/plugins/tree/5f9a00e39a4c6e67703e83fbc99c0e3fd51c5aed/pstack) like most people, and my skills reference them.  

I do have some [homemade skills](https://github.com/camille-hdl/skills/tree/main) though. 

### Big feature
When I start working on a big feature, my workflow is generally this:

1. run a [`/shaping`](https://github.com/camille-hdl/skills/blob/main/skills/shaping/SKILL.md) session in the project's repo to figure out what I really want to do and de-risk it
2. ask the agent to read `/codebase-design` and [`/data-modeling`](https://github.com/camille-hdl/skills/tree/main/skills/data-modeling)
3. run `/to-spec` and `/to-tickets` to split work into "tracer bullets" subtasks
4. run a modified `/implement` on the tickets, sequentially, one session per ticket. I have access to Anthropic and OpenAI models, so I try to have Claude review code produced by Codex, and vice-versa. Some people think it's not necessary anymore with recent models but in my experience it often catches real bugs so I'll just keep doing it.

### Small changes and fixes
I just use [`/tactical-programming`](https://github.com/camille-hdl/skills/blob/main/skills/tactical-programming/SKILL.md) or frankly just plainly ask the agent; it'll do just fine.

### System-wide changes with big blast radius
That's when I pull out the big models.  
I generally ask for multiple opinions. The orchestrator will ask at least 2 frontier models (say Fable and Astra) how they would tackle the issue, and give them all the context and constraints of the system I want to change.  
Then, I'll send a different agent to figure out the state-of-the-art way of doing whatever I'm trying to do but *without* context or constraints specific to the project.
Then I'll work with the orchestrator to figure out the best ideas from the 3 agents, review them, and come up with a plan.

### Greenfield projects

The `/wayfinder` skill from Matt Pocock is great for this.  

#### Comments
For code that is ONLY touched by agents, I use [no-comments](https://github.com/camille-hdl/skills/blob/main/skills/pstack-bridge/references/no-comments.md) from pstack. I'm too scared to run this on legacy projects for now.

## Software factory
I hate that expression, but I don't know a better name for completely autonomous development by agents.  
IMHO, the key is to find the right balance between when you want deterministic behavior (the "harness") and when you want inference (the agent doing its thing).  

This is trickier than it sounds.  
You want to expose yourself to the upside (the agent can work its magic and ship your features 24/7), but hedge against the downside (it burning all your tokens, exposing your secrets to whoever, drifting, etc.).

I won't talk about the triage problem here, but I can talk about implementation.

My current solution is a deterministic harness (basically a big Python script) on a fixed-size VPS that fetches work from trusted sources, controls access to repositories (read and write) and runs the agent + its Docker stack in a cgroup. The cgroup is important: agents run commands and programs, and even if you kill the agent, you can't be sure you also killed all the programs it started. The cgroup helps with that. On the network, the VM is isolated from almost everything except what is strictly necessary (as any system should).  

The harness checks invariants: the remaining Claude+Codex usage, the number of implementation/review cycles is below a threshold, the total time and tokens spent by the agent on a given task is below its threshold, etc. If anything goes off the rails, it nukes the whole cgroup and asks a human for guidance. That way, the maximum cost of a single implementation attempt is capped (I think).
The agent never has direct access to the repo, the ticketing system, or any real system. The harness gives it a checkout to work with, and opens the PR when the agent declares it is ready.  
This took several attempts to get in a working condition, and it still sometimes requires human intervention to get it unstuck, but it works most of the time.

## Models and harnesses
- orchestrator: Opus 5.5 medium in Claude Code. It's just too good.
- backup orchestrator: Grok Bot
- implementation: Sol, Luna, Opus
- other tasks: see [my `/delegate` skill](https://github.com/camille-hdl/skills/blob/main/skills/delegate/SKILL.md)
- Fable & Astra: I'll ask for their opinion *sometimes*, but almost never have them do actual work.

## Other notable skills and tools
- "Impeccable" is nice