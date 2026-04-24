# Task Manager API

A production-ready RESTful API for task management, featuring JWT authentication, full CRUD operations, and automated deployment to AWS EC2 via GitHub Actions.

## Architecture

```
┌─────────────┐     HTTPS      ┌──────────────────────────────────┐
│   Client    │ ─────────────► │         AWS EC2 Instance          │
└─────────────┘                │                                    │
                               │  ┌─────────┐    ┌─────────────┐  │
                               │  │  Nginx  │───►│  Node.js    │  │
                               │  │ (proxy) │    │  Express    │  │
                               │  └─────────┘    └──────┬──────┘  │
                               │                        │          │
                               │                 ┌──────▼──────┐  │
                               │                 │   MongoDB   │  │
                               │                 └─────────────┘  │
                               └──────────────────────────────────┘

CI/CD:  GitHub Push → GitHub Actions → Tests → Docker Build → EC2 Deploy
```

## Tech Stack

| Layer         | Technology                        |
|---------------|-----------------------------------|
| Runtime       | Node.js 20 + Express              |
| Database      | MongoDB 7 + Mongoose              |
| Auth          | JSON Web Tokens (JWT)             |
| Containers    | Docker + Docker Compose           |
| CI/CD         | GitHub Actions                    |
| Cloud         | AWS EC2                           |
| Reverse Proxy | Nginx                             |

## API Endpoints

### Auth
| Method | Endpoint              | Description          | Auth required |
|--------|-----------------------|----------------------|---------------|
| POST   | `/api/auth/register`  | Register new user    | No            |
| POST   | `/api/auth/login`     | Login and get token  | No            |
| GET    | `/api/auth/me`        | Get current user     | Yes           |

### Tasks
| Method | Endpoint          | Description              | Auth required |
|--------|-------------------|--------------------------|---------------|
| GET    | `/api/tasks`      | Get all tasks (paginated)| Yes           |
| POST   | `/api/tasks`      | Create a new task        | Yes           |
| GET    | `/api/tasks/:id`  | Get a single task        | Yes           |
| PUT    | `/api/tasks/:id`  | Update a task            | Yes           |
| DELETE | `/api/tasks/:id`  | Delete a task            | Yes           |

#### Query params for `GET /api/tasks`
| Param    | Values                              |
|----------|-------------------------------------|
| status   | `pending` \| `in_progress` \| `completed` |
| priority | `low` \| `medium` \| `high`         |
| page     | number (default: 1)                 |
| limit    | number (default: 10)                |

## Getting Started

### Prerequisites
- [Node.js 20+](https://nodejs.org)
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)

### Run with Docker (recommended)

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/task-manager-api.git
cd task-manager-api

# 2. Create your .env file
cp .env.example .env
# Edit .env and set a strong JWT_SECRET

# 3. Start the app
docker compose up -d

# API is now running at http://localhost:3000
```

### Run locally

```bash
npm install
cp .env.example .env
# Make sure MongoDB is running locally
npm run dev
```

### Run tests

```bash
npm test
```

## CI/CD Pipeline

The GitHub Actions workflow ([.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml)) runs on every push to `main`:

1. **Test** — spins up MongoDB as a service container and runs the Jest test suite
2. **Build & Push** — builds the Docker image and pushes it to Docker Hub
3. **Deploy** — SSHs into the EC2 instance and runs `docker compose pull && docker compose up -d`

### Required GitHub Secrets

| Secret            | Description                         |
|-------------------|-------------------------------------|
| `DOCKER_USERNAME` | Your Docker Hub username            |
| `DOCKER_PASSWORD` | Your Docker Hub password or token   |
| `EC2_HOST`        | Public IP of your EC2 instance      |
| `EC2_USER`        | SSH user (e.g. `ubuntu`)            |
| `EC2_SSH_KEY`     | Private key for SSH access          |

## Environment Variables

| Variable        | Description                    | Default                               |
|-----------------|--------------------------------|---------------------------------------|
| `PORT`          | Server port                    | `3000`                                |
| `MONGO_URI`     | MongoDB connection string      | `mongodb://localhost:27017/taskmanager` |
| `JWT_SECRET`    | Secret for signing JWTs        | —                                     |
| `JWT_EXPIRES_IN`| Token expiry duration          | `7d`                                  |

## Project Structure

```
task-manager-api/
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── authController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   └── auth.js        # JWT verification
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── tasks.js
│   └── app.js             # Express app + DB connection
├── tests/
│   ├── auth.test.js
│   └── tasks.test.js
├── .github/workflows/
│   └── ci-cd.yml
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── package.json
```

## License

MIT
