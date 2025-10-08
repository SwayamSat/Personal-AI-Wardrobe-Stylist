# 🚀 Deployment Guide - Personal AI Wardrobe Stylist

This guide will walk you through deploying your Personal AI Wardrobe Stylist to production.

## 📋 Prerequisites

- GitHub repository with your code
- Supabase account
- Vercel account (recommended) or other hosting provider
- Google Cloud Console account (for OAuth)

## 🎯 Quick Start (Vercel)

### 1. Prepare Your Repository

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit - Production ready"
   git push origin main
   ```

2. **Ensure all files are committed**
   - `.env.local` should NOT be committed (it's in .gitignore)
   - All source code should be committed
   - Documentation files should be committed

### 2. Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure the project:**
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)

### 3. Set Environment Variables

In Vercel dashboard, go to Settings → Environment Variables and add:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Deploy

Click "Deploy" and wait for the build to complete.

## 🔧 Supabase Production Setup

### 1. Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clothes table
CREATE TABLE clothes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  category TEXT CHECK (category IN ('top', 'bottom', 'shoe', 'accessory')) NOT NULL,
  color TEXT NOT NULL,
  material TEXT,
  embedding JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create outfits table
CREATE TABLE outfits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  top_id UUID REFERENCES clothes(id) ON DELETE CASCADE,
  bottom_id UUID REFERENCES clothes(id) ON DELETE CASCADE,
  shoe_id UUID REFERENCES clothes(id) ON DELETE CASCADE,
  accessory_id UUID REFERENCES clothes(id) ON DELETE CASCADE,
  occasion TEXT CHECK (occasion IN ('casual', 'office', 'party', 'formal')),
  score FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own clothes" ON clothes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own clothes" ON clothes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own clothes" ON clothes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own clothes" ON clothes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own outfits" ON outfits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own outfits" ON outfits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own outfits" ON outfits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own outfits" ON outfits FOR DELETE USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 2. Storage Setup

1. **Create Storage Bucket**
   - Go to Storage in Supabase dashboard
   - Click "New Bucket"
   - Name: `clothes`
   - Public: Yes

2. **Set Storage Policies**
   ```sql
   -- Storage policies
   CREATE POLICY "Users can upload their own clothes" ON storage.objects 
   FOR INSERT WITH CHECK (bucket_id = 'clothes' AND auth.uid()::text = (storage.foldername(name))[1]);
   
   CREATE POLICY "Users can view their own clothes" ON storage.objects 
   FOR SELECT USING (bucket_id = 'clothes' AND auth.uid()::text = (storage.foldername(name))[1]);
   
   CREATE POLICY "Users can update their own clothes" ON storage.objects 
   FOR UPDATE USING (bucket_id = 'clothes' AND auth.uid()::text = (storage.foldername(name))[1]);
   
   CREATE POLICY "Users can delete their own clothes" ON storage.objects 
   FOR DELETE USING (bucket_id = 'clothes' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

### 3. Authentication Setup

1. **Enable Google OAuth**
   - Go to Authentication → Providers in Supabase
   - Enable Google provider
   - Add your Google OAuth credentials

2. **Set Redirect URLs**
   - Site URL: `https://your-domain.vercel.app`
   - Redirect URLs: `https://your-domain.vercel.app/auth/callback`

## 🔐 Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API

### 2. Create OAuth Credentials

1. Go to APIs & Services → Credentials
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Application type: Web application
4. Authorized redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `https://your-domain.vercel.app/auth/callback`

### 3. Configure Supabase

1. Copy Client ID and Client Secret
2. Add them to Supabase Authentication settings
3. Update redirect URLs

## 🌐 Custom Domain (Optional)

### 1. Add Domain to Vercel

1. Go to your project in Vercel dashboard
2. Go to Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions

### 2. Update Supabase Settings

1. Update Site URL in Supabase Auth settings
2. Add new redirect URLs
3. Update environment variables if needed

## 🔍 Testing Your Deployment

### 1. Basic Functionality

- [ ] Home page loads correctly
- [ ] Google sign-in works
- [ ] Upload page is accessible after sign-in
- [ ] File upload works
- [ ] AI analysis completes
- [ ] Outfits page shows recommendations

### 2. Performance

- [ ] Page load times are acceptable
- [ ] AI model loads without errors
- [ ] Images upload and display correctly
- [ ] Mobile responsiveness works

### 3. Security

- [ ] Users can only see their own data
- [ ] File uploads are secure
- [ ] Authentication is working properly

## 🚨 Troubleshooting

### Common Issues

1. **Environment Variables Not Working**
   - Check Vercel environment variables are set correctly
   - Ensure variable names match exactly
   - Redeploy after adding new variables

2. **Supabase Connection Issues**
   - Verify URL and key are correct
   - Check if project is active
   - Ensure RLS policies are set up

3. **Google OAuth Not Working**
   - Check redirect URLs match exactly
   - Verify Google Cloud Console settings
   - Check Supabase Auth configuration

4. **AI Model Loading Issues**
   - Check browser console for errors
   - Verify network connectivity
   - Model may take time to load on first use

### Debug Steps

1. **Check Vercel Function Logs**
   - Go to Functions tab in Vercel dashboard
   - Look for error messages

2. **Check Supabase Logs**
   - Go to Logs in Supabase dashboard
   - Look for authentication or database errors

3. **Check Browser Console**
   - Open browser dev tools
   - Look for JavaScript errors
   - Check network requests

## 📊 Monitoring

### 1. Vercel Analytics

- Enable Vercel Analytics for performance monitoring
- Monitor page views and user interactions

### 2. Supabase Monitoring

- Monitor database performance
- Check storage usage
- Monitor authentication metrics

## 🔄 Updates and Maintenance

### 1. Code Updates

1. Make changes locally
2. Test thoroughly
3. Push to GitHub
4. Vercel will auto-deploy

### 2. Database Updates

1. Make changes in Supabase SQL Editor
2. Test in development first
3. Apply to production carefully

### 3. Environment Updates

1. Update variables in Vercel dashboard
2. Redeploy if necessary
3. Test functionality

## 🎉 You're Live!

Your Personal AI Wardrobe Stylist is now deployed and ready for users! 

Remember to:
- Monitor performance and errors
- Keep dependencies updated
- Backup your database regularly
- Monitor storage usage

For support, check the troubleshooting section or open an issue on GitHub.
