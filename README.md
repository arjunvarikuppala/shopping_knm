# shopping_knm

Production-ready full-stack clothing e-commerce platform.

## Architecture

```
FashionHub/
├── backend/          # Node.js + Express + TypeScript API
├── frontend/         # React 19 + Vite + TypeScript SPA
├── nginx/            # Reverse proxy configuration
├── docker-compose.yml
└── ecosystem.config.js  # PM2 process manager
```

### Design Principles

- **Clean Architecture**: Controllers → Services → Models (thin controllers, fat services)
- **RBAC**: Customer and Admin roles with JWT access + refresh tokens
- **Security**: bcrypt, Helmet, rate limiting, CORS, input validation
- **Deployment**: Docker containers, Nginx reverse proxy, PM2 cluster mode

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB Atlas connection string
- Docker (optional)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Docker

```bash
docker-compose up --build
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register customer |
| POST | /api/auth/login | Login |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/forgot-password | Request password reset |
| POST | /api/auth/reset-password | Reset password |
| GET | /api/products | List products (filters, search, sort) |
| GET | /api/products/:id | Product details |
| POST | /api/orders | Create order |
| GET | /api/orders/my | Customer order history |
| GET | /api/admin/dashboard | Admin stats |
| ... | ... | See backend routes for full list |

## Environment Variables

See `backend/.env.example` and `frontend/.env.example`.

## License

MIT
