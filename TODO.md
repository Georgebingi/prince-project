# TODO: Fix Login Persistence and Auto-Update User Info

## Backend Changes
- [x] Add refresh token endpoint in Backend/src/routes/auth.js
- [x] Add profile endpoint in Backend/src/routes/users.js

## Frontend Changes
- [x] Update api.ts to handle refresh tokens (store, retrieve, remove)
- [x] Add refresh API call in authApi
- [x] Add profile API call in usersApi
- [x] Update AuthContext.tsx to:
  - Store refresh token on login
  - Attempt token refresh on app load if user exists
  - Add periodic user info update
  - Handle token expiry gracefully

## Testing
- [ ] Test login persistence across page refreshes
- [ ] Test multiple browser sessions independence
- [ ] Test auto-update of user info
