# Simple Dockerfile for AI Chatbot Socket Application
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package.json files
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies for both services
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/



# Expose ports
EXPOSE 5000 3000

# Install process manager to run both services
RUN npm install -g concurrently

# Run both backend and frontend
CMD ["concurrently", "npm start --prefix backend", "npm run dev --prefix frontend"]
