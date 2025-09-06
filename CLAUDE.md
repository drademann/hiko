# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hiko is an Nx monorepo containing a full-stack application for PV forecasts and monitoring wallbox/charging station data. 
The project uses Angular 20 for the frontend, Express with TypeScript for the backend, and shares types through common libraries.
Target system is a Raspberry Pi 5 with Touch Display 2 attached running in Kiosk mode. 
The resolution of the display is 1280x720.

## Architecture

The project follows a library-based architecture within an Nx monorepo, organized into apps and reusable libraries:

### Apps (Orchestration Layer)
- **apps/frontend/**: Angular 20 application using standalone components
- **apps/backend/**: Minimal Express.js bootstrap that wires together backend libraries

### Libraries (Business Logic)

#### Shared Libraries
- **libs/shared/api/**: Shared TypeScript types and interfaces (DTOs, models)
- **libs/shared/ui/**: Reusable UI components and pipes (e.g., hours-pipe)

#### Frontend Feature Libraries
- **libs/frontend/feature-dashboard/**: Dashboard feature module
- **libs/frontend/feature-forecast/**: PV forecast feature module
- **libs/frontend/feature-status/**: Status monitoring feature module
- **libs/frontend/feature-wallbox/**: Wallbox monitoring feature module with service integration

#### Backend Libraries
- **libs/backend/feature-wallbox/**: Wallbox domain logic (routes, services, repositories)
- **libs/backend/middleware/**: Shared backend services (logging, middleware)

### Key Architectural Patterns

- **Nx Workspace**: Monorepo with shared dependencies and build orchestration
- **Feature Modules**: Both frontend and backend organize code by features
- **Standalone Components**: Frontend uses Angular 20 standalone components
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

# Build a library
npx nx build frontend-feature-dashboard
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
npx nx test frontend-feature-wallbox

# Run tests with coverage
npx nx test frontend --codeCoverage

# Run tests in CI mode
npx nx test frontend --configuration=ci
```

### Linting
```bash
# Lint all projects
npx nx run-many --target=lint

# Lint specific project
npx nx lint frontend
npx nx lint frontend-feature-dashboard
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
- `src/app/app.routes.ts`: Main application routing configuration
- Standalone components with SCSS styling
- Uses Angular Material UI components

#### Backend (apps/backend/)
- `src/main.ts`: Application bootstrap that imports and registers libraries
- Minimal orchestration layer that wires together backend libraries

### Libraries
Each library follows Nx conventions with:
- `src/index.ts`: Public API exports
- `project.json`: Nx project configuration
- `jest.config.ts`: Test configuration
- `tsconfig.*.json`: TypeScript configurations

## Environment Configuration

- Backend configuration via environment variables:
  - `BACKEND_HOST` (default: 0.0.0.0)
  - `BACKEND_PORT` (default: 3000)
- Frontend proxy configured in `proxy.conf.json` for development

## TypeScript Path Mappings

The project uses TypeScript path mappings for clean imports across libraries:

```typescript
"@hiko/api": ["libs/shared/api/src/index.ts"]
"@hiko/shared-ui": ["libs/shared/ui/src/index.ts"]
"@hiko/backend-feature-wallbox": ["libs/backend/feature-wallbox/src/index.ts"]
"@hiko/backend-middleware": ["libs/backend/middleware/src/index.ts"]
"@hiko/frontend-feature-dashboard": ["libs/frontend/feature-dashboard/src/index.ts"]
"@hiko/frontend-feature-forecast": ["libs/frontend/feature-forecast/src/index.ts"]
"@hiko/frontend-feature-status": ["libs/frontend/feature-status/src/index.ts"]
"@hiko/frontend-feature-wallbox": ["libs/frontend/feature-wallbox/src/index.ts"]
```

This enables imports like:
- `import { WallboxDto } from '@hiko/api'`
- `import { HoursPipe } from '@hiko/shared-ui'`
- `import { WallboxComponent } from '@hiko/frontend-feature-wallbox'`

## Build Dependencies

The project uses Nx's dependency graph to ensure correct build order:
- Frontend and backend apps depend on shared libraries
- Feature libraries can depend on shared libraries
- All projects using `@hiko/api` will rebuild when API changes

## Testing Strategy

- **Frontend**: Jest with Angular testing utilities
- **Backend**: Jest with Node.js environment
- All projects configured with `passWithNoTests: true`
- CI configuration includes code coverage reporting

## Key Technologies

- **Frontend**: Angular 20, Angular Material, SCSS, RxJS, dayjs
- **Backend**: Express 4, TypeDI, Winston logging, reflect-metadata
- **Build**: Nx 21, esbuild (backend), Angular CLI (frontend)
- **Testing**: Jest 30, Angular testing utilities
- **Code Quality**: ESLint with Nx plugin, Prettier