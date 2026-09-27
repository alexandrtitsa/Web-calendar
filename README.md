# Web Calendar Application

A production-ready, full-stack Web Calendar application designed for scheduling, organizing, and tracking events. Built with a modern TypeScript stack, the project demonstrates scalable architectural patterns by combining **Feature-Sliced Design (FSD)** on the client and a **Layered Architecture (Controller-Service-Repository)** on the server.

---

## Key Features

- **Interactive Event Management**: Create, update, filter, and delete calendar events and schedules.
- **Multiple Views**: Seamlessly switch between daily, weekly, and monthly calendar layouts.
- **Optimistic UI Updates**: Instant interface feedback powered by TanStack Query and Zustand.
- **Robust Type Safety**: Strict TypeScript interfaces across both client and server boundaries, using Zod for runtime schema validation.
- **Embedded Database**: Fast and reliable local storage using `better-sqlite3`.

---

## Tech Stack

### Client
* **Framework**: React 18, TypeScript, Vite
* **Architecture**: Feature-Sliced Design (FSD)
* **State Management**: Zustand (UI state), TanStack Query v5 (server state)
* **Styling**: SCSS Modules, Dart Sass (BEM methodology)
* **Testing**: Vitest, React Testing Library

### Server
* **Runtime**: Node.js, Express, TypeScript
* **Architecture**: Layered Architecture (Controller-Service-Repository)
* **Database**: SQLite (`better-sqlite3`)
* **Validation**: Zod
* **Execution**: `tsx` (live reload development execution)

### Monorepo & Tooling
* **Orchestration**: `concurrently`
* **Linting & Formatting**: ESLint, Prettier

---

## Architecture Overview

web-calendar/
├── client/                     # Front-end React Application
│   └── src/
│       ├── app/                # Application initialization, providers, global styles
│       ├── pages/              # Route views (e.g., CalendarPage)
│       ├── widgets/            # Complex combined UI sections (Header, Sidebar, Grid)
│       ├── features/           # User actions (CreateEvent, FilterCalendar)
│       ├── entities/           # Business entities (Event, Calendar model & UI)
│       └── shared/             # Reusable UI primitives, API hooks, utilities
│
└── server/                     # Back-end Express REST API
└── src/
├── controllers/        # Request handling and HTTP response mapping
├── services/           # Business logic execution
├── repositories/       # Direct SQLite database access queries
├── db/                 # Database connection & schema migration scripts
└── middleware/         # Error handling and validation middlewares

---

## Getting Started

### Prerequisites

* **Node.js**: `v18.x` or higher
* **npm**: `v9.x` or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone [https://github.com/your-username/web-calendar.git](https://github.com/your-username/web-calendar.git)
   cd web-calendar
1.Install root dependencies:

Bash
npm install
2.Install workspace dependencies:

Bash
npm install --prefix client
npm install --prefix server

Running the Application
To run both the React front-end (http://localhost:5173) and the Express back-end (http://localhost:5001) concurrently:

Bash
npm run dev
- Individual Scripts
Run client only:

Bash
npm run dev:client
Run server only:

Bash
npm run dev:server
Execute unit/component tests:

Bash
npm run test --prefix client
- API Endpoints
Method	Endpoint	Description
GET	/api/calendars	Retrieve all user calendars
POST	/api/calendars	Create a new calendar
GET	/api/events	Fetch events with date range filtering
POST	/api/events	Create a new event
PUT	/api/events/:id	Update an existing event
DELETE	/api/events/:id	Remove an event
- License
This project is licensed under the ISC License.
