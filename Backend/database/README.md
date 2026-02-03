# Database Setup Instructions

## Quick Setup

### Step 1: Connect to MySQL
Open Command Prompt or MySQL CLI and run:

```bash
mysql -u root -p
```

Enter your MySQL root password when prompted.

### Step 2: Create Database and Tables
Run the SQL script:

```bash
mysql -u root -p < schema.sql
```

Or if you're already in MySQL:

```sql
source C:/Users/mirac/Documents/Prince-project/Backend/database/schema.sql
```

### Step 3: Create Admin User
After running the schema, you need to create an admin user. Use this script:

```sql
USE kaduna_court_db;

-- Insert admin user (you'll need to generate the password hash)
-- Default password: admin123
INSERT INTO users (name, email, password_hash, staff_id, role, department, status) VALUES
('System Admin', 'admin@kadunacourt.gov.ng', '$2b$10$rOJqKjXv1XJqK5XqK5XqK.bYJqK5XqK5XqK5XqK5XqK5XqK5XqK5Xq', 'ADM/2024/001', 'admin', 'IT Systems', 'active');
```

**Important:** The password hash above is a placeholder. To create a real admin user with a password, use this Node.js script:

```javascript
const bcrypt = require('bcrypt');

async function createAdminUser() {
  const password = 'admin123'; // Change this to your desired password
  const hash = await bcrypt.hash(password, 10);
  console.log('Password hash:', hash);
  // Use this hash in the INSERT statement
}

createAdminUser();
```

### Step 4: Configure .env File
Create a `.env` file in the `Backend` folder:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=kaduna_court_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_123456789
JWT_REFRESH_SECRET=your_refresh_token_secret_change_this_too_987654321
JWT_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Database Tables Overview

1. **users** - All system users (judges, lawyers, staff)
2. **cases** - Court cases
3. **case_parties** - Parties involved in cases
4. **documents** - Document metadata
5. **case_timeline** - Case history/events
6. **hearings** - Scheduled court hearings
7. **sessions** - User sessions and refresh tokens
8. **audit_logs** - System audit trail
9. **notifications** - User notifications

## Troubleshooting

### Error: Access denied for user 'root'@'localhost'
- Make sure your MySQL password is correct in `.env` file
- If you don't have a password, leave `DB_PASSWORD=` empty or remove it

### Error: Database doesn't exist
- Run the `schema.sql` script first
- Make sure you're connecting to the correct MySQL instance

### Error: Table already exists
- The script uses `CREATE TABLE IF NOT EXISTS`, so this shouldn't happen
- If you need to reset, drop the database first: `DROP DATABASE kaduna_court_db;`

## Creating a Test User

To create a test user programmatically, you can use this approach:

1. Register through the API: `POST /api/auth/register`
2. Or insert directly into the database with a hashed password

## Next Steps

After setting up the database:
1. Update `.env` with your MySQL credentials
2. Start the backend: `npm run dev`
3. The server should connect successfully!
