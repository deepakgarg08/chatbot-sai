# AI Chatbot Socket

A real-time chat application with WebSocket communication, featuring public and private messaging.

## Quick Start

### Without Docker (Development)
```bash
# Install dependencies and run both services
./run.sh
```

### With Docker

**Universal (recommended):**
```bash
./run_docker.sh
```

**Manual (platform-specific):**
```bash
# Linux/Mac
cd docker && ./docker_run.sh

# Windows Command Prompt
cd docker && docker_run.bat

# Windows PowerShell
cd docker && .\docker_run.ps1
```

## Manual Setup

### Prerequisites
- Node.js 22+
- npm

### Installation
```bash
# Backend
cd backend && npm install

# Frontend  
cd frontend && npm install
```

### Running Services

**Option 1: Using script**
```bash
./run.sh
```

**Option 2: Manual**
```bash
# Terminal 1 - Backend
npm start --prefix backend

# Terminal 2 - Frontend
npm run dev --prefix frontend
```

## Access

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## Features

- Real-time public chat
- Private messaging
- Online user tracking
- Chat history
- Modern React UI
- Socket.IO communication

## Tech Stack

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: React, Vite, Tailwind CSS
- **Protocol**: JSON-RPC over WebSocket

## Testing

```bash
# Backend tests
npm test --prefix backend

# Frontend tests
npm test --prefix frontend
```

For detailed project information, see [Project.md](Project.md).