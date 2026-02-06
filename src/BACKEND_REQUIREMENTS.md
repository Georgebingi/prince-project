
# Backend API Requirements - Kaduna High Court Management System

## Overview
This document outlines all backend functions and API endpoints required for the Judicial Management System. All endpoints should return JSON responses and implement proper authentication/authorization.

---

## 1. Authentication & Authorization

### Endpoints

#### POST /api/auth/login
**Purpose:** Authenticate user and return JWT token
**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "role": "judge|registrar|clerk|admin|lawyer|auditor|partner|court_admin|it_admin"
}
```
**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "department": "string",
    "staffId": "string"
  }
}
```

#### POST /api/auth/register
**Purpose:** Register new staff member (requires admin approval)
**Request Body:**
```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "staffId": "string",
  "role": "string",
  "department": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Registration submitted for approval",
  "userId": "string"
}
```

#### POST /api/auth/logout
**Purpose:** Invalidate user session/token
**Headers:** Authorization: Bearer {token}
**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### POST /api/auth/refresh-token
**Purpose:** Refresh expired JWT token
**Request Body:**
```json
{
  "refreshToken": "string"
}
```

#### POST /api/auth/forgot-password
**Purpose:** Initiate password reset
**Request Body:**
```json
{
  "email": "string"
}
```

#### POST /api/auth/reset-password
**Purpose:** Reset password with token
**Request Body:**
```json
{
  "token": "string",
  "newPassword": "string"
}
```

---

## 2. Case Management

### Endpoints

#### GET /api/cases
**Purpose:** Get list of cases (filtered by user role)
**Query Parameters:**
- `status`: string (optional) - "filed", "in_progress", "judgment", "disposed"
- `type`: string (optional) - "criminal", "civil", "family", "commercial"
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `search`: string (optional) - search by case ID or title
- `assignedTo`: string (optional) - filter by judge/lawyer ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "caseNumber": "KDH/2024/001",
      "title": "string",
      "type": "criminal|civil|family|commercial|appeal",
      "status": "string",
      "priority": "high|medium|low",
      "judge": {
        "id": "string",
        "name": "string"
      },
      "filedDate": "ISO date",
      "nextHearing": "ISO date",
      "lastUpdated": "ISO date"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

#### GET /api/cases/:id
**Purpose:** Get detailed case information
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "caseNumber": "string",
    "title": "string",
    "type": "string",
    "status": "string",
    "priority": "string",
    "description": "string",
    "filedDate": "ISO date",
    "nextHearing": "ISO date",
    "judge": {
      "id": "string",
      "name": "string",
      "email": "string"
    },
    "parties": [
      {
        "role": "plaintiff|defendant",
        "name": "string",
        "lawyer": {
          "id": "string",
          "name": "string",
          "barNumber": "string"
        }
      }
    ],
    "documents": [
      {
        "id": "string",
        "name": "string",
        "type": "legal|evidence|motion|order",
        "uploadedBy": "string",
        "uploadedAt": "ISO date",
        "size": "number",
        "url": "string"
      }
    ],
    "timeline": [
      {
        "id": "string",
        "date": "ISO date",
        "title": "string",
        "description": "string",
        "type": "hearing|order|admin|filing",
        "createdBy": "string"
      }
    ],
    "assignedStaff": [
      {
        "id": "string",
        "name": "string",
        "role": "string"
      }
    ]
  }
}
```

#### POST /api/cases
**Purpose:** Create new case
**Request Body:**
```json
{
  "title": "string",
  "type": "string",
  "description": "string",
  "priority": "string",
  "parties": [
    {
      "role": "plaintiff|defendant",
      "name": "string",
      "lawyerId": "string"
    }
  ]
}
```

#### PUT /api/cases/:id
**Purpose:** Update case details
**Request Body:**
```json
{
  "status": "string",
  "priority": "string",
  "description": "string",
  "nextHearing": "ISO date"
}
```

#### DELETE /api/cases/:id
**Purpose:** Archive/delete case (admin only)

#### POST /api/cases/:id/assign-judge
**Purpose:** Assign judge to case
**Request Body:**
```json
{
  "judgeId": "string"
}
```

#### POST /api/cases/:id/assign-lawyer
**Purpose:** Assign lawyer to case party
**Request Body:**
```json
{
  "partyId": "string",
  "lawyerId": "string"
}
```

#### POST /api/cases/:id/timeline
**Purpose:** Add timeline event
**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "type": "hearing|order|admin|filing",
  "date": "ISO date"
}
```

#### POST /api/cases/:id/schedule-hearing
**Purpose:** Schedule court hearing
**Request Body:**
```json
{
  "date": "ISO date",
  "time": "string",
  "courtRoom": "string",
  "type": "hearing|chambers|deliberation"
}
```

---

## 3. Document Management

### Endpoints

#### GET /api/documents
**Purpose:** Get list of documents
**Query Parameters:**
- `caseId`: string (optional)
- `type`: string (optional)
- `page`: number
- `limit`: number
- `search`: string

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "type": "legal|evidence|motion|order",
      "caseNumber": "string",
      "uploadedBy": {
        "id": "string",
        "name": "string"
      },
      "uploadedAt": "ISO date",
      "size": "number",
      "status": "pending|approved|rejected",
      "url": "string"
    }
  ],
  "pagination": {}
}
```

#### POST /api/documents/upload
**Purpose:** Upload document
**Request:** Multipart form data
```
file: File
caseId: string
type: string
description: string
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "url": "string",
    "size": "number"
  }
}
```

#### GET /api/documents/:id/download
**Purpose:** Download document file
**Response:** File stream

#### DELETE /api/documents/:id
**Purpose:** Delete document

#### PUT /api/documents/:id/approve
**Purpose:** Approve document (registrar/judge)
**Request Body:**
```json
{
  "approved": true,
  "notes": "string"
}
```

---

## 4. User Management

### Endpoints

#### GET /api/users
**Purpose:** Get list of users (admin only)
**Query Parameters:**
- `role`: string
- `department`: string
- `status`: "active|pending|suspended"
- `page`: number
- `limit`: number

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "department": "string",
      "staffId": "string",
      "status": "active|pending|suspended",
      "createdAt": "ISO date"
    }
  ]
}
```

#### GET /api/users/:id
**Purpose:** Get user details

#### PUT /api/users/:id
**Purpose:** Update user details
**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "department": "string"
}
```

#### POST /api/users/:id/approve
**Purpose:** Approve pending user registration (admin)
**Request Body:**
```json
{
  "approved": true,
  "staffId": "string"
}
```

#### POST /api/users/:id/suspend
**Purpose:** Suspend user account (admin)
**Request Body:**
```json
{
  "reason": "string"
}
```

#### GET /api/users/lawyers
**Purpose:** Get list of lawyers for assignment
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "barNumber": "string",
      "specialization": "string",
      "activeCases": "number"
    }
  ]
}
```

#### GET /api/users/judges
**Purpose:** Get list of judges for assignment

---

## 5. Reports & Analytics

### Endpoints

#### GET /api/reports/dashboard-stats
**Purpose:** Get dashboard statistics for user role
**Response:**
```json
{
  "success": true,
  "data": {
    "totalCases": "number",
    "pendingCases": "number",
    "completedCases": "number",
    "upcomingHearings": "number",
    "recentActivity": []
  }
}
```

#### GET /api/reports/case-statistics
**Purpose:** Get case statistics
**Query Parameters:**
- `startDate`: ISO date
- `endDate`: ISO date
- `type`: string
- `status`: string

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCases": "number",
    "byType": {
      "criminal": "number",
      "civil": "number",
      "family": "number"
    },
    "byStatus": {
      "filed": "number",
      "in_progress": "number",
      "disposed": "number"
    },
    "averageResolutionTime": "number (days)"
  }
}
```

#### GET /api/reports/performance
**Purpose:** Get performance metrics (admin/auditor)
**Response:**
```json
{
  "success": true,
  "data": {
    "judgePerformance": [
      {
        "judgeId": "string",
        "name": "string",
        "casesHandled": "number",
        "casesCompleted": "number",
        "averageTime": "number"
      }
    ],
    "courtUtilization": "number",
    "documentProcessingTime": "number"
  }
}
```

#### POST /api/reports/generate
**Purpose:** Generate custom report
**Request Body:**
```json
{
  "type": "case_summary|performance|audit",
  "filters": {
    "startDate": "ISO date",
    "endDate": "ISO date",
    "caseType": "string",
    "judge": "string"
  },
  "format": "pdf|excel|csv"
}
```
**Response:**
```json
{
  "success": true,
  "reportUrl": "string",
  "expiresAt": "ISO date"
}
```

---

## 6. Audit Logs

### Endpoints

#### GET /api/audit-logs
**Purpose:** Get audit trail (admin/auditor only)
**Query Parameters:**
- `userId`: string
- `action`: string
- `resource`: string
- `startDate`: ISO date
- `endDate`: ISO date
- `page`: number
- `limit`: number

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "timestamp": "ISO date",
      "userId": "string",
      "userName": "string",
      "action": "create|update|delete|view|login|logout",
      "resource": "case|document|user",
      "resourceId": "string",
      "ipAddress": "string",
      "userAgent": "string",
      "details": "object"
    }
  ]
}
```

#### POST /api/audit-logs
**Purpose:** Create audit log entry (system internal)
**Request Body:**
```json
{
  "action": "string",
  "resource": "string",
  "resourceId": "string",
  "details": "object"
}
```

---

## 7. Notifications

### Endpoints

#### GET /api/notifications
**Purpose:** Get user notifications
**Query Parameters:**
- `unreadOnly`: boolean
- `page`: number
- `limit`: number

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "type": "hearing|document|assignment|system",
      "title": "string",
      "message": "string",
      "read": "boolean",
      "createdAt": "ISO date",
      "relatedResource": {
        "type": "case|document",
        "id": "string"
      }
    }
  ],
  "unreadCount": "number"
}
```

#### PUT /api/notifications/:id/read
**Purpose:** Mark notification as read

#### PUT /api/notifications/read-all
**Purpose:** Mark all notifications as read

#### DELETE /api/notifications/:id
**Purpose:** Delete notification

---

## 8. Calendar & Scheduling

### Endpoints

#### GET /api/calendar/hearings
**Purpose:** Get scheduled hearings
**Query Parameters:**
- `startDate`: ISO date
- `endDate`: ISO date
- `judgeId`: string
- `courtRoom`: string

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "caseId": "string",
      "caseNumber": "string",
      "title": "string",
      "date": "ISO date",
      "time": "string",
      "courtRoom": "string",
      "type": "hearing|chambers|deliberation",
      "judge": {
        "id": "string",
        "name": "string"
      },
      "status": "scheduled|completed|postponed|cancelled"
    }
  ]
}
```

#### POST /api/calendar/hearings
**Purpose:** Schedule new hearing
**Request Body:**
```json
{
  "caseId": "string",
  "date": "ISO date",
  "time": "string",
  "courtRoom": "string",
  "type": "string"
}
```

#### PUT /api/calendar/hearings/:id
**Purpose:** Update hearing schedule

#### DELETE /api/calendar/hearings/:id
**Purpose:** Cancel hearing

---

## 9. Partner Interoperability

### Endpoints

#### GET /api/partners
**Purpose:** Get list of partner organizations
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "type": "police|prison|ministry|agency",
      "status": "active|inactive",
      "apiEndpoint": "string",
      "lastSync": "ISO date"
    }
  ]
}
```

#### POST /api/partners/:id/sync
**Purpose:** Sync data with partner system
**Request Body:**
```json
{
  "dataType": "cases|inmates|evidence",
  "filters": "object"
}
```

#### GET /api/partners/:id/data
**Purpose:** Get data from partner system
**Query Parameters:**
- `type`: string
- `id`: string

---

## 10. System Administration

### Endpoints

#### GET /api/admin/system-health
**Purpose:** Get system health metrics
**Response:**
```json
{
  "success": true,
  "data": {
    "database": {
      "status": "operational|degraded|down",
      "responseTime": "number (ms)"
    },
    "storage": {
      "used": "number (bytes)",
      "total": "number (bytes)",
      "percentage": "number"
    },
    "services": [
      {
        "name": "string",
        "status": "operational|degraded|down",
        "uptime": "number (seconds)"
      }
    ]
  }
}
```

#### GET /api/admin/logs
**Purpose:** Get system logs (IT admin only)

#### POST /api/admin/backup
**Purpose:** Trigger system backup

#### GET /api/admin/settings
**Purpose:** Get system settings

#### PUT /api/admin/settings
**Purpose:** Update system settings
**Request Body:**
```json
{
  "key": "string",
  "value": "any"
}
```

---

## Security Requirements

### Authentication
- All endpoints (except login/register) require JWT authentication
- Token should be sent in Authorization header: `Bearer {token}`
- Tokens should expire after 24 hours
- Refresh tokens should be implemented for seamless re-authentication

### Authorization
- Role-based access control (RBAC) for all endpoints
- Each role should have specific permissions:
  - **Judge**: View/update assigned cases, schedule hearings, write judgments
  - **Registrar**: Create/assign cases, manage documents, approve filings
  - **Clerk**: Upload documents, manage files, process paperwork
  - **Lawyer**: View assigned cases, upload documents, file motions
  - **Admin**: Full system access, user management, system settings
  - **Auditor**: Read-only access to all data, audit logs
  - **Partner**: Limited API access for data sync

### Data Validation
- All inputs should be validated and sanitized
- File uploads should be scanned for malware
- Maximum file size: 50MB per document
- Allowed file types: PDF, DOC, DOCX, JPG, PNG, ZIP

### Rate Limiting
- Implement rate limiting to prevent abuse
- Suggested limits:
  - Authentication: 5 attempts per 15 minutes
  - API calls: 100 requests per minute per user
  - File uploads: 10 uploads per hour per user

### Logging
- All actions should be logged to audit trail
- Logs should include: timestamp, user, action, resource, IP address
- Sensitive data (passwords, tokens) should never be logged

---

## Database Schema Suggestions

### Users Table
- id, name, email, password_hash, role, department, staff_id, phone, status, created_at, updated_at

### Cases Table
- id, case_number, title, type, status, priority, description, filed_date, next_hearing, judge_id, created_by, created_at, updated_at

### Documents Table
- id, name, type, case_id, uploaded_by, uploaded_at, file_path, file_size, status, approved_by, approved_at

### Case_Parties Table
- id, case_id, role (plaintiff/defendant), name, lawyer_id, created_at

### Case_Timeline Table
- id, case_id, date, title, description, type, created_by, created_at

### Hearings Table
- id, case_id, date, time, court_room, type, status, judge_id, created_at, updated_at

### Audit_Logs Table
- id, timestamp, user_id, action, resource, resource_id, ip_address, user_agent, details

### Notifications Table
- id, user_id, type, title, message, read, related_resource_type, related_resource_id, created_at

---

## File Storage

### Recommendations
- Use cloud storage (AWS S3, Azure Blob, Google Cloud Storage) for documents
- Implement CDN for faster document delivery
- Store file metadata in database, actual files in cloud storage
- Implement virus scanning on upload
- Generate signed URLs for secure document access
- Implement automatic backup and versioning

---

## Additional Features to Implement

1. **Email Notifications**
   - Send emails for hearing schedules, case assignments, document approvals
   - Use email templates for consistency

2. **SMS Notifications** (Optional)
   - Send SMS for urgent notifications
   - Hearing reminders 24 hours before

3. **Search Functionality**
   - Full-text search across cases, documents, users
   - Implement Elasticsearch or similar for better performance

4. **Data Export**
   - Export cases, reports to PDF, Excel, CSV
   - Generate official court documents with proper formatting

5. **Backup & Recovery**
   - Automated daily backups
   - Point-in-time recovery capability
   - Disaster recovery plan

6. **Performance Monitoring**
   - Track API response times
   - Monitor database query performance
   - Set up alerts for system issues

---

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### Common Error Codes
- `AUTH_REQUIRED`: Authentication required
- `AUTH_INVALID`: Invalid credentials
- `AUTH_EXPIRED`: Token expired
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Input validation failed
- `SERVER_ERROR`: Internal server error

---

## Testing Requirements

1. **Unit Tests**: Test individual functions and methods
2. **Integration Tests**: Test API endpoints
3. **Load Tests**: Test system under heavy load
4. **Security Tests**: Penetration testing, vulnerability scanning
5. **User Acceptance Tests**: Test with actual users

---

## Deployment Considerations

1. **Environment Variables**
   - Database credentials
   - JWT secret keys
   - Cloud storage credentials
   - Email/SMS API keys
   - Partner API credentials

2. **Scaling**
   - Use load balancer for multiple server instances
   - Implement database read replicas
   - Use caching (Redis) for frequently accessed data

3. **Monitoring**
   - Set up application monitoring (New Relic, Datadog)
   - Log aggregation (ELK stack, Splunk)
   - Uptime monitoring
   - Error tracking (Sentry)

---

This document provides a comprehensive overview of all backend requirements. Implement these endpoints with proper security, validation, and error handling for a production-ready system.
