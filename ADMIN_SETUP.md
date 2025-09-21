# OG Lab Admin Panel Setup Guide

## Overview

This guide will help you set up the admin panel for the OG Lab website, which allows you to manage menu items, pricing, and site theme through a web interface.

## Prerequisites

- Supabase account
- UploadThing account (for logo uploads)
- Node.js and npm installed

## Step 1: Supabase Setup

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key from the project settings

### 1.2 Set up the Database

1. In your Supabase dashboard, go to the SQL Editor
2. Run the SQL script from `supabase-schema.sql` to create the necessary tables and policies

### 1.3 Create Admin User

1. In Supabase dashboard, go to Authentication > Users
2. Create a new user with your admin email and password
3. After creation, go to the SQL Editor and run:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

## Step 2: UploadThing Setup

### 2.1 Create UploadThing Account

1. Go to [uploadthing.com](https://uploadthing.com) and create an account
2. Create a new app and note down your App ID and Secret

## Step 3: Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# UploadThing Configuration
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id

# Feature Flags
ENABLE_ADMIN=true

# Legacy Google Sheets (for migration only)
GS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GS_SHEET_ID=your-google-sheet-id
GS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

## Step 4: Data Migration (Optional)

If you have existing data in Google Sheets, you can migrate it to Supabase:

### 4.1 Prepare Migration

1. Ensure your Google Sheets API credentials are set up in the environment variables
2. Make sure your admin user has the 'admin' role (not just 'menu-user')

### 4.2 Run Migration

1. Start your development server: `npm run dev`
2. Log in to the admin panel at `http://localhost:3000/admin`
3. Use the migration API endpoint or create a temporary migration page

Alternatively, you can run the migration programmatically:

```javascript
// In a Node.js script or API route
import { migrateFromGoogleSheets } from '@/lib/migrate-data';

const result = await migrateFromGoogleSheets();
console.log(result);
```

## Step 5: Testing the Admin Panel

### 5.1 Start the Application

```bash
npm run dev
```

### 5.2 Access Admin Panel

1. Navigate to `http://localhost:3000/admin/login`
2. Log in with your admin credentials
3. You should see the admin dashboard

### 5.3 Test Features

- **Menu Management**: Go to `/admin/menu` to add, edit, and delete menu items
- **Theme Management**: Go to `/admin/theme` to change colors and upload logos
- **Public Site**: Check that changes reflect on the public pages

## Step 6: Production Deployment

### 6.1 Environment Variables

Set up the same environment variables in your production environment.

### 6.2 Database Policies

Ensure Row Level Security (RLS) is enabled and policies are correctly set up in production.

### 6.3 Security Considerations

- Use strong passwords for admin accounts
- Regularly rotate API keys
- Monitor admin access logs
- Consider setting up IP restrictions if needed

## Features

### Menu Management
- Add, edit, and delete menu items
- Set prices for different quantities (1g, 5g, 20g, 1pc)
- Categorize products
- Set THC/CBG percentages
- Mark items as "Our" (farm-grown)

### Theme Management
- Change primary and secondary colors
- Upload custom SVG logos (max 200KB)
- Preview changes before applying
- Automatic color application across the site

### User Management
- Role-based access control
- Admin and menu-user roles
- Secure authentication via Supabase Auth

## API Endpoints

- `POST /api/revalidate` - Trigger page revalidation after changes
- `POST /api/migrate` - Migrate data from Google Sheets (admin only)
- `POST /api/uploadthing` - Handle file uploads

## Troubleshooting

### Common Issues

1. **"Unauthorized" error**: Check that your user has the correct role in the profiles table
2. **Database connection issues**: Verify your Supabase credentials and that RLS policies are set up correctly
3. **Upload failures**: Check UploadThing configuration and file size limits
4. **Theme not applying**: Ensure revalidation is working and check browser cache

### Debug Steps

1. Check browser console for JavaScript errors
2. Verify environment variables are loaded correctly
3. Check Supabase logs for database errors
4. Test API endpoints directly using tools like Postman

## Support

For issues specific to this implementation, check:
- Supabase documentation for database and auth issues
- UploadThing documentation for file upload issues
- Next.js documentation for framework-related questions

## Security Notes

- Never commit `.env.local` or `.env.production` files to version control
- Use service role keys only on the server side
- Regularly audit user access and permissions
- Keep dependencies updated for security patches
