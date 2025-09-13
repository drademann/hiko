# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hiko is an Nx monorepo containing a full-stack application for PV forecasts and monitoring wallbox/charging station data. 
The project uses Angular 20 for the frontend, Express with TypeScript for the backend, and shares types through common libraries.
The application is deployed on a Raspberry Pi 5 with 4 GB RAM, in a Docker environment. 
Display targets are:

- Raspberry Touch Display 2 running the app in Chromium in Kiosk mode (resolution 1280x720).
- Mobile devices in portrait or landscape mode (e.g., iPhone 13 Pro Max).
- Any other device like Desktop or Tablet browsers.

## Architecture

The project follows a library-based architecture within an Nx monorepo, organized into apps and reusable libraries:

### Apps (Orchestration Layer)
- **apps/frontend/**: Angular 20 application using standalone components
- **apps/backend/**: Express.js application that wires together backend libraries (uses esbuild with CommonJS format)

### Libraries (Business Logic)

#### Shared Libraries (Non-buildable)
- **libs/shared/api/**: Shared TypeScript types and interfaces (DTOs, models)
- **libs/shared/ui/**: Reusable UI components and pipes (e.g., hours-pipe)

#### Frontend Feature Libraries (Non-buildable)
- **libs/frontend/feature-dashboard/**: Dashboard feature module
- **libs/frontend/feature-forecast/**: PV forecast feature module
- **libs/frontend/feature-status/**: Status monitoring feature module
- **libs/frontend/feature-wallbox/**: Wallbox monitoring feature module with service integration

#### Backend Libraries (Buildable with @nx/js:tsc)
- **libs/backend/feature-wallbox/**: Wallbox domain logic (routes, services, repositories)
- **libs/backend/middleware/**: Shared backend services (logging, middleware)

### Key Architectural Patterns

- **Nx Workspace**: Monorepo with shared dependencies and build orchestration
- **Feature Modules**: Both frontend and backend organize code by features
- **Standalone Components**: Frontend uses Angular 20 standalone components
- **Proxy Configuration**: Frontend proxies `/api` requests to backend during development (apps/frontend/proxy.conf.json)

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

# Run both concurrently with development configuration
npx nx run-many --targets=serve --projects=backend,frontend -c development
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

### Code Quality
```bash
# Lint all projects
npx nx run-many --target=lint

# Lint specific project
npx nx lint frontend
npx nx lint frontend-feature-dashboard

# Run lint and fix issues
npx nx lint frontend --fix

# Format code with Prettier
npx prettier --write .

# Check formatting
npx prettier --check .
```

### Single Test Execution
```bash
# Run specific test file
npx nx test frontend --testPathPattern=wallbox.component.spec.ts

# Run tests matching pattern
npx nx test backend --testNamePattern="WallboxService"

# Run tests in watch mode
npx nx test frontend --watch

# Run a single test suite
npx nx test frontend --testFile=src/app/components/wallbox/wallbox.component.spec.ts
```

### Nx Utilities
```bash
# Show project graph
npx nx graph

# Show affected projects
npx nx affected:graph

# List all projects
npx nx list

# Reset Nx cache
npx nx reset

# Run command for affected projects only
npx nx affected --target=test
npx nx affected --target=build
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

### Development Environment (.env file)
```bash
# Server configuration
BACKEND_HOST=localhost        # Host for backend server
BACKEND_PORT=3000             # Port for backend server

# Environment
NODE_ENV=development          # development | production
LOG_LEVEL=debug               # debug | info | warn | error

# Wallbox
WALLBOX_HOST=xxx.xxx.xxx.xxx  # IP address of wallbox device
```

### Frontend Proxy
- Frontend proxy configured in `apps/frontend/proxy.conf.json` for development
- Routes `/api` requests to `http://localhost:3000`

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
- **Backend**: Express 4, Winston logging
- **Build**: Nx 21, esbuild (backend), Angular CLI (frontend)
- **Testing**: Jest 30, Angular testing utilities
- **Code Quality**: ESLint with Nx plugin, Prettier
- **Deployment**: Docker multi-platform builds (amd64/arm64), Docker Compose, Nginx

## Deployment

The application is deployed to Raspberry Pi using Docker:
- Multi-platform images built with buildx
- Local Docker registry for image distribution
- See `ops/DEPLOYMENT.md` for detailed deployment instructions
- Production compose file: `docker-compose.prod.yml`
- Build script: `ops/scripts/build-and-push.sh`