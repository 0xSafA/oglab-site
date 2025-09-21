-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create profiles table for user roles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'menu-user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('hybrid', 'sativa', 'indica')),
  thc DECIMAL(5,2),
  cbg DECIMAL(5,2),
  price_1pc DECIMAL(10,2),
  price_1g DECIMAL(10,2),
  price_5g DECIMAL(10,2),
  price_20g DECIMAL(10,2),
  our BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on menu_items
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Menu items policies
CREATE POLICY "Anyone can view menu items" ON menu_items
  FOR SELECT USING (true);

CREATE POLICY "Only menu-users can insert menu items" ON menu_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('menu-user', 'admin')
    )
  );

CREATE POLICY "Only menu-users can update menu items" ON menu_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('menu-user', 'admin')
    )
  );

CREATE POLICY "Only menu-users can delete menu items" ON menu_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('menu-user', 'admin')
    )
  );

-- Create menu_layout table
CREATE TABLE IF NOT EXISTS menu_layout (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  column1 TEXT[] DEFAULT '{}',
  column2 TEXT[] DEFAULT '{}',
  column3 TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on menu_layout
ALTER TABLE menu_layout ENABLE ROW LEVEL SECURITY;

-- Menu layout policies
CREATE POLICY "Anyone can view menu layout" ON menu_layout
  FOR SELECT USING (true);

CREATE POLICY "Only menu-users can modify menu layout" ON menu_layout
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('menu-user', 'admin')
    )
  );

-- Create theme table
CREATE TABLE IF NOT EXISTS theme (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  primary_color TEXT DEFAULT '#536C4A',
  secondary_color TEXT DEFAULT '#B0BF93',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on theme
ALTER TABLE theme ENABLE ROW LEVEL SECURITY;

-- Theme policies
CREATE POLICY "Anyone can view theme" ON theme
  FOR SELECT USING (true);

CREATE POLICY "Only menu-users can modify theme" ON theme
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('menu-user', 'admin')
    )
  );

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_layout_updated_at
  BEFORE UPDATE ON menu_layout
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_theme_updated_at
  BEFORE UPDATE ON theme
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default menu layout
INSERT INTO menu_layout (column1, column2, column3) VALUES (
  ARRAY['TOP SHELF', 'MID SHELF', 'PREMIUM'],
  ARRAY['SMALLS', 'CBG', 'PRE ROLLS'],
  ARRAY['FRESH FROZEN HASH', 'LIVE HASH ROSIN', 'DRY SIFT HASH', 'ICE BUBBLE HASH']
) ON CONFLICT DO NOTHING;

-- Insert default theme
INSERT INTO theme (primary_color, secondary_color) VALUES (
  '#536C4A', '#B0BF93'
) ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_type ON menu_items(type);
CREATE INDEX IF NOT EXISTS idx_menu_items_updated_at ON menu_items(updated_at);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
