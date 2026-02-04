# index.js – Server Entry Point

## What this file does
This is the main file that starts the server and connects everything together.

## Step-by-step flow
1. Loads environment variables.
2. Creates an Express app.
3. Applies middlewares like JSON, cookies, and CORS.
4. Connects routes.
5. Starts the server.

## Why this file is important
Without this file, the backend will never start.

## Middleware explanation
- `cors` allows frontend to talk to backend.
- `express.json()` reads JSON data.
- `cookieParser()` reads cookies like JWT token.

## Routes connection
- `/api/auth` → authentication routes
- `/api/user` → user routes
- `/api/shop` → shop routes
- `/api/item` → item routes
