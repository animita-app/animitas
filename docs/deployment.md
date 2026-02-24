# Production Deployment Guide

## Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- Docker Desktop (for Supabase local development)
- Supabase account (for production)

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# ElevenLabs (optional - for audio generation)
ELEVENLABS_API_KEY=your_elevenlabs_key
```

## Local Development

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Supabase (requires Docker Desktop)
```bash
supabase start
supabase db reset  # Apply migrations and seed data
```

### 3. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

## Production Build

### 1. Build the Application
```bash
npm run build
```

### 2. Test Production Build Locally
```bash
npm run start
```

### 3. Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - NEXT_PUBLIC_MAPBOX_TOKEN
# - ELEVENLABS_API_KEY (optional)
```

## Database Setup (Production)

### 1. Create Supabase Project
- Go to https://supabase.com
- Create new project
- Note your project URL and anon key

### 2. Run Migrations
```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 3. Seed Data
```bash
# Run seed script
npm run seed:users  # Requires SUPABASE_SERVICE_ROLE_KEY
```

Or manually run the SQL from `supabase/migrations/01_seed.sql` in the Supabase SQL editor.

## Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test authentication flow (signup/login)
- [ ] Verify map loads with markers
- [ ] Test creation flow (/add)
- [ ] Test detail pages
- [ ] Verify Research Mode toggle (for editor role)
- [ ] Check RLS policies are working
- [ ] Test mobile responsiveness
- [ ] Run accessibility audit
- [ ] Monitor error logs

## Performance Optimization

### Recommended Settings
- Enable Next.js Image Optimization
- Configure CDN for static assets
- Enable Supabase connection pooling
- Set up caching headers for API routes

### Monitoring
- Set up Vercel Analytics
- Configure Supabase monitoring
- Add error tracking (e.g., Sentry)

## Troubleshooting

### RLS Permission Errors
If you see "permission denied for table heritage_sites":
1. Ensure Docker Desktop is running
2. Run `supabase db reset`
3. Verify RLS policies in Supabase dashboard

### Build Failures
- Check Node.js version (>= 18.0.0)
- Clear `.next` folder and rebuild
- Verify all dependencies are installed

### Map Not Loading
- Verify NEXT_PUBLIC_MAPBOX_TOKEN is set
- Check browser console for errors
- Ensure Mapbox token has correct permissions

## Security Notes

- Never commit `.env` files
- Use environment variables for all secrets
- Enable RLS on all Supabase tables
- Implement rate limiting on API routes
- Use HTTPS in production
- Regularly update dependencies

## Support

For issues or questions:
- Check `docs/testing-playbook.md`
- Review `docs/architecture.md`
- See `docs/progress.md` for current status
