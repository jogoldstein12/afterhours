# After Hours Party Game

## Description

"After Hours" is an interactive and edgy party game designed for adults. Built with Next.js and styled with a neon-drenched aesthetic using Tailwind CSS and Shadcn UI, this Progressive Web App (PWA) delivers a seamless experience on both desktop and mobile devices, even offline. Players enter their names, select a "NSFW Level" (Mild, Medium, or Extreme), and the game serves up a series of hilarious, daring, and risqué prompts.

The game leverages AI for content moderation, ensuring that user-submitted prompts can be filtered appropriately, and is built to be easily extendable.

## Features

- **Interactive Gameplay:** Prompts can dynamically include players' names for a more personal and engaging experience.
- **Player & Gender-Specific Prompts:** The game supports prompts that can be targeted based on player gender.
- **NSFW Levels:** Choose from three levels of intensity (Mild, Medium, Extreme) to match the party's vibe.
- **Progressive Web App (PWA):** Installable on mobile devices for a native app-like feel and offline gameplay.
- **Responsive Neon UI:** A dark, neon-themed design that looks great on any screen size.
- **AI-Powered Content Moderation:** Utilizes Genkit to test and moderate new prompts, ensuring they fit the desired NSFW category.
- **Easy Setup:** Add player names, choose a level, and start the game in seconds.

## Tech Stack

- **Framework:** Next.js
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI
- **AI Integration:** Genkit
- **PWA:** next-pwa

## How to Install and Run the App

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
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
- `npm run lint`: Lints the codebase for errors.
