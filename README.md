# LifeGem Frontend

> AI-powered medical simulation platform train as a doctor against realistic, AI-generated patients in real time.

LifeGem is a clinical training simulator. A user picks a medical specialty, and an LLM generates a unique patient with a hidden condition, vitals, history and allergies. Over a live WebSocket chat, the user examines and talks to the patient, then commits to a final diagnosis. The AI then grades the session did the patient survive, was the diagnosis correct, and what could have been done better and persists the result so users can track their progress over time.

This repository is the web client: a Vue 3 single-page application that handles authentication, the simulation dashboard, the live patient chat, and the user's session history and performance reports.

---

## Features

- **Live patient simulations** over WebSockets (Socket.IO) start a session, chat with an AI patient in real time, watch vitals and a running accuracy score, submit a diagnosis, and end the session for a graded review.
- **Specialty dashboard** pick from Traumatology, Cardiology and Emergency Medicine, each with its own topics, difficulty and estimated duration.
- **JWT authentication** with in-memory access tokens and silent refresh via an `httpOnly` refresh cookie; transparent retry of failed requests after a token refresh.
- **Route guards** authenticated-only routes and guest-only auth pages handled by Vue Router navigation guards.
- **Performance tracking** dashboard insights and stat cards for completed simulations, average score, survival rate and correct-diagnosis rate.
- **Session history** browse past sessions, view a score-trend chart, and open a detail modal with the full AI review per session.
- **Reactive state** centralized auth state with Pinia and composables for users, sessions and the live chat.
- **Utility-first styling** with Tailwind CSS 4.

---

## Tech Stack

| Layer            | Technology                                            |
| ---------------- | ----------------------------------------------------- |
| Language         | TypeScript                                            |
| Framework        | [Vue 3](https://vuejs.org) (`<script setup>` SFCs)    |
| Build tool       | [Vite 7](https://vite.dev)                            |
| Routing          | [Vue Router 5](https://router.vuejs.org)              |
| State management | [Pinia 3](https://pinia.vuejs.org)                    |
| Styling          | [Tailwind CSS 4](https://tailwindcss.com)             |
| HTTP client      | [Axios](https://axios-http.com)                       |
| Realtime         | [Socket.IO client](https://socket.io)                 |
| Type checking    | `vue-tsc`                                             |
| Package manager  | pnpm                                                  |

---

## Requirements

Make sure the following are installed before you start:

- **[Node.js](https://nodejs.org/)** v20 or later (matches `@types/node`)
- **[pnpm](https://pnpm.io/installation)** v9 or later (`npm install -g pnpm`)
- A running **[LifeGem backend](https://github.com/Guraspinho/lifegem-backend)** instance for the REST API and WebSocket gateway (defaults to `http://localhost:3000`)

---

## Getting Started

### 1. Clone & install dependencies

```bash
git clone git@github.com:Guraspinho/lifegem-frontend.git
cd lifegem-frontend
pnpm install
```

### 2. Configure environment variables

Create a `.env` file in the project root and fill in the values:

| Variable             | Description                                                                          | Example                       |
| -------------------- | ------------------------------------------------------------------------------------ | ----------------------------- |
| `VITE_API_BASE_URL`  | Base URL for the backend REST API (defaults to `/api`)                               | `http://localhost:3000`       |
| `VITE_WS_URL`        | _(optional)_ WebSocket URL for the simulation gateway (falls back to `VITE_API_BASE_URL`, then `http://localhost:3000`) | `http://localhost:3000` |

All client-side environment variables must be prefixed with `VITE_` to be exposed to the app.

### 3. Run the dev server

```bash
pnpm dev
```

Vite starts the dev server on [http://localhost:5173](http://localhost:5173) by default. Make sure the backend allows this origin via its `FRONTEND_URL` CORS setting.

### 4. Build for production

```bash
pnpm build

pnpm preview
```

`pnpm build` type-checks with `vue-tsc` and emits the production bundle to `dist/`. `pnpm preview` serves the built output locally.

---

## Backend Integration

The client talks to the LifeGem backend over two channels:

### REST (Axios)

Requests go through a shared Axios instance with `withCredentials` enabled. An access token is held in memory and attached as a `Bearer` header. On a `401`, the client silently calls `/auth/refresh` (using the `httpOnly` refresh cookie), retries the original request once, and on failure clears the session and redirects to login.

| Method | Path                  | Description                                          |
| ------ | --------------------- | ---------------------------------------------------- |
| `POST` | `/auth/register`      | Register a new user                                  |
| `POST` | `/auth/login`         | Log in; returns an access token + refresh cookie     |
| `POST` | `/auth/refresh`       | Rotate the access token                              |
| `POST` | `/auth/logout`        | Log out and clear the refresh cookie                 |
| `GET`  | `/user`               | Get the authenticated user's profile & stats         |
| `GET`  | `/user/sessions`      | List the user's sessions (cursor paginated)          |
| `GET`  | `/user/sessions/:id`  | Get a single session with its AI review & history    |

### WebSocket (Socket.IO)

The simulation connects with an access token in the handshake query (`auth`). The chat composable then drives the session:

| Event              | Direction       | Purpose                                            |
| ------------------ | --------------- | -------------------------------------------------- |
| `start_session`    | client → server | Start a new simulation for a chosen specialty      |
| `chat_message`     | client → server | Send a message to the AI patient                   |
| `final_diagnosis`  | client → server | Submit the final diagnosis                         |
| `session_end`      | client → server | End the session and trigger the AI review          |
| `session:start`    | server → client | Patient generated and ready                        |
| `message:done`     | server → client | Patient reply, updated vitals and accuracy score   |
| `session:end`      | server → client | Final graded AI review                             |
| `error`            | server → client | Server-side error during the session               |

---

## Project Structure

```
src/
├── main.ts                  # App bootstrap (Pinia, router, session restore)
├── App.vue                  # Root component
├── style.css                # Tailwind entry & global styles
├── api/                     # Backend integration
│   ├── axios.ts             # Axios instance, auth header, refresh & retry
│   ├── auth.service.ts      # Auth REST calls
│   ├── user.service.ts      # User & session REST calls
│   └── chat.socket.ts       # Socket.IO client factory
├── router/                  # Routes & navigation guards
├── stores/                  # Pinia stores (auth)
├── composables/             # useAuth, useUser, useUserSessions, useChatSession
├── views/                   # Routed pages (Home, Login, Register, Sessions, Simulation)
├── components/              # UI components
│   ├── auth/                # Login & register forms
│   ├── dashboard/           # Specialty cards, stats, insights
│   ├── sessions/            # Session cards, detail modal, trend chart
│   ├── simulation/          # Chat panel, patient panel, results & review
│   └── common/              # Shared layout (footer)
├── data/                    # Static specialty & simulation data
├── types/                   # Shared TypeScript types
└── utils/                   # Validators & session helpers
```

---

## Useful Scripts

| Script         | Description                                       |
| -------------- | ------------------------------------------------- |
| `pnpm dev`     | Run the Vite dev server in watch mode             |
| `pnpm build`   | Type-check with `vue-tsc` and build for production |
| `pnpm preview` | Serve the production build locally                |

---

## License

This project is **UNLICENSED**.
