# Personal AI Wardrobe Stylist

A Next.js application that uses AI to analyze your clothing items and generate personalized outfit recommendations.

## Features

- **Smart Clothing Analysis**: Upload photos of your clothes and get AI-powered analysis of color, material, and style
- **Outfit Generation**: Receive personalized outfit recommendations based on your wardrobe
- **User Authentication**: Secure signup/login with email/password or Google OAuth
- **Digital Wardrobe**: Organize and manage your clothing items digitally
- **Style Recommendations**: Get professional styling tips and color harmony suggestions

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **AI**: Google Gemini 2.5 Pro
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage

## Screenshots

<img width="1208" height="1998" alt="personal-ai-wardrobe-stylist vercel app_" src="https://github.com/user-attachments/assets/e43fdd09-577e-4ce1-9ac1-4c8d5872b691" />
\n
\n
<img width="1897" height="850" alt="image" src="https://github.com/user-attachments/assets/ab00fa8e-ae7f-481f-9bd4-f71308149601" />

\n
<img width="1895" height="854" alt="image" src="https://github.com/user-attachments/assets/38223c8c-d8dc-4cae-acf3-694da7bfaf3a" />

\n
<img width="1893" height="865" alt="image" src="https://github.com/user-attachments/assets/8c878e1a-0343-4451-9401-829c3cd96d3d" />

\n
<img width="1901" height="839" alt="image" src="https://github.com/user-attachments/assets/9fa36ec1-5247-4f3f-8c2d-0cb9d29477ce" />




## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Cloud account (for Gemini API)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd personal-ai-wardrobe-stylist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.template .env.local
   ```
   
   Fill in your environment variables:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Set up the database**
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Copy and paste the contents of `database-schema.sql`
   - Run the script to create all tables, policies, and triggers

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── analyze-clothing/  # Clothing analysis endpoint
│   │   └── generate-outfits/ # Outfit generation endpoint
│   ├── auth/              # Authentication pages
│   ├── outfits/           # Outfits page
│   ├── upload/            # Upload page
│   └── page.tsx           # Home page
├── components/            # React components
│   └── AuthForms.tsx      # Login/Signup forms
└── lib/                   # Utility libraries
    ├── gemini.ts          # Gemini AI client
    ├── geminiService.ts   # AI service functions
    └── supabaseClient.ts  # Supabase client
```

## API Endpoints

- `POST /api/analyze-clothing` - Analyze clothing items from images
- `POST /api/generate-outfits` - Generate outfit recommendations

## Database Schema

The application uses the following main tables:

- **profiles** - User profiles and preferences
- **clothes** - Clothing items with AI analysis data
- **outfits** - Saved outfit combinations
- **outfit_recommendations** - AI-generated recommendations
- **user_preferences** - User styling preferences

## Authentication

The app supports two authentication methods:

1. **Email/Password**: Traditional signup/login
2. **Google OAuth**: One-click Google authentication

## AI Features

- **Color Analysis**: Identifies dominant and secondary colors
- **Material Detection**: Recognizes fabric types and textures
- **Style Classification**: Categorizes clothing styles
- **Outfit Generation**: Creates harmonious outfit combinations
- **Style Recommendations**: Provides professional styling tips

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
