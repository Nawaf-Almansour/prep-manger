# Prep Manager

A full-stack restaurant food preparation management system with task scheduling, inventory tracking, and real-time notifications.

## Tech Stack

### Frontend (`Prep-Manager-app/`)

- **Framework:** Next.js 15 with React 19
- **Styling:** Tailwind CSS 4
- **State Management:** Zustand, React Query
- **UI Components:** Radix UI, Lucide Icons
- **Internationalization:** next-intl (Arabic/English)
- **Real-time:** Socket.IO Client

### Backend (`prep-manger-backend/`)

- **Runtime:** Node.js with Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT with bcrypt
- **Real-time:** Socket.IO
- **Notifications:** Firebase Admin
- **Logging:** Winston

## Features

- 📋 **Task Management** - Create, assign, and track preparation tasks
- 📦 **Inventory Tracking** - Monitor stock levels and expiration dates
- 🍽️ **Product Management** - Manage menu items and recipes
- 👥 **User Management** - Role-based access control
- 📊 **Reports & Analytics** - Dashboard with insights
- 🔔 **Real-time Notifications** - Live updates via WebSocket
- 🌐 **Multi-language** - Arabic and English support

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- npm or yarn

### Backend Setup

```bash
cd prep-manger-backend
cp .env.example .env
npm install
npm run dev
```

### Frontend Setup

```bash
cd Prep-Manager-app
npm install
npm run dev
```

## Project Structure

```text
prep-manger/
├── Prep-Manager-app/     # Next.js frontend
│   ├── app/              # App router pages
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks
│   ├── store/            # Zustand stores
│   └── locales/          # i18n translations
│
└── prep-manger-backend/  # Express backend
    ├── src/
    │   ├── controllers/  # Route handlers
    │   ├── models/       # Mongoose schemas
    │   ├── routes/       # API routes
    │   ├── middleware/   # Auth, validation
    │   └── services/     # Business logic
    └── uploads/          # File uploads
```

## License

ISC
