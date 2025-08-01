# AI Chatbot Socket Project

## Overview

A real-time chat application built with modern web technologies, featuring both public and private messaging capabilities. The application uses WebSocket connections for instant communication and provides a responsive user interface.

## Architecture

**Backend (Node.js + Express + Socket.IO)**
- Real-time WebSocket communication using Socket.IO
- JSON-RPC protocol for structured messaging
- In-memory chat storage with user management
- Comprehensive logging system with Winston
- RESTful API endpoints

**Frontend (React + Vite + Tailwind CSS)**
- Modern React application with hooks and context
- Real-time UI updates via Socket.IO client
- Responsive design with Tailwind CSS
- Redux Toolkit for state management
- 3D graphics capabilities with Three.js

## Key Features

- **Real-time Messaging**: Instant public (all users connected) and private chat
- **User Management**: Online user tracking and registration
- **Multiple Chat Modes**: Public chat room and private conversations
- **Modern UI**: Clean, responsive interface with 3D elements
- **Data Persistence**: Chat history and user sessions
- **Logging**: Comprehensive application monitoring
- **Testing**: Unit tests for both frontend and backend

## Technology Stack

### Backend
- Node.js 22
- Express.js
- Socket.IO
- Winston (logging)
- JSON-RPC
- Mocha/Chai (testing)

### Frontend
- React 19
- Vite
- Tailwind CSS
- Redux Toolkit
- Socket.IO Client
- Three.js
- Vitest (testing)

## Project Structure

```
ai-chatbot-socket/
├── backend/          # Node.js server application
│   ├── src/         # Source code
│   ├── test/        # Backend tests
│   └── logs/        # Application logs
├── frontend/        # React client application
│   ├── src/         # Source code
│   ├── public/      # Static assets
│   └── dist/        # Build output
├── Dockerfile       # Container configuration
├── run.sh          # Development startup script
└── docker_run.sh   # Docker execution script
```

## Communication Protocol

The application uses JSON-RPC 2.0 over WebSocket for structured communication between client and server, enabling:
- User registration and authentication
- Message sending and receiving
- Chat history retrieval
- Online user management
- Data reset capabilities

## Development Features

- Hot reload for both frontend and backend
- Comprehensive error handling and validation
- Configurable logging levels
- Cross-origin resource sharing (CORS) support
- Container-ready deployment