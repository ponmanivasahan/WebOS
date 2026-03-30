<!--
 Copyright (C) 2026 ponmanivasahan

 This file is part of WebOS.

 WebOS is free software: you can redistribute it and/or modify
 it under the terms of the AGPL-3.0 License.
-->

<h1 align="center">WebOS</h1>

<p align="center">
  Enterprise-style browser desktop experience built with React.
</p>

<p align="center">
  <a href="https://github.com/ponmanivasahan/WebOS">GitHub Repository</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-%5E19.2.4-2a5f92?style=for-the-badge&logo=react&logoColor=white" alt="React 19.2.4">
  <img src="https://img.shields.io/badge/React%20Scripts-5.0.1-2a5f92?style=for-the-badge&logo=createreactapp&logoColor=white" alt="React Scripts 5.0.1">
  <img src="https://img.shields.io/github/last-commit/ponmanivasahan/WebOS?style=for-the-badge" alt="Last Commit">
  <img src="https://img.shields.io/github/commit-activity/w/ponmanivasahan/WebOS?style=for-the-badge" alt="Commit Activity">
</p>

---

## Table of Contents
- [Executive Summary](#executive-summary)
- [Product Scope](#product-scope)
- [Capabilities](#capabilities)
- [Technical Architecture](#technical-architecture)
- [Implementation Details](#implementation-details)
- [Installation and Local Development](#installation-and-local-development)
- [Production Build](#production-build)
- [Repository Structure](#repository-structure)
- [Roadmap](#roadmap)
- [License](#license)

---

## Executive Summary
WebOS is a browser-native desktop interface that replicates key operating system workflows in a modern web application.

The project demonstrates frontend architecture for multi-window interaction, desktop-style navigation, and app orchestration in a single-page environment.

Primary goals:
- Deliver a polished Windows-inspired interaction model
- Provide a modular app surface for future expansion
- Showcase product-oriented UI engineering and state management patterns

---

## Product Scope
WebOS is designed as an interactive system rather than a conventional website.

Users can:
- progress through a startup sequence,
- operate a desktop workspace,
- launch and manage multiple apps,
- and interact with persistent system-style controls (taskbar, clock, and windows).

---

## Capabilities
### Startup and Access Flow
- Boot screen
- Lock screen
- Login screen

### Desktop Experience
- App icons and icon interactions
- Desktop context menu actions
- Wallpaper switching support

### Window Management
- Drag and reposition windows
- Minimize, maximize/restore, and close
- Foreground focus management

### Taskbar and System Layer
- Running app indicators
- App switching from taskbar
- Clock/tray presentation

### Built-in Applications
- File Explorer
- Notes
- Focus App (timer + task workflow)
- Additional in-browser app views

### File Explorer Functions
- Folder tree navigation
- Path/address-based navigation
- Back, forward, and up traversal
- Create, rename, and delete operations

---

## Technical Architecture
- Framework: React 19
- Build Runtime: React Scripts (Create React App)
- Language: JavaScript (ES6+)
- Styling: CSS
- UI Assets: React Icons

Core architecture is component-driven with dedicated modules for:
- desktop rendering,
- application windows,
- welcome/startup flow,
- app-specific logic,
- and shared context/hooks.

---

## Implementation Details
This project emphasizes:
- UI state coordination across multiple concurrent windows,
- reusable desktop and application primitives,
- interaction consistency across mouse and keyboard workflows,
- and progressive refinement of app-level UI/UX patterns.

---

## Installation and Local Development
### Prerequisites
- Node.js 20+
- npm

### 1. Clone the repository
```bash
git clone https://github.com/ponmanivasahan/WebOS.git
cd WebOS
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm start
```

The project runs using `react-scripts start` in development mode.

---

## Production Build
```bash
npm run build
```

Compiled production artifacts are generated in the `build/` directory.

---

## Repository Structure
```text
src/
  components/
    apps/
    desktop/
    welcome/
    window/
  context/
  hooks/
  assets/
```

Primary entry points:
- `src/index.js`
- `src/App.js`

---

## Roadmap
- Strengthen Start Menu implementation
- Expand Settings application depth
- Extend File Explorer workflows
- Add additional desktop apps and system utilities
- Continue UX, accessibility, and performance optimization

---

## License
This project is licensed under **AGPL-3.0**.
