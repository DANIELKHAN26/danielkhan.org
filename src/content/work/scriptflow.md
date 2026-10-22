---
title: ScriptFlow — an offline presenter workspace
summary: A local-first rehearsal tool that shows one complete thought at a time near the camera line, so prepared scripts sound natural on camera.
type: project
status: In development
date: 2026-10-22
tags: [Open tools, Presenting, Linux]
links:
  - label: Try the script timer
    url: /tools/script-timer/
collaboration:
  open: true
  needs: [Testers with a webcam and microphone, Front-end developers]
---

A teleprompter only helps if it helps the presenter communicate. Words scrolling faster than someone can think produce an accurate reading with none of the connection that makes a documentary or talk worth watching.

ScriptFlow tackles a narrower problem: showing a short, complete thought close to the camera line, letting the presenter decide when to move on, and keeping recording and review in one place.

## Design decisions

- **Line-by-line and scrolling modes**, both controlled by the presenter.
- **Mistake markers** you can drop while recording, to find retakes quickly.
- **A review record** to compare what was said with the approved script.
- **Works offline** — no cloud account, and unpublished scripts never leave the computer.

## Where it stands

The prototype is being tested for hardware compatibility and recording integration. A public repository and versioned downloads will follow once it passes release checks. Meanwhile, the [script timer](/tools/script-timer/) — one piece of the workflow — is free to use now.
