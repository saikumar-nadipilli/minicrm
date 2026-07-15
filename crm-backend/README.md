# Mini CRM Backend - Full-Stack API

Backend API for the Mini CRM frontend.

## Included

- Express server
- MongoDB + Mongoose
- Health-check API
- Centralized error handling
- Zod input validation
- User model
- bcrypt password hashing
- Signup and login
- Login rate limit: 3 attempts per 10 minutes
- JWT access token
- HTTP-only refresh token cookie
- Refresh-token rotation
- Logout and refresh-token revocation
- Protected `GET /api/auth/me`
- Protected Contacts CRUD
- Contact search, status filter, and pagination

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env`

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Windows Command Prompt:

```cmd
copy .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Replace the JWT secrets in `.env` with long random values.

### 3. Start MongoDB

The default local URL is:

```text
mongodb://127.0.0.1:27017/mini_crm
```

You may replace it with a MongoDB Atlas URL.

### 4. Run the backend

```bash
npm run dev
```

## API Endpoints

```text
GET  /api/health
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me

GET    /api/contacts
POST   /api/contacts
GET    /api/contacts/:id
PATCH  /api/contacts/:id
DELETE /api/contacts/:id
```

All `/api/contacts` routes require:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

`GET /api/contacts` supports `page`, `limit`, `status`, and `search` query parameters.

## Frontend Integration

Use this backend with the React app in `../crm-frontend`.

Backend `.env`:

```text
FRONTEND_URL=http://localhost:3000
```

Frontend `.env`:

```text
VITE_API_BASE_URL=http://localhost:5000/api
```
