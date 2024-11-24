-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies first
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
    DROP POLICY IF EXISTS "Users can insert messages" ON messages;
    DROP POLICY IF EXISTS "Users can update their own sent messages" ON messages;
    DROP POLICY IF EXISTS "Locations are viewable by everyone" ON locations;
    DROP POLICY IF EXISTS "Partners can manage their own locations" ON locations;
    DROP POLICY IF EXISTS "Users can view their own attendance" ON attendance_records;
    DROP POLICY IF EXISTS "Partners can view their location attendance" ON attendance_records;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'MEMBER',
  dob DATE NOT NULL,
  subscription_tier TEXT,
  partner_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  coordinates POINT NOT NULL,
  amenities TEXT[] NOT NULL,
  hours JSONB NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  current_occupancy INTEGER DEFAULT 0 CHECK (current_occupancy >= 0),
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_occupancy CHECK (current_occupancy <= capacity)
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out_time TIMESTAMPTZ,
  duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own sent messages"
  ON messages FOR UPDATE
  USING (auth.uid() = sender_id);

CREATE POLICY "Locations are viewable by everyone"
  ON locations FOR SELECT
  USING (true);

CREATE POLICY "Partners can manage their own locations"
  ON locations FOR ALL
  USING (partner_id = auth.uid());

CREATE POLICY "Users can view their own attendance"
  ON attendance_records FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Partners can view their location attendance"
  ON attendance_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM locations
      WHERE locations.id = attendance_records.location_id
      AND locations.partner_id = auth.uid()
    )
  );

-- Create handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, name, role, dob)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'MEMBER',
    COALESCE((new.raw_user_meta_data->>'dob')::date, NOW())
  );
  RETURN new;
END;
$$;

-- Create handle_attendance_checkout function
CREATE OR REPLACE FUNCTION handle_attendance_checkout()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.check_out_time IS NOT NULL AND OLD.check_out_time IS NULL THEN
    NEW.duration := EXTRACT(EPOCH FROM (NEW.check_out_time - NEW.check_in_time))/60;
    
    UPDATE locations
    SET current_occupancy = current_occupancy - 1
    WHERE id = NEW.location_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create handle_attendance_checkin function
CREATE OR REPLACE FUNCTION handle_attendance_checkin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE locations
  SET current_occupancy = current_occupancy + 1
  WHERE id = NEW.location_id;
  RETURN NEW;
END;
$$;

-- Drop existing triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_attendance_checkout ON attendance_records;
DROP TRIGGER IF EXISTS on_attendance_checkin ON attendance_records;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER on_attendance_checkout
  BEFORE UPDATE ON attendance_records
  FOR EACH ROW EXECUTE FUNCTION handle_attendance_checkout();

CREATE TRIGGER on_attendance_checkin
  AFTER INSERT ON attendance_records
  FOR EACH ROW EXECUTE FUNCTION handle_attendance_checkin();