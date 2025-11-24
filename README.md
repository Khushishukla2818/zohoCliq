# Notion ⇄ Zoho Cliq Integration

A powerful, enterprise-grade integration that brings Notion's productivity features directly into Zoho Cliq. Manage your Notion workspace, create tasks, search documents, and track activity without leaving your team chat.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)

## ✨ Features

### 📊 Interactive Dashboard
- **Overview Tab**: Real-time stats with task completion rates, activity trends, and productivity metrics
- **Visual Analytics**: Beautiful charts showing task distribution and activity over time
- **Dark Mode Support**: Seamless light/dark theme switching with system preference detection

### ✅ Task Management
- **Smart Filters**: Search, filter by status, and sort tasks by multiple criteria
- **Real-time Updates**: Instant task status changes synced with Notion
- **Quick Actions**: Floating action button for rapid task and note creation
- **Keyboard Shortcuts**: Power-user features for maximum productivity

### 📄 Document Access
- **Recent Documents**: Quick access to your latest Notion pages
- **Rich Previews**: Document titles, icons, and last edit timestamps
- **Direct Links**: One-click navigation to Notion pages

### 🔍 Powerful Search
- **Unified Search**: Find tasks, pages, and databases across your Notion workspace
- **Real-time Results**: Instant search as you type
- **Type Indicators**: Clear visual distinction between different content types

### 📈 Activity Feed
- **Timeline View**: Chronological history of all interactions
- **Rich Activity Types**: Track task creation, updates, document access, and more
- **Activity Insights**: Understand your team's Notion usage patterns

### ⚙️ Settings & Preferences
- **Notification Controls**: Customize reminder settings
- **Workspace Info**: View connected Notion workspace details
- **Easy Disconnection**: Secure account management

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- Notion account
- Zoho Cliq account (for production deployment)
- PostgreSQL database (automatically provisioned on Replit)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd notion-cliq-integration
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with the following:
   ```env
   DATABASE_URL=<your-postgres-connection-string>
   NODE_ENV=development
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open http://localhost:5000 in your browser

## 📁 Project Structure

```
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/          # Shadcn UI primitives
│   │   │   └── widget/      # Business components
│   │   ├── pages/           # Application pages
│   │   ├── lib/             # Utilities and helpers
│   │   └── hooks/           # Custom React hooks
│   └── public/              # Static assets
├── server/                  # Backend Express application
│   ├── routes.ts            # API route handlers
│   ├── storage.ts           # Database abstraction layer
│   ├── services/            # Business logic services
│   │   ├── notion-service.ts
│   │   └── cliq-service.ts
│   └── cron/                # Scheduled tasks
├── shared/                  # Shared types and schemas
│   └── schema.ts            # Drizzle ORM schema + Zod validation
└── ARCHITECTURE.md          # Detailed architecture documentation
```

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Wouter for routing
- TanStack Query for data fetching
- Shadcn UI + Tailwind CSS for styling
- Recharts for data visualization

**Backend:**
- Express.js with TypeScript
- Drizzle ORM with PostgreSQL
- Notion SDK
- Node-cron for scheduled tasks

**Database:**
- PostgreSQL (Neon-backed on Replit)
- Drizzle for type-safe queries
- Automated migrations with drizzle-kit

### Key Design Decisions

1. **Type Safety**: Full TypeScript coverage with shared schemas between frontend and backend
2. **Modern UI**: Shadcn UI components for consistency and accessibility
3. **Real-time Feel**: Optimistic updates and instant cache invalidation
4. **Scalable Architecture**: Clean separation of concerns with service layer pattern
5. **Security First**: Environment-based secrets, CORS protection, input validation

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## 🔐 Security

- OAuth 2.0 token management
- Encrypted token storage
- CORS protection
- Input sanitization and validation
- Rate limiting (production ready)
- Environment variable protection

## 🧪 Testing

The application includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📚 API Documentation

### Core Endpoints

#### Connection Management
- `GET /api/connection/status` - Check Notion connection status
- `GET /api/auth/notion/start` - Initiate Notion OAuth flow
- `POST /api/auth/notion/disconnect` - Disconnect Notion account

#### Tasks
- `GET /api/tasks` - Fetch all tasks
- `PATCH /api/tasks/:id` - Update task status
- `POST /api/tasks` - Create new task

#### Documents
- `GET /api/docs` - Fetch recent documents

#### Search
- `GET /api/search/:query` - Search across Notion workspace

#### Activity
- `GET /api/activity` - Fetch activity feed

#### Settings
- `GET /api/settings` - Get notification preferences
- `PATCH /api/settings` - Update notification settings

See [API_DOCS.md](./API_DOCS.md) for complete API documentation.

## 🎨 Design System

The application follows a modern, productivity-focused design system:

- **Typography**: Inter for UI, JetBrains Mono for code
- **Spacing**: Tailwind's spacing scale (4, 6, 8, 12, 16px)
- **Colors**: Professional blue primary with accessible contrast ratios
- **Components**: Shadcn UI for consistency and accessibility
- **Animations**: Subtle, purposeful micro-interactions

See [design_guidelines.md](./design_guidelines.md) for complete design documentation.

## 🚢 Deployment

### Replit (Recommended)

1. Import the project to Replit
2. Add your environment variables in Secrets
3. Run `npm run db:push` to initialize the database
4. Click "Run" to start the application

### Traditional Hosting

1. Build the application:
   ```bash
   npm run build
   ```

2. Set environment variables on your hosting platform

3. Start the production server:
   ```bash
   npm start
   ```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Notion API](https://developers.notion.com) for excellent API documentation
- [Shadcn UI](https://ui.shadcn.com) for beautiful, accessible components
- [Recharts](https://recharts.org) for powerful data visualization
- The Replit community for inspiration and support

## 📧 Support

For questions or issues:
- Open an issue on GitHub
- Check the [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Review the [design_guidelines.md](./design_guidelines.md) for UI/UX questions

---

**Built with ❤️ for productivity enthusiasts**
