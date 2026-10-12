# Todo List Project

A project-based todo list built with vanilla JavaScript, bundled with Webpack, and persisted in the browser with `localStorage`. This is my solution to [The Odin Project's Todo List assignment](https://www.theodinproject.com/).

Create projects, add tasks to them, set priorities and due dates, tick tasks off, edit them, and delete them. Everything survives a page refresh.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Available Scripts](#available-scripts)
6. [How the App Works](#how-the-app-works)
7. [Data Model](#data-model)
8. [Module Breakdown](#module-breakdown)
9. [Build Configuration](#build-configuration)
10. [Deployment](#deployment)
11. [A Note to Future Me (and Anyone Reading This)](#a-note-to-future-me-and-anyone-reading-this)
12. [What I Did in This Project (and What I Didn't)](#what-i-did-in-this-project-and-what-i-didnt)
13. [Known Limitations and Possible Improvements](#known-limitations-and-possible-improvements)

---

## Features

- **Projects**
  - A `default` project is created automatically on first launch.
  - Create new projects (name limited to 10 characters).
  - Delete projects. After a deletion, the app moves to a neighbouring project, or shows an empty main area if none are left.
  - Click a project card to open it.
- **Tasks**
  - Each task has a title, description, due date, priority (Low / Mid / High) and notes.
  - Priority is color-coded: red for high, blue for mid, green for low.
  - Due dates are formatted with `date-fns` (e.g. `March 05, 2026`).
  - Mark a task as completed with a checkbox.
  - **View/Edit** a task through an inline edit form that replaces the card.
  - Delete a task.
- **Persistence**
  - Every change (add, edit, toggle, delete) is saved to `localStorage`.
  - On startup, the app loads saved data. If nothing is saved, it creates the default project instead of crashing.

---

## Tech Stack

| Tool | Purpose |
| --- | --- |
| Vanilla JavaScript (ES modules) | Application code |
| [Webpack 5](https://webpack.js.org/) | Bundling, dev server, production build |
| `webpack-merge` | Splitting Webpack config into common / dev / prod |
| `html-webpack-plugin` | Generates `index.html` from `src/template.html` |
| `style-loader` + `css-loader` | Lets JavaScript import CSS files |
| [`date-fns`](https://date-fns.org/) | Formatting and parsing dates |
| Web Storage API (`localStorage`) | Persisting projects and tasks |

---

## Project Structure

```
Todo-List-Project/
├── src/
│   ├── dom.js              # All DOM creation, rendering and event handling
│   ├── index.js            # Orchestrator: starts the app, nothing else
│   ├── liveData.js         # In-memory projects/tasks and the logic that changes them
│   ├── persistentData.js   # localStorage save/load
│   ├── styles.css          # All styling (imported by dom.js)
│   └── template.html       # HTML skeleton used by HtmlWebpackPlugin
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
├── webpack.common.js       # Config shared by dev and prod
├── webpack.dev.js          # Development config
└── webpack.prod.js         # Production config
```

---

## Getting Started

### Installation

```bash
git clone https://github.com/Tushar-webb/Todo-List-Project.git
cd Todo-List-Project
npm install
```

### Run in development

```bash
npm run dev
```

This starts the Webpack dev server, opens the app in your browser, and reloads when `template.html` changes.

---

## Available Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the dev server with `webpack.dev.js` and opens the browser |
| `npm run build` | Creates an optimized production build in `dist/` using `webpack.prod.js` |
| `npm run preview` | Serves the production configuration locally with the dev server |
| `npm run deploy` | Pushes the `dist/` folder to the `gh-pages` branch via `git subtree` |

---

## How the App Works

### Startup flow (`index.js`)

1. `initProjects()` runs. It loads saved data from `localStorage`, or creates a `default` project if nothing is saved. It returns `true` if saved data existed, `false` otherwise.
2. `displayProjects()` renders the project cards in the sidebar.
3. If this is a first launch (no saved data), `displayTasksCreator("default", 0)` opens the default project so the user can add a task right away.
4. `setupProjectForm()` attaches the submit handler to the "Create Project" form.

### User interactions

| User action | What happens |
| --- | --- |
| Submit the "Create Project" form | `addProject()` updates the data, then the sidebar re-renders |
| Click a project card | The task creator form and that project's task list are rendered in the main area |
| Click a project's **Delete** button | The project is removed and the app moves to a neighbouring project (or clears the main area if none are left) |
| Submit the task creator form | The date is formatted with `date-fns`, `addTask()` stores the task, and the task list re-renders |
| Tick or untick the checkbox | `toggleTask()` updates the task's `checkbox` value |
| Click **View/Edit** | The task card is replaced by an inline update form pre-filled with the task's data |
| Submit the update form | `updateTask()` saves the changes and the list re-renders |
| Click **delete it** | `deleteTask()` removes the task and the list re-renders |

Every function in `liveData.js` that changes data calls `save()`, which hands the full `myProjects` array to `persistentData.js`.

---

## Data Model

All data is stored under a single `localStorage` key: `myProjects`.

```js
// Project
{
  nameOfProject: "default",
  projectUniqueId: "b1f3...-uuid",
  tasks: [ /* Task objects */ ]
}

// Task
{
  title: "Buy milk",
  description: "From the corner shop",
  dueDate: "March 05, 2026",   // formatted string, "MMMM dd, yyyy"
  priority: "Low",             // "Low" | "Mid" | "High"
  notes: "Get 2 liters",
  checkbox: false,             // completed or not
  taskUniqueId: "a9c2...-uuid"
}
```

IDs are generated with `crypto.randomUUID()`. The DOM stores each ID in a `data-unique-id` attribute, and the code looks up the matching project or task index from it when the user clicks something. This avoids relying on a card's position on screen.

---

## Module Breakdown

### `index.js` — the orchestrator

Only starts the application. It decides *when* things happen, not *how*. It creates no objects and holds no logic of its own.

### `liveData.js` — the live (in-memory) data

Holds the `myProjects` array and every function that changes it: `initProjects`, `getProjects`, `addProject`, `deleteProject`, `addTask`, `toggleTask`, `updateTask`, `deleteTask`. It knows nothing about the DOM. After every change it calls `save()`.

### `persistentData.js` — storage

Two functions, one job each:

- `saveProjects(projects)` serializes the data and writes it to `localStorage`.
- `loadProjects()` reads and parses it, returning `null` if nothing is stored (so the app doesn't crash on first launch).

If I ever replace `localStorage` with IndexedDB or a backend, this is the only file that needs to change.

### `dom.js` — everything the user sees

Builds elements, renders projects and tasks, and wires up all the event listeners. It reads and changes data only by calling functions imported from `liveData.js`. It also imports `styles.css` as a side-effect import (see below).

### `styles.css`

The project's single stylesheet. It uses native CSS nesting and is imported from `dom.js` (`import "./styles.css";`). Since `dom.js` is the only DOM module, one CSS file is enough, and Webpack handles it through `style-loader` and `css-loader`.

### `template.html`

The static skeleton: header, sidebar (project list and "Create Project" form) and an empty `<main>` where tasks are rendered. `HtmlWebpackPlugin` uses it to generate the final `index.html`.

---

## Build Configuration

- **`webpack.common.js`**: entry point `./src/index.js`, output `dist/main.js` (cleaned on every build), `HtmlWebpackPlugin` using `template.html`, and a CSS rule using `style-loader` and `css-loader`.
- **`webpack.dev.js`**: merges the common config and adds `mode: 'development'`, `eval-source-map` for easy debugging, and `watchFiles` so the dev server reloads when `template.html` changes.
- **`webpack.prod.js`**: merges the common config and adds `mode: 'production'` for minification and optimization.

`package.json` sets `"type": "module"`, which is why the config files use `import`/`export` syntax.

> **Remember:** installing a package with `npm install` automatically records it in `package.json`. Packages like `date-fns` do not need to be mentioned in any Webpack config file.

---

## Deployment

The app is deployed to GitHub Pages from the `gh-pages` branch.

```bash
npm run build
npm run deploy
```

`npm run deploy` runs `git subtree push --prefix dist origin gh-pages`, which pushes the contents of the **committed** `dist/` folder, so commit the fresh build before deploying.

---

## A Note to Future Me (and Anyone Reading This)

> This section is about *approach*, not code. It is what I want to remember the next time I start a project.

### Why this section exists

This project took me a long time. There is no guarantee I'll be able to build another project this organized just because I managed it once. I may not always have this much time. So the goal is a **systematic approach**: a clear way to start and a clear way to move forward.

### 1. Plan before you write code

- **Take a long time to prepare the project mentally** (its structure and how it behaves) *before* writing code. Don't start until you honestly feel "yes, I have thought this through", not just because you've already spent a lot of time thinking and feel you should hurry up.
- Rushing is the wrong mentality. Starting in a hurry leaves parts of the preparation unfinished, which creates a lot of rework later. That is exactly what happened here: I first built this project normally, without SRP and without factory functions, and then had to go back and refactor it for a long time.
- **Start with how the app will behave**: what should happen when each button is pressed, which section sits where, and which button sits where.
- **Find every place where objects get created**, and write down what data each one holds in key/value form. Keep these notes somewhere you can find them again.

### 2. Keep two rules in mind while writing code

You are not an expert who automatically knows how many modules a project will need. So during the code-writing flow, remember two things:

**Rule 1: Different kinds of work go in different modules (different files).**
If a piece of code does a completely different kind of work, it belongs in its own module and gets imported where it's needed. For example, if DOM code needs to save data, the saving code goes in a separate module and is imported. In this project:

- DOM code lives only in `dom.js`
- `localStorage` code lives in `persistentData.js`
- Objects and arrays live in `liveData.js`

You won't know at the start what `index.js` should contain, so treat it like DOM code while building. Put genuinely different work into separate modules as you go. At the end, move the DOM code out of `index.js` into `dom.js`, so `index.js` is left as a pure orchestrator.

*A caution about the phrase "separate the logic":* you will hear that logic should live in its own module, but that doesn't mean every project needs a file literally called "logic". Every module has logic ("what happens, how, and when"). What it really means is: **if something doesn't logically belong with the rest of a module, move it to its own module.** In this project that means DOM vs. live data vs. persistent data. A project that does heavy calculation, long rule sets or game logic might well deserve a dedicated logic module. This depends on the project, and you usually get a feel for it during the mental preparation phase before starting.

**Rule 2: Inside a module, each function has one job (functional SRP).**
A module should have one, and only one, reason to change. SRP is only the "S" of SOLID, but for this project (and most small-to-medium projects) it's enough. The rest of SOLID can come with time.

### 3. How do I know when to use SRP and when to use factory function composition?

- **SRP:** don't try to plan for it up front. Just follow the two rules above as you write: separate modules for different work, one responsibility per function. Functional SRP then follows naturally.
- **Factory function composition:** *this one must be planned in advance.* During the mental preparation phase, you should already know which things will have multiple objects of the same type. When you reach the line where those objects get created, turn it into a factory function. If the project needs multiple factory functions that share similar methods, use **composition**: avoid classes and prefer factory functions with composition, assembling small, reusable behaviors instead of locking code into rigid, fragile inheritance hierarchies.

---

## What I Did in This Project (and What I Didn't)

I split the project into four JavaScript files by the kind of work each does: three modules plus an orchestrator.

| File | Follows SRP? | Factory function composition? | Why |
| --- | --- | --- | --- |
| `index.js` | Yes. It only runs startup, which is one job. | No | It creates no objects at all, so composition is not even a question. |
| `persistentData.js` | Yes. It has two functions, each with one clear job: `saveProjects` saves and `loadProjects` loads/parses. | No | No object is created or composed here. The module only saves and loads data in `localStorage`. |
| `liveData.js` | Reasonably, yes. | No | Plain object literals are used here for a good reason: the data is simple and these objects are stored directly as JSON. |
| `dom.js` | **No, not fully.** | No (and normally you wouldn't) | See below. |

### Why `dom.js` doesn't follow SRP

SRP *could* have been applied to `dom.js`, but I didn't do it. The file is long (about 350 lines), and I didn't follow SRP from the beginning. That is the whole point of the approach notes above: **don't make the mistake I made**. Because I didn't apply SRP while writing it, refactoring it afterwards would be very frustrating, so I chose not to. For example, `displayTasks` currently builds the cards, wires every button handler and builds the edit form all in one function. It would be much cleaner as several small functions (and perhaps several small files). I'm aware of this and treat it as a known trade-off.

### Why there's no factory function composition in `dom.js`

Factory function composition is generally not used in DOM modules, because the DOM is already a live, mutable tree. Managing DOM elements, state and references through factory functions and closures in vanilla JS makes the code long and complicated for no gain, since the same job can be done more simply with direct DOM manipulation. There's no real-world need for composition there.

That changes when an application becomes very large and complex (a big dashboard or a social media app). Manually syncing thousands of UI states and DOM updates becomes a nightmare. At that point a framework should be used, so that it handles state management and DOM rendering instead.

### One stylesheet

Only one CSS file, `styles.css`, exists because only one DOM file exists. It is imported into `dom.js` as a side-effect import.

---

## License

ISC