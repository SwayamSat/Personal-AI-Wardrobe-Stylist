# 🔐 Google OAuth Authentication Setup Guide

This guide will help you set up Google OAuth authentication for your Personal AI Wardrobe Stylist application.

## 🚀 **Step 1: Google Cloud Console Setup**

### **1.1 Create a Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. **Project name**: `Personal AI Wardrobe Stylist`
4. Click **"Create"**

### **1.2 Enable Google+ API**
1. Go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click on it and click **"Enable"**

### **1.3 Create OAuth Consent Screen**
1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. **User Type**: Select **"External"**
3. Click **"Create"**
4. Fill in the required fields:
   - **App name**: `Personal AI Wardrobe Stylist`
   - **User support email**: Your email
   - **Developer contact**: Your email
5. Click **"Save and Continue"**

### **1.4 Add Scopes**
1. Click **"Add or Remove Scopes"**
2. Add these scopes:
   - `email`
   - `profile`
   - `openid`
3. Click **"Update"** → **"Save and Continue"**

### **1.5 Add Test Users**
1. Click **"Add Users"**
2. Add your email address
3. Click **"Save and Continue"**

### **1.6 Create OAuth Credentials**
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. **Application type**: `Web application`
4. **Name**: `Personal AI Wardrobe Stylist`
5. **Authorized redirect URIs**:
   ```
   http://localhost:3000/auth/callback
   https://your-domain.vercel.app/auth/callback
   ```
6. Click **"Create"**
7. Copy your **Client ID** and **Client Secret**

## 🔧 **Step 2: Supabase Authentication Setup**

### **2.1 Enable Google Provider**
1. Go to your [Supabase Dashboard](https://supabase.com)
2. Select your project
3. Go to **"Authentication"** → **"Providers"**
4. Find **"Google"** and click **"Enable"**

### **2.2 Configure Google Provider**
1. **Client ID**: Paste your Google Client ID
2. **Client Secret**: Paste your Google Client Secret
3. **Redirect URL**: Copy the URL shown (it should be like `https://your-project.supabase.co/auth/v1/callback`)
4. Click **"Save"**

### **2.3 Update Google Console Redirect URI**
1. Go back to Google Cloud Console
2. Go to **"Credentials"** → Your OAuth 2.0 Client ID
3. **Authorized redirect URIs**: Add the Supabase redirect URL
4. Click **"Save"**

## 🔧 **Step 3: Environment Variables**

### **3.1 Create .env.local File**
Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **3.2 Get Supabase Credentials**
1. Go to your Supabase project dashboard
2. Go to **"Settings"** → **"API"**
3. Copy the **Project URL** and **anon public** key
4. Paste them in your `.env.local` file

## 🧪 **Step 4: Test Authentication**

### **4.1 Start Your Application**
```bash
npm run dev
```

### **4.2 Test Google Sign In**
1. Go to `http://localhost:3000`
2. Click **"Sign In with Google"**
3. Complete the OAuth flow
4. You should be redirected to the upload page

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **"This app isn't verified"**
   - This is normal for testing
   - Click **"Advanced"** → **"Go to Personal AI Wardrobe Stylist (unsafe)"**

2. **"redirect_uri_mismatch"**
   - Check that redirect URIs match exactly in both Google Console and Supabase

3. **"access_denied"**
   - Make sure your email is added as a test user in Google Console

4. **"server_error"**
   - Ensure your OAuth consent screen is in "Testing" mode
   - Check that all required fields are filled

## 🔒 **Security Best Practices**

1. **Never commit sensitive credentials** to version control
2. **Use environment variables** for all secrets
3. **Keep your Client Secret secure**
4. **Regularly rotate your credentials**
5. **Monitor your OAuth usage** in Google Console

## 📚 **Additional Resources**

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Authentication Guide](https://nextjs.org/docs/authentication)

---

**Need help?** Check the troubleshooting section above or refer to the official documentation.
