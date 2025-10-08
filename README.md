# Personal AI Wardrobe Stylist

A sophisticated web application that uses AI to analyze your wardrobe and suggest perfect outfit combinations. Upload photos of your clothes and let artificial intelligence create stylish outfits tailored to your existing wardrobe.

## ✨ Features

- **AI-Powered Analysis**: Automatically categorizes clothes by type, color, and material
- **Smart Outfit Generation**: Creates perfect combinations based on color harmony and style compatibility
- **Google Authentication**: Secure sign-in with Google OAuth
- **Cloud Storage**: Secure image storage with Supabase
- **Responsive Design**: Beautiful UI that works on all devices
- **Real-time Processing**: Instant AI analysis of uploaded clothing items

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Storage, Auth)
- **AI/ML**: Hugging Face Transformers, Microsoft ResNet-50
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Cloud Console account (for OAuth)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd personal-ai-wardrobe-stylist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.template .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema from `supabase-schema-no-storage.sql`
   - Create a `clothes` storage bucket
   - Set up Row Level Security policies

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings → API
3. Update `.env.local` with your credentials
4. Run the database schema (see `supabase-schema-no-storage.sql`)
5. Create storage bucket named `clothes`
6. Set up RLS policies for security

### Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs
6. Update Supabase Auth settings

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── upload/            # Upload page
│   ├── outfits/           # Outfits page
│   └── page.tsx           # Home page
├── lib/                   # Utilities
│   ├── supabaseClient.ts  # Supabase configuration
│   └── embeddings.ts      # AI processing
└── components/            # Reusable components
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the project: `npm run build`
2. Start production server: `npm start`
3. Configure your hosting provider

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- User data isolation
- Secure file uploads
- OAuth authentication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ using Next.js, Supabase, and AI**