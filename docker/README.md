# Docker Setup for AI Chatbot Socket Application

This document provides instructions for running the AI Chatbot Socket application using Docker.

## Overview

The application consists of:
- **Backend**: Node.js Express server with Socket.IO (Port 5000)
- **Frontend**: React application built with Vite (Port 3000)

Both services are containerized and managed using PM2 process manager.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, for easier management)

## Quick Start

### Using Docker Compose (Recommended)

1. **Build and start the application:**
   ```bash
   docker-compose up --build
   ```

2. **Run in detached mode:**
   ```bash
   docker-compose up -d --build
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Using Docker directly

1. **Build the image:**
   ```bash
   docker build -t ai-chatbot-socket .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 -p 5000:5000 ai-chatbot-socket
   ```

3. **Run in detached mode:**
   ```bash
   docker run -d -p 3000:3000 -p 5000:5000 --name ai-chatbot ai-chatbot-socket
   ```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Socket.IO**: ws://localhost:5000

## Environment Variables

You can customize the application behavior using environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node.js environment |
 (to edit `LOG_LEVEL` for `frontend` from .env.local and for `backend`, package.json, scripts written)
| `LOG_LEVEL` | `info` | Logging level (error, warn, info, debug) |
| `PORT` | `5000` | Backend server port |
| `FRONTEND_PORT` | `3000` | Frontend server port |

### Example with custom environment variables:

```bash
docker run -p 3000:3000 -p 5000:5000 \
  -e NODE_ENV=development \
  -e LOG_LEVEL=debug \
  ai-chatbot-socket
```

## Docker Compose Configuration

The `docker-compose.yml` includes:

- **Port mapping**: 3000 (frontend) and 5000 (backend)
- **Volume mounting**: Backend logs are persisted
- **Health checks**: Automated container health monitoring
- **Restart policy**: Containers restart unless manually stopped
- **Custom network**: Isolated network for the application

## Development vs Production

### Development
For development, it's recommended to run the services separately using:
```bash
# Backend
npm start --prefix backend

# Frontend  
npm run dev --prefix frontend
```

### Production
The Docker setup is optimized for production with:
- Multi-stage builds for smaller image size
- PM2 process manager for reliability
- Health checks for monitoring
- Optimized frontend build served by `serve`

## Troubleshooting

### Container won't start
1. Check if ports 3000 and 5000 are available:
   ```bash
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :5000
   ```

2. View container logs:
   ```bash
   docker logs <container-name>
   ```

### Health check failures
The health check pings the frontend on port 3000. If it fails:
1. Ensure the frontend is properly built and served
2. Check if the container has enough resources
3. Verify network connectivity

### Performance issues
If the application is slow:
1. Increase Docker Desktop memory allocation
2. Check host system resources
3. Monitor container resource usage:
   ```bash
   docker stats
   ```

## File Structure

```
ai-chatbot-socket/
├── Dockerfile              # Multi-stage build configuration
├── docker-compose.yml      # Container orchestration
├── .dockerignore           # Files to exclude from build
├── DOCKER.md              # This documentation
├── backend/               # Backend Node.js application
└── frontend/              # Frontend React application
```

## Advanced Usage

### Custom PM2 Configuration

The container uses PM2 with a generated ecosystem.config.json. To use a custom configuration:

1. Create your own `ecosystem.config.json`
2. Mount it in the container:
   ```bash
   docker run -v ./custom-ecosystem.config.json:/app/ecosystem.config.json ai-chatbot-socket
   ```

### Scaling

To run multiple instances:
```bash
docker-compose up --scale ai-chatbot=3
```

Note: You'll need to configure a load balancer for multiple instances.

### Monitoring

Access PM2 monitoring inside the container:
```bash
docker exec -it <container-name> pm2 monit
```

## Security Considerations

- The current CORS configuration allows all origins (`*`) - restrict this in production
- Consider using environment files for sensitive configuration
- Implement proper authentication and authorization
- Use HTTPS in production environments
- Regularly update base images and dependencies

## Support

For issues related to:
- Application bugs: Check the main README.md
- Docker setup: Review this document and container logs
- Performance: Monitor resource usage and logs