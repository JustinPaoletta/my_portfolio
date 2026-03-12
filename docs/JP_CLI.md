# JP_CLI Theme Guide

This document explains the interactive JP_CLI theme behavior, controls, and command model.

## Overview

The JP_CLI theme presents the portfolio as a fullscreen terminal-style interface with:

- A terminal pane and a navigation pane
- Keyboard-first interaction
- Command parsing for section drill-in
- A prompt styled as `jp@cli: ~%`

On app load in JP_CLI mode, output starts with minimal pre-rendered text to keep the active prompt near the top.

## Layout Behavior

- Desktop/tablet:
- Navigation pane on the left
- Terminal pane on the right
- Compact/mobile:
- Terminal pane first
- Navigation pane below terminal pane

In JP_CLI mode, the top navbar is hidden.

## Theme Switcher in JP_CLI

- The theme switcher is fixed in the bottom-right corner.
- Its menu opens upward so options remain visible near the viewport edge.

## Interaction Model

JP_CLI supports staged input and Enter-to-run:

- Arrow keys (`↑ ↓ ← →`) move current menu selection
- `Space` stages the current selection value in the prompt
- Number keys (`0-9`, including numpad) stage numeric input in the prompt
- `Enter` executes the staged or typed command
- Clicking a menu option stages that option in the prompt

Actions do not execute on click, number key, or space alone.

## Command Reference

### Main menu numbers

- `1` About
- `2` Projects
- `3` Skills
- `4` Experience & Education
- `5` GitHub Activity
- `6` Contact
- `7` Pet Dogs
- `8` Resume
- `9` Help
- `0` Clear terminal

### Aliases

- `about`
- `projects`
- `skills`
- `experience` or `education`
- `github` or `gh`
- `contact`
- `dogs` / `doggos` / `pets`
- `resume` / `cv`
- `menu`
- `help` / `h`
- `clear` / `cls`

### Drill-in commands

- `project <n>`
- `skill <n>`
- `exp <n>`

### Dog commands

- `dog <n>`
- `dog <n> treat`
- `dog <n> scritch`
- `dog <n> scritches`

### Theme exit commands

- `exit`
- `quit`

`exit`/`quit` switches from the JP_CLI theme back to the app default theme (`engineer`).
