-- Personal AI Wardrobe Stylist - Database Schema
-- Run this in your Supabase SQL Editor after enabling extensions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE clothes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  category TEXT CHECK (category IN ('top', 'bottom', 'shoe', 'accessory')) NOT NULL,
  color TEXT NOT NULL,
  material TEXT,
  embedding VECTOR(512),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE outfits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  top_id UUID REFERENCES clothes(id) ON DELETE CASCADE,
  bottom_id UUID REFERENCES clothes(id) ON DELETE CASCADE,
  shoe_id UUID REFERENCES clothes(id) ON DELETE CASCADE,
  accessory_id UUID REFERENCES clothes(id) ON DELETE CASCADE,
  occasion TEXT CHECK (occasion IN ('casual', 'office', 'party', 'formal')),
  score FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothes ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own clothes" ON clothes 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clothes" ON clothes 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clothes" ON clothes 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clothes" ON clothes 
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own outfits" ON outfits 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own outfits" ON outfits 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outfits" ON outfits 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outfits" ON outfits 
FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE INDEX idx_clothes_user_id ON clothes(user_id);
CREATE INDEX idx_clothes_category ON clothes(category);
CREATE INDEX idx_outfits_user_id ON outfits(user_id);
CREATE INDEX idx_outfits_occasion ON outfits(occasion);

CREATE OR REPLACE FUNCTION find_similar_clothes(
  user_uuid UUID,
  target_embedding VECTOR(512),
  similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  image_url TEXT,
  category TEXT,
  color TEXT,
  material TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.image_url,
    c.category,
    c.color,
    c.material,
    1 - (c.embedding <=> target_embedding) AS similarity
  FROM clothes c
  WHERE c.user_id = user_uuid
    AND c.embedding IS NOT NULL
    AND 1 - (c.embedding <=> target_embedding) > similarity_threshold
  ORDER BY c.embedding <=> target_embedding
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION generate_outfit_recommendations(
  user_uuid UUID,
  occasion_type TEXT DEFAULT 'casual'
)
RETURNS TABLE (
  outfit_id UUID,
  top_id UUID,
  bottom_id UUID,
  shoe_id UUID,
  accessory_id UUID,
  score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uuid_generate_v4() as outfit_id,
    t.id as top_id,
    b.id as bottom_id,
    s.id as shoe_id,
    a.id as accessory_id,
    CASE 
      WHEN occasion_type = 'formal' THEN 
        CASE 
          WHEN t.color = b.color THEN 0.9
          WHEN t.color IN ('black', 'white', 'navy') AND b.color IN ('black', 'white', 'navy') THEN 0.8
          ELSE 0.6
        END
      WHEN occasion_type = 'casual' THEN 
        CASE 
          WHEN t.color = b.color THEN 0.7
          WHEN t.color IN ('blue', 'white', 'gray') AND b.color IN ('blue', 'white', 'gray') THEN 0.8
          ELSE 0.6
        END
      ELSE 0.5
    END as score
  FROM clothes t
  CROSS JOIN clothes b
  LEFT JOIN clothes s ON s.user_id = user_uuid AND s.category = 'shoe'
  LEFT JOIN clothes a ON a.user_id = user_uuid AND a.category = 'accessory'
  WHERE t.user_id = user_uuid 
    AND t.category = 'top'
    AND b.user_id = user_uuid 
    AND b.category = 'bottom'
  ORDER BY score DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
