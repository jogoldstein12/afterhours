# App Title

## Description

This is a Next.js application built with Tailwind CSS and Shadcn UI components. It appears to include functionality related to content moderation, potentially utilizing AI flows.

## Features

- **Content Moderation:** Includes components and potentially AI flows for moderating content (based on `src/ai/flows/content-moderator.ts` and `src/components/moderator/ModeratorTestForm.tsx`).
- **Game Page:** Contains a dedicated page for a game (`src/app/game/page.tsx`).
- **Moderator Test Page:** Includes a page specifically for testing moderation (`src/app/moderator-test/page.tsx`).
- **UI Components:** Leverages Shadcn UI for a consistent and modern user interface (`src/components/ui/...`).
- **Responsive Design:** Likely includes responsive design principles, potentially using a `use-mobile` hook (`src/hooks/use-mobile.tsx`).
- **Toast Notifications:** Implements toast notifications for user feedback (`src/hooks/use-toast.ts`, `src/components/ui/toast.tsx`, `src/components/ui/toaster.tsx`).
- **Utility Functions:** Provides common utility functions (`src/lib/utils.ts`).
- **Prompt Management:** Includes a file for managing prompts, likely for AI interactions (`src/lib/prompts.ts`).
- **Genkit Integration (Potential):** The presence of `src/ai/genkit.ts` suggests potential integration with Genkit for AI workflows.

## How to Install and Run the App

1. **Clone the repository:**

