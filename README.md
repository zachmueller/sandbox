# Rummikub P2P

A simple web application for playing [Rummikub](https://en.wikipedia.org/wiki/Rummikub) peer-to-peer over the internet.

## Overview

This project implements a browser-based version of the classic tile-matching game Rummikub, allowing players to connect and play directly with each other using peer-to-peer networking — no central game server required.

## Goals

- **Web-based gameplay**: Play Rummikub entirely in the browser with no installs needed
- **Peer-to-peer networking**: Players connect directly to each other (e.g., via WebRTC) without relying on a centralized game server
- **Core Rummikub rules**: Support for standard Rummikub mechanics including tile sets, racks, melds (groups and runs), and turn-based play
- **Simple UX**: Clean, intuitive interface for managing your rack, placing tiles on the table, and manipulating existing melds

## Tech Stack

- HTML / CSS / JavaScript (vanilla or lightweight framework)
- WebRTC (or similar) for peer-to-peer connectivity
- A lightweight signaling mechanism for establishing connections (e.g., manual exchange, simple signaling server, or WebSocket relay)

## Status

🚧 **In development** — this branch is the starting point for building out the game.