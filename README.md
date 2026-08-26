# After Hours Party Game

## Description

"After Hours" is an interactive and edgy party game designed for adults. Built with Next.js and styled with a neon-drenched aesthetic using Tailwind CSS and Shadcn UI, it delivers a seamless experience on both desktop and mobile devices. Players enter their names, select a "NSFW Level" (Mild, Medium, or Extreme), and the game serves up a series of hilarious, daring, and risqué prompts. For fully offline play, use the standalone `game.html` build described below.

## Features

- **Interactive Gameplay:** Prompts can dynamically include players' names for a more personal and engaging experience.
- **NSFW Levels:** Choose from three levels of intensity (Mild, Medium, Extreme) to match the party's vibe.
- **Offline Standalone Build:** `game.html` is the whole game in one file — no server, no dependencies, works offline.
- **Responsive Neon UI:** A dark, neon-themed design that looks great on any screen size.
- **Easy Setup:** Add player names, choose a level, and start the game in seconds.

## Tech Stack

- **Framework:** Next.js
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI

## How to Install and Run the App

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/jogoldstein12/afterhours.git
    cd afterhours
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Standalone HTML Version

`game.html` at the repository root is the whole game in a single file — no build
step, no server, no dependencies. Open it in any browser (double-click it, or
host it anywhere that serves static files) and the full deck plays offline.

It mirrors the Next.js app: the same setup screen, neon card, randomised turn
order, `{{randomOtherPlayer}}` substitution, mid-game level switching, and the
Manage Group sheet. The only external request is the Google Fonts stylesheet,
which falls back to system fonts when offline.

The file is generated from `src/lib/prompts.ts`, so regenerate it whenever the
deck changes:

```bash
npm run build:html
```

The page markup lives in `tools/standalone-template.html`; the build script
injects the prompt deck into it.

## Available Scripts

- `npm run dev`: Starts the application in development mode.
- `npm run build`: Creates a production build of the application.
- `npm run build:html`: Regenerates the standalone `game.html` from `src/lib/prompts.ts`.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the codebase for errors.
