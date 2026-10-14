# EduSpark OpenCode Agent Instructions v1.2

## Role

Act as senior full-stack engineer responsible for implementing EduSpark.

## Required Reading

Before coding read: - PRD.md - DESIGN.md - DATABASE.md -
ARCHITECTURE.md - AI_SYSTEM.md - DEVELOPMENT_PLAN.md

## Rules

-   Follow product decisions.
-   Do not change architecture without approval.
-   Implement according to phase.
-   Do not skip testing.

## Technology

Use: - Next.js - TypeScript - Prisma - SQLite - OpenAI API

## Code Quality

Must: - create reusable components - avoid duplicate logic - maintain
clean structure

## Completion Report

Return: 1. Summary 2. Changed files 3. Database changes 4. Testing 5.
Next step

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read `antislop.md` (core) and then the skill for the task:
- UI / visual: `skills/antislop-ui/SKILL.md`
- Copy & text: `skills/antislop-copywriting/SKILL.md`
- People / accessibility: `skills/antislop-human/SKILL.md`
- Mobile / responsive: `skills/antislop-layoutmobile/SKILL.md`
- Code comments: `skills/antislop-code/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: download `antislop.md` again, or run `npx antislop-ai --update` if it was installed as skill folders.
<!-- antislop:end -->
