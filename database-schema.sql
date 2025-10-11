-- Personal AI Wardrobe Stylist Database Schema
-- Production-ready database schema for Supabase

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ==============================================
-- PROFILES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- CLOTHES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS clothes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  category TEXT CHECK (category IN ('top', 'bottom', 'shoe', 'accessory')) NOT NULL,
  color TEXT NOT NULL,
  material TEXT NOT NULL,
  style TEXT NOT NULL,
  brand TEXT,
  size TEXT,
  season TEXT CHECK (season IN ('spring', 'summer', 'fall', 'winter', 'all-season')),
  occasion TEXT CHECK (occasion IN ('casual', 'office', 'party', 'formal', 'sport', 'beach')),
  price DECIMAL(10,2),
  purchase_date DATE,
  last_worn DATE,
  wear_count INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  embedding VECTOR(512),
  analysis_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- OUTFITS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS outfits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT,
  top_id UUID REFERENCES clothes(id) ON DELETE CASCADE,
  bottom_id UUID REFERENCES clothes(id) ON DELETE CASCADE,
  shoe_id UUID REFERENCES clothes(id) ON DELETE SET NULL,
  accessory_id UUID REFERENCES clothes(id) ON DELETE SET NULL,
  occasion TEXT CHECK (occasion IN ('casual', 'office', 'party', 'formal', 'sport', 'beach')) NOT NULL,
  season TEXT CHECK (season IN ('spring', 'summer', 'fall', 'winter', 'all-season')),
  score FLOAT DEFAULT 0,
  reasoning TEXT,
  color_scheme TEXT,
  style_notes TEXT[],
  confidence FLOAT DEFAULT 0,
  is_favorite BOOLEAN DEFAULT FALSE,
  wear_count INTEGER DEFAULT 0,
  last_worn DATE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- OUTFIT_RECOMMENDATIONS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS outfit_recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  occasion TEXT CHECK (occasion IN ('casual', 'office', 'party', 'formal', 'sport', 'beach')) NOT NULL,
  top_id UUID REFERENCES clothes(id) ON DELETE CASCADE,
  bottom_id UUID REFERENCES clothes(id) ON DELETE CASCADE,
  shoe_id UUID REFERENCES clothes(id) ON DELETE SET NULL,
  accessory_id UUID REFERENCES clothes(id) ON DELETE SET NULL,
  score FLOAT DEFAULT 0,
  reasoning TEXT,
  color_scheme TEXT,
  style_notes TEXT[],
  confidence FLOAT DEFAULT 0,
  is_generated BOOLEAN DEFAULT TRUE,
  is_saved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- USER_PREFERENCES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  color_preferences TEXT[],
  style_preferences TEXT[],
  brand_preferences TEXT[],
  size_preferences JSONB DEFAULT '{}',
  occasion_preferences JSONB DEFAULT '{}',
  budget_range JSONB DEFAULT '{}',
  seasonal_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- ROW LEVEL SECURITY
-- ==============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothes ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- RLS POLICIES
-- ==============================================

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Clothes policies
CREATE POLICY "Users can view their own clothes" ON clothes 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clothes" ON clothes 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clothes" ON clothes 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clothes" ON clothes 
FOR DELETE USING (auth.uid() = user_id);

-- Outfits policies
CREATE POLICY "Users can view their own outfits" ON outfits 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own outfits" ON outfits 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outfits" ON outfits 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outfits" ON outfits 
FOR DELETE USING (auth.uid() = user_id);

-- Outfit recommendations policies
CREATE POLICY "Users can view their own recommendations" ON outfit_recommendations 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recommendations" ON outfit_recommendations 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations" ON outfit_recommendations 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recommendations" ON outfit_recommendations 
FOR DELETE USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences" ON user_preferences 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON user_preferences 
FOR DELETE USING (auth.uid() = user_id);

-- ==============================================
-- TRIGGER FUNCTIONS
-- ==============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- TRIGGERS
-- ==============================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clothes_updated_at BEFORE UPDATE ON clothes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outfits_updated_at BEFORE UPDATE ON outfits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- INDEXES
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_clothes_user_id ON clothes(user_id);
CREATE INDEX IF NOT EXISTS idx_clothes_category ON clothes(category);
CREATE INDEX IF NOT EXISTS idx_clothes_color ON clothes(color);
CREATE INDEX IF NOT EXISTS idx_clothes_material ON clothes(material);
CREATE INDEX IF NOT EXISTS idx_clothes_style ON clothes(style);
CREATE INDEX IF NOT EXISTS idx_clothes_occasion ON clothes(occasion);
CREATE INDEX IF NOT EXISTS idx_clothes_season ON clothes(season);
CREATE INDEX IF NOT EXISTS idx_clothes_favorite ON clothes(is_favorite);
CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_outfits_occasion ON outfits(occasion);
CREATE INDEX IF NOT EXISTS idx_outfits_season ON outfits(season);
CREATE INDEX IF NOT EXISTS idx_outfits_favorite ON outfits(is_favorite);
CREATE INDEX IF NOT EXISTS idx_outfits_score ON outfits(score);
CREATE INDEX IF NOT EXISTS idx_outfit_recommendations_user_id ON outfit_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_recommendations_occasion ON outfit_recommendations(occasion);
CREATE INDEX IF NOT EXISTS idx_outfit_recommendations_score ON outfit_recommendations(score);
CREATE INDEX IF NOT EXISTS idx_outfit_recommendations_created_at ON outfit_recommendations(created_at);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- ==============================================
-- PERMISSIONS
-- ==============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;