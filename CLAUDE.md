# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hiko is an Nx monorepo containing a full-stack application for monitoring wallbox/charging station data. The project uses Angular for the frontend, Express with TypeScript for the backend, and shares types through a common API library.

## Architecture

The project follows a library-based architecture within an Nx monorepo, organized into apps and reusable libraries:

### Apps (Orchestration Layer)
- **apps/frontend/**: Angular 20 application using standalone components
- **apps/backend/**: Minimal Express.js bootstrap that wires together backend libraries

### Libraries (Business Logic)
- **libs/shared/api/**: Shared TypeScript types and interfaces (DTOs, models)
- **libs/backend/feature-wallbox/**: Wallbox domain logic (routes, services, repositories)
- **libs/backend/middleware/**: Shared backend services (logging, middleware)

### Key Architectural Patterns

- **Nx Workspace**: Monorepo with shared dependencies and build orchestration
- **Feature Modules**: Both frontend and backend organize code by features (e.g., wallbox)
- **Dependency Injection**: Backend uses TypeDI container for service management
- **Proxy Configuration**: Frontend proxies `/api` requests to backend during development

## Development Commands

### Build Commands
```bash
# Build all projects (respects dependency graph)
npx nx run-many --target=build

# Build specific project
npx nx build frontend
npx nx build backend
npx nx build api

# Build with dependencies
npx nx build frontend  # automatically builds api first
npx nx build backend   # automatically builds api first
```

### Development Servers
```bash
# Start frontend dev server (with proxy to backend)
npx nx serve frontend

# Start backend dev server
npx nx serve backend

# Run both concurrently
npx nx run-many --target=serve --parallel
```

### Testing
```bash
# Run all tests
npx nx run-many --target=test

# Run tests for specific project
npx nx test frontend
npx nx test backend
npx nx test api

# Run tests with coverage
npx nx test frontend --codeCoverage
```

### Linting
```bash
# Lint all projects
npx nx run-many --target=lint

# Lint specific project
npx nx lint frontend
```

### Single Test Execution
```bash
# Run specific test file
npx nx test frontend --testPathPattern=wallbox.component.spec.ts

# Run tests matching pattern
npx nx test backend --testNamePattern="WallboxService"
```

## Project Structure

### Apps
#### Frontend (apps/frontend/)
- `src/app/features/`: Feature-based components (wallbox, forecast, status)
- `src/app/core/`: Core utilities and pipes (hours-pipe)
- Standalone components with SCSS styling
- Uses Angular Material UI components

#### Backend (apps/backend/)
- `src/main.ts`: Application bootstrap that imports and registers libraries
- Minimal orchestration layer that wires together backend libraries

### Libraries
#### Shared API (libs/shared/api/)
- `src/lib/api.ts`: Common DTOs and interfaces
- Shared between frontend and backend for type safety
- Includes measurement units and data transfer objects

#### Backend Feature Wallbox (libs/backend/feature-wallbox/)
- Feature-based wallbox domain logic
- Routes, services, repositories for wallbox functionality
- Uses dependency injection pattern with Container from TypeDI

#### Backend Middleware (libs/backend/middleware/)
- `src/lib/logging/`: Winston logging service and middleware
- Shared backend services and utilities
- Cross-cutting concerns like request logging

## Environment Configuration

- Backend configuration via environment variables:
  - `BACKEND_HOST` (default: localhost)
  - `BACKEND_PORT` (default: 3000)
- Frontend proxy configured in `proxy.conf.json` for development

## TypeScript Path Mappings

The project uses TypeScript path mappings for clean imports across libraries:

```typescript
"@hiko/api": ["libs/shared/api/src/index.ts"]
"@hiko/backend-feature-wallbox": ["libs/backend/feature-wallbox/src/index.ts"]
"@hiko/backend-middleware": ["libs/backend/middleware/src/index.ts"]
```

This enables imports like:
- `import { WallboxDto } from '@hiko/api'`
- `import { WallboxService } from '@hiko/backend-feature-wallbox'`
- `import { LoggingService } from '@hiko/backend-middleware'`

## Build Dependencies

The project has explicit build dependencies configured in Nx:
- All backend libraries are built independently

## Testing Strategy

- **Frontend**: Jest with Angular testing utilities
- **Backend**: Jest with Node.js environment
- **API**: Jest for type validation and utility testing
- All projects use `passWithNoTests: true` configuration
- CI configuration includes code coverage reporting

## Key Technologies

- **Frontend**: Angular 20, Angular Material, SCSS, RxJS
- **Backend**: Express 4, TypeDI, Winston logging, reflect-metadata
- **Build**: Nx 21, esbuild (backend), Angular CLI (frontend)
- **Testing**: Jest 30, Angular testing utilities
- **Code Quality**: ESLint with Nx plugin, Prettier