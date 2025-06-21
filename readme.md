# 🎫 TICMaTe – AI-Powered Ticketing System Backend

TICMaTe is a full-stack, role-based ticketing platform where users can create, assign, and resolve tech-related tickets. This backend powers the core logic using **Node.js**, **Express**, **MongoDB**, and **Inngest + Gemini** for AI-enhanced support suggestions.

---

## 🚀 Features

- 🔐 **Authentication**
  - Sign up, sign in, sign out
  - Forgot password, reset password
  - Email verification
- 👥 **Role-Based Access Control**
  - `User`, `Moderator`, and `Admin` roles
  - Protected routes & middleware guards
- 📝 **Ticket System**
  - Create, update, delete, view tickets
  - Assign tickets to users based on skill match
  - Reply to tickets (comment threads)
- 🧠 **AI Agent Integration**
  - Uses Inngest workers + Gemini API
  - AI-generated helper notes based on ticket content
- ⚙️ **User Management (Admin only)**
  - View all users, activate/deactivate accounts
  - Edit user skills and details
- 📊 **Dashboard Analytics (Admin)**
  - User stats, ticket stats, status breakdowns

---

## 🛠️ Tech Stack

| Tech           | Purpose                      |
| -------------- | ---------------------------- |
| **Node.js**    | Core backend runtime         |
| **Express.js** | RESTful API server           |
| **MongoDB**    | Database                     |
| **Mongoose**   | ODM for MongoDB              |
| **JWT**        | Auth token management        |
| **Argon2**     | Password hashing             |
| **Inngest**    | Background jobs (AI trigger) |
| **Gemini API** | AI suggestions per ticket    |
| **Dotenv**     | Environment configs          |
| **CORS**       | Cross-origin middleware      |
| **Nodemon**    | Dev server                   |
| **NPM**        | Package manager              |
| **Postman**    | API testing                  |
| **Resend**     | Email service                |

---

## 📁 Folder Structure

```bash

/controllers → Route logic
/models → Mongoose schemas (User, Ticket)
/routes → API endpoints
/middleware → Auth guards, error handlers
/utils → Token gen, email helpers, skill match
/services → Gemini AI integration, Inngest triggers
/config → DB connection, global config
```

---

## 🧪 Setup & Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/talhabilal-dev/tickmate.git
cd ticmate

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit your Mongo URI, JWT secret, Gemini key, etc.

# 4. Start the server
npm run dev

```

## 📡 API Routes

The backend exposes RESTful APIs for authentication, user management, ticket operations, and admin functionality.

### Auth Routes (/api/auth)

| Method | Endpoint         | Description                      |
| ------ | ---------------- | -------------------------------- |
| POST   | /register        | Register a new user              |
| POST   | /login           | Log in an existing user          |
| POST   | /logout          | Log out the current user         |
| PUT    | /update          | Update own user profile          |
| PUT    | /update-skills   | Update user's listed skills      |
| PUT    | /update-password | Change account password          |
| GET    | /user            | Fetch current authenticated user |

### Ticket Routes (/api/tickets)

| Method | Endpoint         | Description                          |
| ------ | ---------------- | ------------------------------------ |
| GET    | /                | Fetch all tickets for the user       |
| POST   | /                | Create a new ticket                  |
| PUT    | /edit-ticket     | Edit a ticket's content              |
| PUT    | /status/:id      | Toggle ticket status                 |
| DELETE | /delete-ticket   | Delete a ticket                      |
| PUT    | /ticket-reply    | Add a reply to a ticket              |
| GET    | /get-assigned    | Get tickets assigned to current user |
| GET    | /tickets-summary | Get user's ticket stats summary      |

### Admin Routes (/api/admin)

### Requires admin role

| Method | Endpoint     | Description                         |
| ------ | ------------ | ----------------------------------- |
| GET    | /users       | Fetch all registered users          |
| GET    | /tickets     | Fetch all tickets system-wide       |
| GET    | /dashboard   | Fetch system-wide stats & summaries |
| PUT    | /update-user | Update any user (by admin)          |
| DELETE | /delete-user | Delete any user (by admin)          |

### AI Agent

- Triggered via Inngest worker when a ticket is created/updated

---

## 🔑 Environment Variables

```plaintext
PORT=3000
MONGO_URI=mongodb+srv://<username>::<password>@cluster0.m8oca.mongodb.net/<database_name>?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=secret
GEMINI_API_KEY=""
RESEND_API_KEY=""
EMAIL_FROM=""
INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""
APP_URL=http://localhost:3000

```

---

## 🧠 AI Agent Flow

1. User creates a ticket with title/description.
2. Inngest triggers background worker.
3. Worker calls Gemini API.
4. Gemini returns helper suggestions.
5. Suggestions saved to ticket for assigned user.
