# After Hours Party Game

## Description

"After Hours" is an interactive and edgy party game designed for adults. Built with Next.js and styled with a neon-drenched aesthetic using Tailwind CSS and Shadcn UI, it delivers a seamless experience on both desktop and mobile devices. Players enter their names, pick a game mode (Mild, Medium, Extreme, or Never Have I Ever), and the game serves up a series of hilarious, daring, and risqué prompts.

## Features

- **Interactive Gameplay:** Prompts can dynamically include players' names for a more personal and engaging experience.
- **Game Modes:** Three levels of intensity (Mild, Medium, Extreme) to match the party's vibe, plus a Never Have I Ever mode that pulls the NHIE prompts out of every tier.
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

## Available Scripts

- `npm run dev`: Starts the application in development mode.
- `npm run build`: Creates a production build of the application.
- `npm run start`: Starts the production server.
- `npm test`: Runs the unit tests over the game logic, the deck and the saved game.
- `npm run test:watch`: The same, in watch mode.
- `npm run test:e2e`: Runs the browser suite against a production build. Needs `npm run build` first, and Playwright installed (`npm i -D playwright && npx playwright install chromium`).
- `npm run lint`: Lints the codebase for errors.
- `npm run typecheck`: Type-checks the codebase without emitting output.
- `npm run export:deck`: Regenerates `docs/prompts.csv` from `src/lib/prompts.ts`.

## Tests

The unit suite is fast and gates every push in CI. The browser suite is slower,
needs a build and a browser, and is meant for structural changes — the game
loop, the saved game, routing, or anything that touches colour, since it checks
WCAG AA contrast on every screen in every mode.
