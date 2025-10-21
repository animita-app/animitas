# Vercel Deployment Guide - Animitas

This guide covers deploying the Animitas Next.js frontend to Vercel with a PostgreSQL database.

---

## Overview

Animitas is a monorepo containing:
- **Frontend**: Next.js 15 application with built-in API routes (deploys to Vercel)
  - Self-contained with `/api/*` endpoints connecting directly to PostgreSQL
  - No external backend URL needed for frontend functionality
- **Backend**: Express.js API (optional - separate service, used by mobile app or external consumers)
- **Mobile**: React Native app (separate deployment, uses Express backend if deployed)

**Architecture Note**: The frontend is **self-contained**. It doesn't need the Express backend URL because it has its own API routes. You only need the Express backend if:
1. You're deploying a mobile app that consumes the backend API
2. You need a separate microservice for specific tasks
3. You want to decouple the API from the frontend

This guide focuses on deploying the **frontend** to Vercel.

---

## Prerequisites

1. **Vercel Account**
   - Create account at https://vercel.com
   - Verify email

2. **PostgreSQL Database**
   - Local PostgreSQL 15+ with PostGIS extension, OR
   - Cloud-hosted PostgreSQL (Neon, Railway, AWS RDS, or similar)

3. **GitHub Account**
   - Repository pushed to GitHub (enables automatic deployments)

4. **Node.js & npm**
   - Node.js >=18.0.0
   - npm >=8.0.0

5. **Third-Party Service Credentials**
   - Mapbox API token: https://account.mapbox.com/tokens/
   - Cloudinary account: https://cloudinary.com (for image uploads)
   - Twilio account: https://www.twilio.com (for SMS verification)

---

## Step 1: Prepare PostgreSQL Database

### Option A: Use Existing Local PostgreSQL

If you have PostgreSQL running locally:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user (if not already created)
CREATE DATABASE animitas_db;
CREATE USER animitas_user WITH PASSWORD 'your_secure_password';
ALTER ROLE animitas_user SET client_encoding TO 'utf8';
ALTER ROLE animitas_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE animitas_user SET default_transaction_deferrable TO on;
ALTER ROLE animitas_user SET default_transaction_read_only TO off;
ALTER USER animitas_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE animitas_db TO animitas_user;

# Exit psql
\q

# Enable PostGIS extension
psql -U animitas_user -d animitas_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

### Option B: Use Cloud-Hosted PostgreSQL (Recommended for Production)

**Using Neon (recommended):**

1. Go to https://neon.tech
2. Sign up and create project
3. Create database
4. Copy connection string: `postgresql://user:password@host/dbname`

**Using Railway:**

1. Go to https://railway.app
2. Create new project → Add PostgreSQL
3. Connect and copy connection string

**Using AWS RDS:**

1. Create RDS PostgreSQL instance
2. Enable PostGIS extension
3. Copy connection string

### Run Database Migrations

```bash
cd frontend

# Set local DATABASE_URL temporarily for migration
export DATABASE_URL="postgresql://animitas_user:your_password@localhost:5432/animitas_db"

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed

# Verify
npx prisma studio  # Opens visual database explorer
```

---

## Step 2: Set Up Vercel Project

### 2.1 Connect GitHub Repository

1. Go to https://vercel.com/new
2. Select **Import Git Repository**
3. Choose GitHub account and repository (`animitas`)
4. Click **Import**

### 2.2 Configure Project Settings

**Project Name**: `animitas` (or your preference)

**Framework Preset**: Next.js (auto-detected)

**Root Directory**: Set to `frontend`
- Vercel will run `npm install` and `npm run build` from this directory

**Environment Variables**: Skip for now, configure in Step 3

**Build Settings** (should be auto-detected):
- Build Command: `npm run build`
- Output Directory: `.next`

Click **Deploy**

---

## Step 3: Configure Environment Variables

### 3.1 Add Environment Variables in Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add the following variables:

**Database** (Required)
```
DATABASE_URL = postgresql://user:password@neon.tech/dbname?sslmode=require
```
⚠️ **Important**: Use your Neon PostgreSQL connection string. Add `?sslmode=require` for SSL.

**Authentication** (Required)
```
NEXTAUTH_URL = https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET = (generate with: openssl rand -base64 32)
```

**Maps & Location** (Required for map functionality)
```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = pk.eyJ...
```

**Image Upload (Cloudinary)** (Required for memorial images)
```
CLOUDINARY_URL = cloudinary://key:secret@cloud
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET = unsigned_preset_name
```

**SMS (Twilio)** (Required for phone authentication)
```
TWILIO_ACCOUNT_SID = AC...
TWILIO_AUTH_TOKEN = your_token
TWILIO_PHONE_NUMBER = +1234567890
```

**Optional**
```
REDIS_URL = redis://host:port
NODE_ENV = production
```

**⚠️ Do NOT add a backend URL variable** - The frontend has its own API routes and doesn't need one.

### 3.2 Generate NEXTAUTH_SECRET

Run locally:
```bash
openssl rand -base64 32
```

Copy output and paste into `NEXTAUTH_SECRET` variable in Vercel.

### 3.3 Apply Environment Variables

After adding all variables:
- Click **Save**
- Vercel will automatically redeploy with new variables

---

## Step 4: Set Up Custom Domain (Optional)

1. Go to **Settings → Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `animitas.com`)
4. Follow DNS configuration instructions for your domain registrar
5. Wait for DNS propagation (5-15 minutes)

**Update NEXTAUTH_URL** if using custom domain:
- Change `NEXTAUTH_URL` to `https://animitas.com`
- Re-deploy

---

## Step 5: Verify Deployment

### 5.1 Check Deployment Status

1. In Vercel dashboard, check **Deployments** tab
2. Most recent deployment should show ✅ (Success)

### 5.2 Test API Routes

```bash
# Test API accessibility
curl https://your-vercel-domain.vercel.app/api/memorials

# Check authentication
curl https://your-vercel-domain.vercel.app/api/auth/providers
```

### 5.3 Test Application

1. Visit `https://your-vercel-domain.vercel.app`
2. Test home page loads
3. Try sign-up flow
4. Verify map displays correctly
5. Test memorial creation

### 5.4 Check Logs

1. Go to **Deployments → Latest Deployment → Logs**
2. Look for any errors or warnings
3. Verify database connection successful

---

## Step 6: Database Migrations on Production

### 6.1 Automatic Migrations (Recommended)

Add a pre-deployment script:

1. Create `/frontend/scripts/vercel-build.sh`:
```bash
#!/bin/bash
set -e

# Run migrations before build
npx prisma migrate deploy

# Run build
npm run build
```

2. Update `vercel.json` in root directory:
```json
{
  "buildCommand": "cd frontend && npm run build",
  "installCommand": "cd frontend && npm install"
}
```

### 6.2 Manual Migrations

If automatic migrations fail:

1. In Vercel logs, check migration errors
2. Connect to database manually:
```bash
DATABASE_URL="your_production_database_url" npx prisma migrate deploy
```

3. Re-deploy:
```bash
vercel --prod
```

---

## Step 7: Configure Automatic Deployments

### 7.1 Git Integration (Default)

Vercel automatically deploys when:
- You push to `main` branch (Production)
- You create pull requests (Preview)

### 7.2 Deployment Settings

1. Go to **Settings → Git → Git Configuration**
2. Configure:
   - **Production Branch**: `main`
   - **Preview Branches**: All (or specific)
   - **Automatic Deployments**: Enabled (default)

### 7.3 Environment Variables per Environment

You can set different env vars for Preview and Production:

1. **Settings → Environment Variables**
2. Select environment from dropdown:
   - Production
   - Preview
   - Development

Example:
```
NEXTAUTH_URL = https://your-domain.vercel.app (Production only)
NEXTAUTH_URL = https://pr-*.your-domain.vercel.app (Preview)
```

---

## Step 8: Post-Deployment - What's Next?

### 8.1 Verify Frontend is Working

After your first successful deployment:

1. **Visit your deployed site**: `https://your-vercel-domain.vercel.app`
2. **Test the following**:
   - Home page loads with map
   - Map displays animitas (memorial pins)
   - Click a pin → modal opens with memorial details
   - Try creating a memorial (if auth is enabled)
   - Verify images upload to Cloudinary
   - Test phone authentication (SMS verification)

### 8.2 Run Database Migrations on Production

If you haven't already, run migrations on your Neon database:

```bash
# Set the production database URL
export DATABASE_URL="postgresql://user:password@neon.tech/dbname?sslmode=require"

# Run migrations
npx prisma migrate deploy

# Optional: Seed initial data
npx prisma db seed
```

### 8.3 About the Express Backend (Optional)

You deployed an Express backend, but your **Next.js frontend doesn't use it**. The frontend has its own API routes at `/api/*`.

**When to use the Express backend:**
- Mobile app development (React Native) that needs a separate API
- External applications consuming your API
- Microservice architecture for scaling

**To deploy Express backend (optional):**

See Section 9 below for deployment options.

### 8.4 Post-Deployment Checklist

- [ ] Frontend deployed on Vercel
- [ ] Neon PostgreSQL database created and connected
- [ ] Database migrations run on production
- [ ] All environment variables set in Vercel dashboard
- [ ] Frontend loads and displays correctly
- [ ] Map displays animitas pins
- [ ] Can create/edit memorials
- [ ] Image uploads work (Cloudinary)
- [ ] Phone auth works (Twilio SMS)
- [ ] Admin panel accessible (if implemented)

---

## Step 9: Deploy Backend (Optional)

If you want to deploy the Express backend separately:

### Option A: Deploy to Vercel (Serverless Functions)

**Note**: Vercel serverless has 10-second timeout limit. For long-running tasks, use Railway or similar.

1. Create `/vercel.json` in `/backend`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ]
}
```

2. Connect backend repository to Vercel
3. Deploy

### Option B: Deploy to Railway (Recommended)

1. Go to https://railway.app
2. Create new project → Deploy from GitHub
3. Select `/backend` as root directory
4. Add environment variables
5. Deploy

### Option C: Deploy with Docker

Use services like:
- **Heroku** (declining - use Railway instead)
- **DigitalOcean App Platform**
- **AWS ECS/Lightsail**
- **Google Cloud Run**

---

## Step 9: Monitor & Maintain

### 9.1 Enable Monitoring

1. Go to **Settings → Analytics & Monitoring**
2. Enable **Real User Monitoring (RUM)**
3. Enable **Performance**

### 9.2 Set Up Alerts

1. **Settings → Alerts**
2. Create alert for:
   - Build failures
   - High error rates
   - Performance degradation

### 9.3 Regular Tasks

**Weekly:**
- Check Vercel analytics dashboard
- Review error logs
- Monitor database performance

**Monthly:**
- Update dependencies: `npm update`
- Run security audit: `npm audit fix`
- Review database backups

---

## Troubleshooting

### Issue: "Database connection failed"

**Solution:**
1. Verify `DATABASE_URL` is set in environment variables
2. Test connection locally: `npx prisma db execute --stdin < query.sql`
3. Check IP whitelist if using cloud database (add Vercel IPs)
4. Enable debug mode: Set `DEBUG=*` in environment

### Issue: "Module not found" during build

**Solution:**
```bash
# Clean install
npm ci
# Rebuild
npm run build
```

### Issue: "NEXTAUTH_SECRET is missing"

**Solution:**
1. Generate new secret: `openssl rand -base64 32`
2. Add to Vercel environment variables
3. Re-deploy

### Issue: API routes return 404

**Solution:**
1. Verify `next.config.js` is correct
2. Check API route path: `/api/route.ts` must exist
3. Verify environment variables are set
4. Clear `.next` folder: `rm -rf frontend/.next`

### Issue: Images not loading (Cloudinary)

**Solution:**
1. Verify `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set
2. Check Cloudinary account credentials
3. Verify unsigned upload preset is configured
4. Test upload: Go to upload form and test

### Issue: SMS verification not working (Twilio)

**Solution:**
1. Verify Twilio credentials are set
2. Check phone number format: `+1234567890`
3. Test locally first
4. Check Twilio logs for errors

---

## Performance Optimization

### 1. Enable Edge Caching

Add to `next.config.js`:
```javascript
headers: [
  {
    source: '/:path*',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=3600'
      }
    ]
  }
]
```

### 2. Enable Image Optimization

Already configured for Cloudinary, but ensure:
```javascript
images: {
  domains: ['res.cloudinary.com']
}
```

### 3. Enable Streaming

Next.js 15 already supports streaming. No configuration needed.

---

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env.local` to git
   - Use Vercel dashboard for secrets
   - Rotate secrets quarterly

2. **Database**
   - Enable SSL: Add `?sslmode=require` to `DATABASE_URL`
   - Use VPC if available
   - Regular backups

3. **API Keys**
   - Restrict Mapbox token to your domain
   - Use unsigned Cloudinary presets (frontend uploads)
   - Rotate Twilio auth tokens

4. **CORS & Headers**
   - Already configured in `next.config.js`
   - Review for production domain

---

## Rollback & Recovery

### Quick Rollback

1. Go to **Deployments**
2. Click on previous successful deployment
3. Click **Redeploy** button

### Database Rollback

```bash
# List migrations
npx prisma migrate status

# Rollback last migration
npx prisma migrate resolve --rolled-back migration_name

# Re-run
npx prisma migrate deploy
```

---

## Cost Estimation

**Vercel Pricing** (as of 2024):
- **Hobby (Free)**: Up to 100GB bandwidth/month, limited logs
- **Pro**: $20/month, 1TB bandwidth, advanced features
- **Enterprise**: Custom pricing

**Database Hosting** (e.g., Neon):
- **Free tier**: Up to 10GB storage
- **Pro**: Starting $15/month
- Scalable as needed

**Total Monthly Cost**: $20-50+ depending on traffic and storage

---

## Next Steps

1. **Verify Frontend Deployment**: Follow Step 8 - your Next.js frontend is self-contained
2. **Run Database Migrations**: Set DATABASE_URL and run `npx prisma migrate deploy` on Neon
3. **Test Thoroughly**: Visit your Vercel URL and test all features
4. **Deploy Backend** (optional): Only if you need a separate API for mobile or external apps (Step 9)
5. **Set Up CI/CD**: GitHub Actions for automated testing
6. **Monitor**: Set up alerts and logging in Vercel dashboard

**Important**: Your frontend doesn't need a backend URL. It uses its own API routes connecting directly to Neon PostgreSQL.

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment/vercel)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [PostgreSQL Cloud Hosting](https://wiki.postgresql.org/wiki/Hosted_PostgreSQL)
- [NextAuth.js Documentation](https://next-auth.js.org/getting-started/example)

---

## Support

For issues:
1. Check Vercel logs: **Deployments → Build Logs & Logs**
2. Test locally: `npm run dev`
3. Check database: `npx prisma studio`
4. Review error tracking (if configured)
