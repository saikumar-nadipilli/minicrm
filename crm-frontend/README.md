# mini CRM Frontend

## Run Locally

**Prerequisites:** Node.js and the backend running from `../crm-backend`.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example`:

   ```bash
   cp .env.example .env
   ```

   On Windows Command Prompt:

   ```cmd
   copy .env.example .env
   ```

3. Confirm the API URL:

   ```text
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. Run the app:

   ```bash
   npm run dev
   ```

The frontend runs on `http://localhost:3000` and uses the backend for signup, login, logout, session restore, and contact CRUD.
