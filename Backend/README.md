# Kaduna High Court Management System - Backend API

A Node.js + Express backend API for the Kaduna High Court Management System.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MySQL 8+ or PostgreSQL 14+ database
- npm or yarn package manager

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure your database and JWT secrets.

3. **Create Database**
   Create a MySQL database named `kaduna_court_db` (or as specified in `.env`)

4. **Run Database Migrations**
   Create the necessary tables (see database schema documentation)

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js    # Database connection pool
│   │   └── env.js         # Environment configuration
│   ├── middleware/
│   │   ├── auth.js        # JWT authentication & authorization
│   │   ├── upload.js      # File upload configuration
│   │   └── errorHandler.js # Error handling middleware
│   └── routes/
│       ├── auth.js        # Authentication routes
│       ├── cases.js       # Case management routes
│       ├── documents.js   # Document management routes
│       ├── users.js       # User management routes
│       ├── reports.js     # Reports & analytics routes
│       └── index.js       # Route aggregator
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── package.json          # Project dependencies
├── server.js             # Application entry point
└── README.md             # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Cases
- `GET /api/cases` - Get all cases (with filters & pagination)
- `GET /api/cases/:id` - Get case details
- `POST /api/cases` - Create new case (judge/registrar/admin)

### Documents
- `GET /api/documents` - Get all documents (with filters)
- `POST /api/documents/upload` - Upload document

### Users
- `GET /api/users` - Get all users (admin/registrar)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `POST /api/users/:id/approve` - Approve user (admin/registrar)
- `GET /api/users/lawyers` - Get list of lawyers
- `GET /api/users/judges` - Get list of judges

### Reports
- `GET /api/reports/dashboard-stats` - Get dashboard statistics
- `GET /api/reports/case-statistics` - Get case statistics (admin/registrar/auditor)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

## 🛠️ Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## 📝 Environment Variables

See `.env.example` for all required environment variables.

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting
- Helmet.js for security headers
- CORS configuration
- Input validation
- SQL injection protection (parameterized queries)

## 📚 Database

The backend uses MySQL with connection pooling. Make sure your database is properly configured in the `.env` file.

## 🐛 Error Handling

All errors are returned in a consistent format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

## 📄 License

ISC
