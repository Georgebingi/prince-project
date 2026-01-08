# Backend Setup Guide

## 🚀 Complete Setup Instructions

### Step 1: Install Dependencies
```bash
cd Backend
npm install
```

### Step 2: Setup MySQL Database

#### Option A: Using Command Prompt (Recommended)

1. **Open Command Prompt** and navigate to your project:
```bash
cd C:\Users\mirac\Documents\Prince-project\Backend
```

2. **Login to MySQL**:
```bash
mysql -u root -p
```
Enter your MySQL root password when prompted.

3. **Run the SQL schema** (while in MySQL):
```sql
source database/schema.sql
```

Or if you're in Command Prompt (outside MySQL):
```bash
mysql -u root -p < database/schema.sql
```

#### Option B: Using MySQL Workbench or phpMyAdmin

1. Open MySQL Workbench or phpMyAdmin
2. Connect to your MySQL server
3. Open `database/schema.sql` file
4. Execute the entire script

### Step 3: Create .env File

Create a `.env` file in the `Backend` folder:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=kaduna_court_db

# JWT Configuration (IMPORTANT: Change these in production!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345678901234567890
JWT_REFRESH_SECRET=your_refresh_token_secret_change_this_too_09876543210987654321
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

**⚠️ Important:** 
- Replace `YOUR_MYSQL_PASSWORD_HERE` with your actual MySQL root password
- If MySQL has no password, leave it empty: `DB_PASSWORD=`
- Change the JWT secrets to random strings in production!

### Step 4: Create Admin User

After setting up the database, create an admin user:

```bash
npm run create-admin
```

This will create an admin user with:
- **Email:** admin@kadunacourt.gov.ng
- **Password:** admin123
- **Staff ID:** ADM/2024/001

⚠️ **Change the password after first login!**

### Step 5: Start the Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3000
📝 Environment: development
✅ Database connected successfully
```

## 🔧 Troubleshooting

### Error: "Access denied for user 'root'@'localhost'"

**Solution:**
1. Check your `.env` file - make sure `DB_PASSWORD` is correct
2. If MySQL has no password, set `DB_PASSWORD=` (empty)
3. Test MySQL connection:
   ```bash
   mysql -u root -p
   ```

### Error: "Database connection failed: Unknown database"

**Solution:**
- The database doesn't exist yet. Run the schema.sql file:
  ```bash
  mysql -u root -p < database/schema.sql
  ```

### Error: "Table already exists"

**Solution:**
- This is fine! The script uses `CREATE TABLE IF NOT EXISTS`
- Your tables are already created
- Continue to the next step

### MySQL Not Running

**Solution:**
- Start MySQL service:
  - **Windows:** Open Services, find "MySQL" and start it
  - Or use: `net start MySQL` (Run as Administrator)

### Can't Connect to MySQL

**Solution:**
1. Make sure MySQL is installed and running
2. Check if MySQL is on a different port (default is 3306)
3. Verify your MySQL user has proper permissions

## 📋 Database Tables Created

The schema creates these tables:

1. ✅ **users** - All system users
2. ✅ **cases** - Court cases
3. ✅ **case_parties** - Parties in cases
4. ✅ **documents** - Document metadata
5. ✅ **case_timeline** - Case history
6. ✅ **hearings** - Scheduled hearings
7. ✅ **sessions** - User sessions
8. ✅ **audit_logs** - Audit trail
9. ✅ **notifications** - User notifications

## 🔐 Default Admin Credentials

After running `npm run create-admin`:

- **Email:** admin@kadunacourt.gov.ng
- **Password:** admin123
- **Role:** admin

**⚠️ Change this password immediately after first login!**

## ✅ Verification

To verify everything is working:

1. **Check database connection:**
   ```bash
   npm run dev
   ```
   Should show: `✅ Database connected successfully`

2. **Test health endpoint:**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"ok","timestamp":"...","environment":"development"}`

3. **Test login endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin@kadunacourt.gov.ng","password":"admin123","role":"admin"}'
   ```

## 📚 Next Steps

1. ✅ Database setup complete
2. ✅ Admin user created
3. ✅ Server running
4. 🔗 Connect frontend (already configured)
5. 🚀 Start building your application!

---

**Need Help?** Check the error messages carefully - they usually tell you exactly what's wrong!
