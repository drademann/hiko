# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hiko is an Nx monorepo containing a full-stack application for monitoring wallbox/charging station data. The project uses Angular for the frontend, Express with TypeScript for the backend, and shares types through a common API library.

## Architecture

The project follows a feature-based architecture across three main packages:

- **frontend/**: Angular 20 application using standalone components
- **backend/**: Express.js server with TypeScript, using dependency injection via TypeDI
- **api/**: Shared TypeScript types and interfaces (DTOs, models)

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

### Frontend (Angular)
- `src/app/features/`: Feature-based components (wallbox, forecast, status)
- `src/app/core/`: Core utilities and pipes (hours-pipe)
- Standalone components with SCSS styling
- Uses Angular Material UI components

### Backend (Express + TypeDI)
- `src/features/`: Feature-based modules with routes, services, repositories
- `src/core/`: Shared services (logging, middleware)
- Dependency injection pattern with Container from TypeDI
- Winston logging with structured logs

### API (Shared Types)
- `src/lib/api.ts`: Common DTOs and interfaces
- Shared between frontend and backend for type safety
- Includes measurement units and data transfer objects

## Environment Configuration

- Backend configuration via environment variables:
  - `BACKEND_HOST` (default: localhost)
  - `BACKEND_PORT` (default: 3000)
- Frontend proxy configured in `proxy.conf.json` for development

## Build Dependencies

The project has explicit build dependencies configured in Nx:
- Frontend depends on API build completion
- Backend depends on API build completion
- This ensures shared types are built before dependent projects

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