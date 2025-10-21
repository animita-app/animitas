# Backend Auth Setup Guide

This guide explains the Auth.js (NextAuth v5) backend implementation with email/password authentication.

## ✅ What Was Implemented

### 1. **Prisma Schema Updates** (`prisma/schema.prisma`)
- Added `password` field (nullable, for hashed passwords)
- Made `phone` field optional (changed from required to nullable)
- Username remains `@unique` and required

### 2. **Auth Configuration** (`lib/auth.ts`)
- **Auth.js v5** setup with PrismaAdapter
- **Credentials Provider** for email + password authentication
- Password verification using bcrypt
- JWT session strategy for token-based auth
- Callbacks for JWT enrichment and session data
- Automatic redirect to `/` after successful login

### 3. **Registration Endpoint** (`app/api/auth/register`)
- Validates input with Zod schema:
  - Email format validation
  - Username: 3-30 chars, alphanumeric + underscore/hyphen
  - Password: 8+ chars with uppercase, lowercase, number
  - Display name: 2-100 chars (optional)
- Checks for duplicate email or username
- Hashes password with bcrypt (12 salt rounds)
- Returns user data on success (excludes password)

### 4. **NextAuth Handler** (`app/api/auth/[...nextauth]/route.ts`)
- Exports GET/POST handlers from auth configuration
- Handles all OAuth flow endpoints automatically

### 5. **Middleware** (`middleware.ts`)
- Protects all routes except `/auth` and `/api/auth/register`
- Redirects unauthenticated users to `/auth` with `redirectTo` param
- Prevents authenticated users from accessing `/auth`
- Allows all `/api/*` routes through

### 6. **Layout Update** (`app/layout.tsx`)
- Fetches session server-side with `await auth()`
- Passes session to `Providers` component

## 🚀 Environment Variables Required

Add to your `.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
DATABASE_URL=postgresql://user:password@localhost:5432/animitas_db
```

## 📝 API Endpoints

### Registration
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "SecurePass123",
  "displayName": "John Doe"  // optional
}

Response (201):
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "cuid_here",
    "email": "user@example.com",
    "username": "john_doe",
    "displayName": "John Doe"
  }
}
```

### Sign In (via NextAuth Credentials)
```
POST /api/auth/callback/credentials
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response: Redirects to "/" with session cookie set
```

### Get Session
```
GET /api/auth/session
Response: Current user session or null if not authenticated
```

### Sign Out
```
POST /api/auth/signout
Response: Redirects to "/auth" with session cleared
```

## 🔐 Session Data Structure

After authentication, the session contains:
```typescript
{
  user: {
    id: string
    email: string
    username: string
    name: string
    image: string | null
  }
}
```

## 🛠 Using Auth in Components

### Server Components
```typescript
import { auth } from '@/lib/auth'

export default async function Page() {
  const session = await auth()

  if (!session) {
    redirect('/auth')
  }

  return <div>Welcome, {session.user.username}</div>
}
```

### Client Components
```typescript
'use client'
import { useSession } from 'next-auth/react'
import { signOut } from '@/lib/auth'

export function UserMenu() {
  const { data: session } = useSession()

  return (
    <div>
      {session?.user.username}
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}
```

## 🚦 Route Protection Flow

1. **Unauthenticated user visits protected route** → Middleware redirects to `/auth`
2. **User submits registration** → `/api/auth/register` creates user with hashed password
3. **User submits login** → Credentials Provider verifies password
4. **Auth.js creates session** → Sets secure HTTP-only cookie
5. **Middleware allows access** → User can access protected routes
6. **User signs out** → Session cleared, redirected to `/auth`

## 🔄 Integrating with Existing Phone Auth

Your existing phone-based auth (OTP) can coexist:
- Phone users: `phone` field populated, `password` nullable
- Email users: `email` field populated, `phone` nullable
- Both: Can migrate between or support both flows

To support both:
1. Add additional provider (if needed)
2. Adjust auth callbacks to handle different auth flows
3. Update middleware public routes if needed

## ⚠️ Important Notes

- **NEVER** expose `password` in API responses
- **ALWAYS** use HTTPS in production
- **KEEP** `NEXTAUTH_SECRET` secure and never commit to repo
- **USE** environment variables for all secrets
- **HASH** passwords before storing (already done with bcrypt)
- **VALIDATE** all user input (Zod schema enforced)

## 🐛 Debugging

Check NextAuth logs by enabling debug mode:
```env
NEXTAUTH_DEBUG=true
```

Session issues? Verify:
- `NEXTAUTH_SECRET` is set and consistent
- `NEXTAUTH_URL` matches your deployment URL
- Database connection is working
- Cookies enabled in browser

## 📚 Next Steps

1. Test registration with `/api/auth/register`
2. Test login with NextAuth Credentials UI or your frontend form
3. Verify session persists across page refreshes
4. Test middleware route protection
5. Implement forgot password if needed
6. Add email verification if needed
7. Set up rate limiting for registration (optional)
