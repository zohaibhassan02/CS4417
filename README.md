# Secure Software Backend

This backend was built for a Software Security course project. It is a secure web application backend that supports authentication, user management, password changes, and feedback submission while applying basic software security practices.

The project focuses on secure login, input validation, secure database handling, authorization, and protection of sensitive routes.

---

## Project Purpose

This backend is designed to demonstrate secure software development practices for an undergraduate project. It includes:

- user login and logout
- password change functionality
- admin-controlled user creation
- protected feedback submission
- session-based authentication
- role-based authorization
- password hashing
- input validation
- parameterized database queries

---

## Technologies Used

- Node.js
- Express.js
- SQLite
- bcrypt
- express-session
- express-validator
- express-rate-limit
- dotenv
- cors

---

## Main Security Features

This backend applies several security-focused practices:

- Passwords are never stored in plain text. They are hashed using `bcrypt`.
- SQLite queries use parameterized statements to reduce SQL injection risk.
- Sensitive routes are protected using authentication and authorization middleware.
- User identity for feedback submission is taken from the logged-in session instead of trusting client input.
- Login attempts are rate-limited to reduce brute-force attacks.
- Session cookies use safer settings such as `httpOnly` and `sameSite`.
- Inputs are validated before being processed or stored.

---

## User Roles

There are two roles in this backend:

### 1. Admin
An admin has elevated privileges.

An admin **can**:
- log in
- log out
- change their own password
- register new users
- view the list of users
- submit feedback

An admin **cannot**:
- bypass authentication
- access routes without being logged in
- avoid validation rules

---

### 2. User
A normal user has limited privileges.

A user **can**:
- log in
- log out
- change their own password
- submit feedback

A user **cannot**:
- register new users
- view the list of all users
- act as another user
- submit feedback on behalf of someone else

---

## What “Feedback” Means

A feedback entry represents a message submitted by a logged-in user. It can be treated like a contact form or internal message for the purpose of this project.

Each feedback entry includes:
- the ID of the logged-in user who submitted it
- a subject
- a message
- a timestamp

Important security detail:
- the backend does **not** trust a `user_id` from the client
- instead, it uses the currently logged-in session user

This prevents a user from pretending to be someone else when submitting feedback.

---

## Project Structure

```bash
project/
│
├── db/
│   ├── database.js
│   └── secureapp.db
│
├── middleware/
│   └── authMiddleware.js
│
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   └── feedbackRoutes.js
│
├── .env
├── .gitignore
├── package.json
├── seedAdmin.js
└── server.js
```

---

## File Overview

### `server.js`
Main entry point of the backend. Loads environment variables, starts the Express server, enables JSON parsing, configures session handling, enables CORS, connects route files, and handles unknown routes and internal errors.

### `db/database.js`
Connects to the SQLite database and creates the required tables (`users`, `feedback`) if they do not already exist.

### `middleware/authMiddleware.js`
Contains authorization middleware.
- **`requireAuth`** — Allows access only if a user is logged in
- **`requireAdmin`** — Allows access only if a logged-in user has the admin role

### `routes/authRoutes.js`
Handles authentication routes: login, logout, session checking, and password changes.

### `routes/userRoutes.js`
Handles user-related routes: admin-only registration and viewing all users.

### `routes/feedbackRoutes.js`
Handles secure feedback submission by authenticated users.

### `seedAdmin.js`
Used to create the first admin account manually in the database. Required because registration is restricted to admins.

---

## Database Tables

### `users`

| Field | Description |
|---|---|
| `id` | Unique identifier |
| `username` | User's username |
| `email` | User's email address |
| `password_hash` | Hashed password |
| `role` | `admin` or `user` |
| `created_at` | Timestamp of account creation |

### `feedback`

| Field | Description |
|---|---|
| `id` | Unique identifier |
| `user_id` | ID of the submitting user |
| `subject` | Feedback subject |
| `message` | Feedback message body |
| `created_at` | Timestamp of submission |

---

## Route Documentation

**Base URL:** `http://localhost:3000`

---

### Root

#### `GET /`
Simple test route to confirm the backend is running.

**Response:**
```
Secure Software Backend Running
```

---

### Authentication Routes

#### `POST /auth/login`
Logs in a user and creates a session.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "Admin123"
}
```

**Success:** Returns user session info and stores session on server.  
**Failure:** Invalid credentials, too many login attempts, or validation failure.

---

#### `POST /auth/logout`
Logs out the currently authenticated user.

**Access:** Logged-in users only

---

#### `POST /auth/change-password`
Allows a logged-in user to change their password.

**Access:** Logged-in users only

**Request Body:**
```json
{
  "oldPassword": "OldPass123",
  "newPassword": "NewPass456"
}
```

> User is identified via session. Users cannot change another user's password.

---

#### `GET /auth/me`
Returns the currently logged-in user. Useful for verifying session authentication.

**Access:** Logged-in users only

---

### User Routes

#### `POST /users/register`
Registers a new user.

**Access:** Admin only

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "StrongPass123",
  "role": "user"
}
```

> Passwords are hashed. Duplicate usernames/emails are rejected.

---

#### `GET /users/all`
Returns all users. Password hashes are **not** returned.

**Access:** Admin only

**Example Response:**
```json
{
  "users": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin",
      "created_at": "2026-03-23 12:00:00"
    }
  ]
}
```

---

### Feedback Routes

#### `POST /feedback/submit`
Submits feedback from a logged-in user.

**Access:** Logged-in users only

**Request Body:**
```json
{
  "subject": "Test feedback",
  "message": "This is a feedback message."
}
```

> `user_id` is **not** accepted from the client — the backend uses the session user ID to prevent impersonation.

---

## Authorization Summary

| Route | Access |
|---|---|
| `GET /` | Public |
| `POST /auth/login` | Public |
| `POST /auth/logout` | Logged-in users |
| `POST /auth/change-password` | Logged-in users |
| `GET /auth/me` | Logged-in users |
| `POST /feedback/submit` | Logged-in users |
| `POST /users/register` | Admin only |
| `GET /users/all` | Admin only |

---

## Running Locally

### 1. Clone the Repository
```bash
git clone 
cd 
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create `.env`
```env
PORT=3000
SESSION_SECRET=yourStrongSecretKeyHere
NODE_ENV=development
```


### 4. Seed Admin Account
```bash
node seedAdmin.js
```

### 5. Start the Server
```bash
npm start
```

**Expected output:**
```
Server running on port 3000
Connected to SQLite database.
```

---

## Testing with Postman

**Login**
```json
POST /auth/login
{ "email": "admin@example.com", "password": "Admin123" }
```

**Check Session**
```
GET /auth/me
```

**Register User (Admin only)**
```json
POST /users/register
{ "username": "testuser", "email": "testuser@example.com", "password": "TestPass123", "role": "user" }
```

**Submit Feedback**
```json
POST /feedback/submit
{ "subject": "Hello", "message": "This is my feedback." }
```

**Change Password**
```json
POST /auth/change-password
{ "oldPassword": "TestPass123", "newPassword": "NewTestPass456" }
```

**Logout**
```
POST /auth/logout
```

---

## Notes for Team Members

- Registration is admin-only
- Feedback requires login
- Session cookies must be preserved between requests
- Passwords are hashed and never stored raw
- All inputs are validated before processing

---

## Future Improvements

- [ ] CSRF protection
- [ ] Persistent session storage
- [ ] Audit logging
- [ ] Account lockout after failed login attempts
- [ ] HTTPS deployment
- [ ] Password reset functionality
