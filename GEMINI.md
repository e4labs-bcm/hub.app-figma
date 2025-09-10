# GEMINI.md - Hub.App Project Context

This document provides instructional context for Gemini to effectively assist with development in the Hub.App repository.

## 1. Project Overview

Hub.App is a **multi-tenant SaaS platform** designed for micro and small businesses. It provides a centralized, flexible, and simple management solution. The core of the application is a modular system that can be expanded with new functionalities through an internal "App Store".

*   **Purpose:** To provide a "single pane of glass" for small business owners to manage their operations, including CRM, scheduling, and more.
*   **Business Model:** Freemium, with a free base platform and paid premium modules available via monthly subscription.
*   **Target Audience:** "The Busy Entrepreneur" - users who need simple, efficient, and mobile-accessible tools.

### Architecture & Technology

*   **Frontend:** React, TypeScript, Vite
*   **Backend & Database:** Supabase (PostgreSQL with Row-Level Security)
*   **Styling:** Tailwind CSS with Radix UI for headless components.
*   **Core Principles:**
    *   **Multi-tenancy:** Strict data isolation between companies using Supabase RLS. This is a non-negotiable principle.
    *   **Mobile-First:** The UI is designed for mobile and adapts responsively to desktop.
    *   **Modular System:** Functionality is delivered through modules that are dynamically loaded based on user permissions and subscriptions.
    *   **Self-Service:** Users can sign up, configure their company, and purchase modules without manual intervention.
    *   **Provider Pattern:** State is managed via React Context and custom hooks (`useAuth`, `useModules`, `usePermissions`, etc.).

## 2. Building and Running

The project uses `npm` for dependency management and running scripts.

*   **Install Dependencies:**
    ```bash
    npm install
    ```

*   **Run Development Server:**
    ```bash
    npm run dev
    ```

*   **Run on Local Network (for mobile testing):**
    ```bash
    npm run dev -- --host
    ```

*   **Build for Production:**
    ```bash
    npm run build
    ```

*   **Testing & Linting:**
    *   **TODO:** No explicit `lint`, `test`, or `typecheck` scripts are defined in `package.json`. These should be added to ensure code quality.

## 3. Development Conventions

Adherence to these conventions is critical for maintaining the integrity of the application.

### Multi-Tenancy and Data

*   **ALWAYS** assume Row-Level Security (RLS) is in effect.
*   Every database query **MUST** be filtered by the current user's `tenant_id`.
*   When adding new tables or queries, you **MUST** define and apply appropriate RLS policies to ensure data isolation.
*   Do not access data from one tenant while operating in another.

### Code and UI

*   **Mobile-First:** Always develop and test new components and UIs on a mobile viewport first, then ensure they scale correctly to desktop.
*   **Use Existing Components:** Leverage the `Design System` components from the `/src/components/ui/` directory whenever possible.
*   **State Management:** Use the existing custom hooks (`useAuth`, `useModules`, `usePermissions`, `useSettings`, `useNotifications`) for accessing and managing global state. Do not introduce new state management libraries without a compelling reason.
*   **Permissions:** All new features, modules, or UI elements that expose data or actions **MUST** be protected by the permissions system (`usePermissions` hook).

### Modularity

*   New core features should be developed as **Modules**.
*   Each module should declare its metadata (name, icon, permissions) in the `modulos` table.
*   Modules can expose `Widgets` for the desktop dashboard and `Actions` for the future AI Agent, which should be declared in a module manifest or database record.

### AI Agent Interaction (`CLAUDE.md`)

*   The `CLAUDE.md` file provides specific instructions for an AI assistant. Key takeaways include:
    *   The AI can be tasked with different roles (e.g., Frontend Developer, Backend Developer, Tech Lead).
    *   The AI should always respect the established architecture, especially multi-tenancy and mobile-first principles.
    *   The AI is expected to understand the project's context before making changes.
