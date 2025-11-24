# Notion ⇄ Zoho Cliq Integration

## Overview

This integration connects Notion workspaces with Zoho Cliq, enabling teams to manage tasks, search documents, and access Notion content directly from their Cliq workspace. The application features an interactive dashboard widget, task management, document search, activity tracking, and automated reminders.

Built as a full-stack TypeScript application using React for the frontend and Express for the backend, this integration demonstrates modern web development patterns with a focus on productivity tools and team collaboration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tools:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query for server state management and caching

**UI Component System:**
- Shadcn/ui components built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Design system inspired by Notion, Linear, and Slack
- Inter font for UI text, JetBrains Mono for technical details
- Dark mode support with system preference detection

**State Management:**
- TanStack Query for API data fetching, caching, and mutations
- React hooks for local component state
- Theme context for light/dark mode preferences

**Widget Dashboard:**
The main interface is organized into tabs (Overview, Tasks, Documents, Search, Activity, Settings) with real-time data visualization, filtering, and sorting capabilities.

### Backend Architecture

**Runtime & Framework:**
- Node.js 20+ with Express.js
- TypeScript for type safety across the entire stack
- ESM modules for modern JavaScript features

**Database Layer:**
- PostgreSQL database (provisioned via Replit)
- Drizzle ORM for type-safe database operations
- Connection pooling via @neondatabase/serverless
- Schema-first design with migrations

**Data Models:**
- `cliqUsers`: Stores Zoho Cliq user information and connections
- `notionTokens`: OAuth tokens for Notion API access (workspace-level)
- `mappings`: Links Cliq messages/channels to Notion pages
- `notificationSettings`: User preferences for reminders and notifications
- `activityLog`: Tracks all user interactions for analytics

**API Structure:**
RESTful endpoints for:
- Connection management (`/api/connection/*`)
- Task operations (`/api/tasks/*`)
- Document retrieval (`/api/documents/*`)
- Search functionality (`/api/search`)
- Activity logging (`/api/activity/*`)
- Settings management (`/api/settings/*`)

### Authentication Model

**Shared Workspace Approach:**
- Single Notion workspace connected at the application level via Replit's Notion connector
- All Cliq users interact with the same shared Notion workspace
- User identity mapping tracks which Cliq user performs each action
- Simplified OAuth flow leveraging Replit's connector infrastructure

**Rationale:**
This approach prioritizes rapid development and team collaboration over per-user OAuth. It's ideal for teams that share a single Notion workspace. The architecture document (`ARCHITECTURE.md`) outlines the alternative per-user OAuth implementation path for future multi-tenant support.

### External Dependencies

**Third-Party Services:**
- **Notion API** (`@notionhq/client`): Primary integration for reading/writing Notion pages, databases, and tasks
- **Zoho Cliq**: Target platform for the widget and message actions (bot token required for production)
- **Replit Connectors**: Handles Notion OAuth flow in the current implementation

**Database:**
- **PostgreSQL**: Primary data store via Neon serverless connection
- Schema managed through Drizzle ORM with migration support

**Key NPM Packages:**
- `@notionhq/client`: Official Notion JavaScript SDK
- `drizzle-orm` + `drizzle-kit`: Type-safe ORM and migration tools
- `@neondatabase/serverless`: PostgreSQL connection with WebSocket support
- `node-cron`: Scheduled task reminders
- `express`: Web server framework
- `@tanstack/react-query`: Client-side data fetching
- `@radix-ui/*`: Headless UI component primitives

**Development Tools:**
- Vite with HMR for fast development cycles
- TypeScript for compile-time type checking
- Tailwind CSS for utility-first styling
- Custom Replit plugins for runtime error overlay and dev banner

**Scheduled Jobs:**
A cron scheduler (`server/cron/reminders.ts`) runs hourly to check for upcoming task due dates and send notifications to Cliq users based on their notification preferences.