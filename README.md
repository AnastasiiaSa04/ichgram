# Instagram Clone - Full Stack Application

Monorepo with backend API and frontend application for Instagram-like social network.

## 📦 Project Structure

- `apps/backend` - Node.js + TypeScript + Express API
- `apps/frontend` - React + TypeScript + Vite (in development)
- `packages/shared-types` - Shared TypeScript types

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm 9+

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd instagram-clone
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
# Backend
cp apps/backend/.env.example apps/backend/.env.development
```

4. Start with Docker Compose
```bash
npm run docker:dev
```

5. Or run locally
```bash
npm run dev
```

## 📝 Available Commands

### Development
```bash
npm run dev                 # Run backend and frontend
npm run dev:backend         # Backend only
npm run dev:frontend        # Frontend only
```

### Build
```bash
npm run build               # Build all apps
npm run build:backend       # Backend only
npm run build:frontend      # Frontend only
```

### Testing
```bash
npm test                    # Run all tests
npm run test:backend        # Backend tests
npm run test:frontend       # Frontend tests
```

### Linting
```bash
npm run lint                # Check code
npm run lint:fix            # Fix issues
npm run format              # Format code
```

## 🌐 URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: mongodb://localhost:27017

## 🧪 Tech Stack

### Backend
- Node.js + TypeScript
- Express.js
- MongoDB + Mongoose
- Socket.io
- JWT Authentication

### Frontend
- React 18 + TypeScript
- Vite
- React Router
- Zustand
- Socket.io Client

## 📄 License

MIT
