# Docker Setup Guide

This project includes Docker configuration for running all services in containers.

## Prerequisites

- Docker and Docker Compose installed
- At least 4GB of available RAM

## Quick Start

1. **Create a `.env` file** in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/drawapp
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=drawapp
POSTGRES_PORT=5432

# JWT Secret (change this in production!)
JWT_SECRET=your-secret-key-change-in-production

# API URLs (for frontend apps)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# Node Environment
NODE_ENV=production
```

2. **Build and start all services:**

```bash
docker-compose up --build
```

3. **Access the applications:**

- Web App: http://localhost:3000
- Excalidraw Frontend: http://localhost:3002
- HTTP Backend API: http://localhost:3001
- WebSocket Backend: ws://localhost:8080

## Services

The Docker setup includes the following services:

- **postgres**: PostgreSQL database (port 5432)
- **http-backend**: Express.js REST API (port 3001)
- **ws-backend**: WebSocket server (port 8080)
- **web**: Next.js web application (port 3000)
- **excalidraw-frontend**: Next.js Excalidraw frontend (port 3002)

## Useful Commands

### Start services in detached mode:
```bash
docker-compose up -d
```

### View logs:
```bash
docker-compose logs -f
```

### View logs for a specific service:
```bash
docker-compose logs -f http-backend
```

### Stop all services:
```bash
docker-compose down
```

### Stop and remove volumes (clears database):
```bash
docker-compose down -v
```

### Rebuild a specific service:
```bash
docker-compose build http-backend
docker-compose up -d http-backend
```

### Run database migrations:
```bash
docker-compose exec http-backend sh -c "cd /app/packages/db && pnpm prisma migrate deploy"
```

## Development

For development, you may want to mount volumes to enable hot-reloading:

```yaml
# Add to docker-compose.yml services (development only)
volumes:
  - ./apps/http-backend/src:/app/apps/http-backend/src
```

## Production Considerations

1. **Change default passwords**: Update `POSTGRES_PASSWORD` and `JWT_SECRET` in production
2. **Use environment-specific URLs**: Update `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` for your domain
3. **Enable SSL/TLS**: Use a reverse proxy (nginx, Traefik) for HTTPS
4. **Database backups**: Set up regular backups for the PostgreSQL volume
5. **Resource limits**: Add resource limits to docker-compose.yml for production

## Troubleshooting

### Database connection errors:
- Ensure PostgreSQL container is healthy: `docker-compose ps`
- Check DATABASE_URL matches the postgres service configuration

### Port conflicts:
- Change port mappings in docker-compose.yml if ports are already in use

### Build failures:
- Clear Docker cache: `docker-compose build --no-cache`
- Ensure all dependencies are properly listed in package.json files




