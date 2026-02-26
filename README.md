# Choose Your Own Adventure

A simple "choose your own adventure" style game built as an experiment in this sandbox repo.

## Purpose

This branch explores building an interactive text-based adventure game where the player makes choices that determine the story's path and outcome. The goal is to test out game design patterns, branching narrative structures, and a lightweight implementation approach.

## Goals

- Build a simple, playable choose-your-own-adventure game
- Experiment with branching story/decision trees
- Keep the implementation lightweight and easy to run (e.g., browser-based with HTML/CSS/JS)

## How to Play

Open `index.html` in any modern web browser — no build step or server required.

Make choices to navigate through the story. Your decisions affect:
- **Health** — take damage from traps, combat, and risky choices
- **Inventory** — collect items that unlock new story paths
- **Endings** — there are 4 distinct endings based on your choices

## Architecture

- `index.html` — Game shell and UI structure
- `style.css` — Dark-themed styling with animations
- `game.js` — Game engine and story data (node-based branching narrative)

The story is defined as a graph of nodes. Each node has narrative text, optional damage/item effects, and choices that link to other nodes. Some choices are gated by inventory requirements.

## Status

🚧 v0.1 — First playable prototype
