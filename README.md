# Track Down — Backend API

Node.js + Express + MongoDB (Mongoose) REST API built with a clean **MVC** structure.
Email/password auth (JWT + bcrypt), image uploads via **multer** saved to the VPS disk.

## Structure

```
Track-down-backend/
├── server.js               # entry point: connect DB, start HTTP server
├── uploads/                # uploaded images live here (served statically)
└── src/
    ├── app.js              # express app: middleware, routes, error handling
    ├── config/
    │   ├── env.js          # centralized env config (validated)
    │   └── db.js           # mongoose connection
    ├── models/             # mongoose schemas (User, Post)
    ├── services/           # business logic (DB-facing)
    ├── controllers/        # thin HTTP layer (request → service → response)
    ├── routes/             # express routers, mounted under /api
    ├── middlewares/        # auth, upload (multer), error handling
    └── utils/              # ApiError, ApiResponse, asyncHandler, token
```

Request flow: **route → middleware → controller → service → model**.

## Setup

```bash
npm install
cp .env.example .env   # then edit values
npm run dev            # nodemon
# or
npm start
```

Requires a running MongoDB. The default `.env` points to a **local** instance
(`mongodb://127.0.0.1:27017/track-down`). To use **Atlas**, just change `MONGO_URI`.

## API

Base URL: `http://localhost:5002/api`

| Method | Endpoint            | Auth      | Body                                   |
|--------|---------------------|-----------|----------------------------------------|
| GET    | `/health`           | —         | —                                      |
| POST   | `/auth/register`    | —         | `name, email, password, image?` (form) |
| POST   | `/auth/login`       | —         | `email, password` (JSON)               |
| GET    | `/auth/me`          | Bearer    | —                                      |
| GET    | `/posts`            | —         | `?page&limit`                          |
| GET    | `/posts/:id`        | —         | —                                      |
| POST   | `/posts`            | Bearer    | `description, image` (form-data)       |
| DELETE | `/posts/:id`        | Bearer    | — (author/admin only)                  |
| PATCH  | `/users/me`         | Bearer    | profile fields + `image?` (form)       |
| GET    | `/users`            | Bearer/admin | —                                   |
| GET    | `/users/:id`        | —         | —                                      |

Auth: send `Authorization: Bearer <token>`. Token is returned by register/login.

### Response envelope

```json
{ "success": true, "message": "...", "data": { }, "meta": { } }
```

Errors: `{ "success": false, "message": "...", "details": [ ] }`

## Uploads on the VPS

Images are written to `UPLOAD_DIR` (default `uploads/`) on the server disk and
served at `GET /uploads/<filename>`. On the VPS, point a persistent volume /
folder at `UPLOAD_DIR` and set `SERVER_URL` to your public domain so the stored
image URLs are absolute and correct.
