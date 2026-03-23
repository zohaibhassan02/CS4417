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

File Overview
server.js

This is the main entry point of the backend.

It:

loads environment variables
starts the Express server
enables JSON parsing
configures session handling
enables CORS
connects route files
handles unknown routes and internal errors
db/database.js

This file connects to the SQLite database and creates the required tables if they do not already exist.

Tables:

users
feedback
middleware/authMiddleware.js

This file contains authorization middleware.

requireAuth

Allows access only if a user is logged in.

requireAdmin

Allows access only if a logged-in user has the admin role.

routes/authRoutes.js

This file handles authentication-related routes such as login, logout, session checking, and password changes.

routes/userRoutes.js

This file handles user-related routes such as admin-only registration and viewing all users.

routes/feedbackRoutes.js

This file handles secure feedback submission by authenticated users.

seedAdmin.js

This file is used to create the first admin account manually in the database.

This is necessary because registration is restricted to admins, so the system needs an initial admin user to exist first.

Database Tables
users

Stores user account information.

Fields:

id
username
email
password_hash
role
created_at
feedback

Stores submitted feedback.

Fields:

id
user_id
subject
message
created_at
Route Documentation

Base URL when running locally:

http://localhost:3000
Root Route
GET /

Simple test route to confirm the backend is running.

Response:

"Secure Software Backend Running"
Authentication Routes
POST /auth/login

Logs in a user and creates a session.

Request body
{
  "email": "admin@example.com",
  "password": "Admin123"
}
Success
returns user session info
stores the session on the server
Failure
invalid email/password
too many login attempts
validation failure
POST /auth/logout

Logs out the currently authenticated user and destroys the session.

Access
logged-in users only
POST /auth/change-password

Allows a logged-in user to change their own password.

Access
logged-in users only
Request body
{
  "oldPassword": "OldPass123",
  "newPassword": "NewPass456"
}
Notes
the logged-in user is identified through the session
users cannot change another user’s password
new password must meet validation rules
GET /auth/me

Returns the currently logged-in user from the session.

Access
logged-in users only

Useful for:

checking whether session authentication is working
identifying which user is currently logged in
User Routes
POST /users/register

Registers a new user.

Access
admin only
Request body
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "StrongPass123",
  "role": "user"
}
Notes
only admins can create users
password is hashed before storage
duplicate usernames/emails are rejected
GET /users/all

Returns a list of all users.

Access
admin only
Notes
password hashes are not returned
intended for secure admin viewing of users

Example response:

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
Feedback Routes
POST /feedback/submit

Allows a logged-in user to submit feedback.

Access
logged-in users only
Request body
{
  "subject": "Test feedback",
  "message": "This is a feedback message."
}
Notes
user_id is not accepted from the client
the backend gets the user ID from the session
this prevents users from impersonating others
Authentication and Authorization Summary
Unauthenticated visitors can:
access GET /
Logged-in users can:
POST /auth/logout
POST /auth/change-password
GET /auth/me
POST /feedback/submit
Admins can additionally:
POST /users/register
GET /users/all
How to Run This Backend Locally
1. Clone the repository
git clone <your-github-repo-url>
cd <project-folder>
2. Install dependencies
npm install
3. Create a .env file

Create a file named .env in the root of the project and add:

PORT=3000
SESSION_SECRET=yourStrongSecretKeyHere
NODE_ENV=development

Important:

do not commit the real .env file to GitHub
use your own strong session secret
4. Seed the first admin user

Since only admins can register users, the first admin must be created manually.

Run:

node seedAdmin.js

This will create the initial admin account stored in the database.

Make sure the login credentials in seedAdmin.js are the ones you want to use.

5. Start the server
npm start

If everything works, you should see:

Server running on port 3000
Connected to SQLite database.
Testing Locally with Postman
Login as admin

POST /auth/login

{
  "email": "admin@example.com",
  "password": "Admin123"
}
Check current session

GET /auth/me

Register a new user

POST /users/register

{
  "username": "testuser",
  "email": "testuser@example.com",
  "password": "TestPass123",
  "role": "user"
}
Submit feedback

POST /feedback/submit

{
  "subject": "Hello",
  "message": "This is my feedback."
}
Change password

POST /auth/change-password

{
  "oldPassword": "TestPass123",
  "newPassword": "NewTestPass456"
}
Logout

POST /auth/logout

Notes for Team Members
Registration is intentionally restricted to admins only.
Feedback must come from logged-in users.
Session cookies must be preserved in Postman or the frontend for protected routes to work.
Password hashes are stored in the database, not raw passwords.
This backend is intended for educational use and demonstrates secure software principles for a course project.
Future Improvements

Some improvements that would be valuable in a production system include:

CSRF protection
persistent session store instead of default memory session storage
stronger audit logging
account lockout or monitoring after repeated suspicious activity
HTTPS deployment
password reset flow
