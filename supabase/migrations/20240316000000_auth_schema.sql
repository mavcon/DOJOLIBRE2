-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('MEMBER', 'PARTNER', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE subscription_tier AS ENUM ('basic', 'pro', 'premium');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create profiles table (enhanced)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    username TEXT UNIQUE,
    role user_role NOT NULL DEFAULT 'MEMBER',
    dob DATE NOT NULL,
    subscription_tier subscription_tier,
    partner_info JSONB,
    privacy_settings JSONB DEFAULT '{"showConnections": true, "showBio": true}'::JSONB,
    interactions JSONB DEFAULT '{"following": [], "followers": [], "blocked": []}'::JSONB,
    bio TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_partner_info CHECK (
        (role = 'PARTNER' AND partner_info IS NOT NULL) OR
        (role != 'PARTNER' AND partner_info IS NULL)
    )
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create locations table (enhanced)
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
    qr_code_url TEXT,
    description TEXT,
    rules TEXT[],
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_occupancy CHECK (current_occupancy <= capacity)
);

-- Create attendance records table (enhanced)
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_out_time TIMESTAMPTZ,
    duration INTEGER, -- in minutes
    calories_burned NUMERIC(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_checkout CHECK (
        (check_out_time IS NULL) OR
        (check_out_time > check_in_time)
    )
);

-- Create messages table (enhanced)
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT different_users CHECK (sender_id != receiver_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create changelog table
CREATE TABLE IF NOT EXISTS changelog (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    changes JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelog ENABLE ROW LEVEL SECURITY;

-- Profiles policies (enhanced)
CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Only admins can delete profiles"
    ON profiles FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('ADMIN', 'SUPER_ADMIN')
        )
    );

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions"
    ON subscriptions FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Only admins can manage subscriptions"
    ON subscriptions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('ADMIN', 'SUPER_ADMIN')
        )
    );

-- Locations policies (enhanced)
CREATE POLICY "Locations are viewable by everyone"
    ON locations FOR SELECT
    USING (true);

CREATE POLICY "Partners can insert own locations"
    ON locations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'PARTNER'
        )
        AND partner_id = auth.uid()
    );

CREATE POLICY "Partners can update own locations"
    ON locations FOR UPDATE
    USING (
        partner_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'PARTNER'
        )
    );

CREATE POLICY "Partners can delete own locations"
    ON locations FOR DELETE
    USING (
        partner_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'PARTNER'
        )
    );

-- Attendance records policies (enhanced)
CREATE POLICY "Users can view own attendance"
    ON attendance_records FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Partners can view location attendance"
    ON attendance_records FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM locations
            WHERE locations.id = attendance_records.location_id
            AND locations.partner_id = auth.uid()
        )
    );

CREATE POLICY "Members can create attendance records"
    ON attendance_records FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'MEMBER'
        )
    );

CREATE POLICY "Users can update own attendance records"
    ON attendance_records FOR UPDATE
    USING (user_id = auth.uid());

-- Messages policies (enhanced)
CREATE POLICY "Users can view their conversations"
    ON messages FOR SELECT
    USING (
        auth.uid() = sender_id 
        OR auth.uid() = receiver_id
    );

CREATE POLICY "Members can send messages"
    ON messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'MEMBER'
            AND is_active = true
        )
    );

CREATE POLICY "Users can update own sent messages"
    ON messages FOR UPDATE
    USING (sender_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid());

-- Changelog policies
CREATE POLICY "Admins can view changelog"
    ON changelog FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('ADMIN', 'SUPER_ADMIN')
        )
    );

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (
        id,
        email,
        name,
        username,
        role,
        dob
    )
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'MEMBER'),
        COALESCE((new.raw_user_meta_data->>'dob')::date, NOW())
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Function to update profile timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to handle attendance check-out
CREATE OR REPLACE FUNCTION handle_attendance_checkout()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.check_out_time IS NOT NULL AND OLD.check_out_time IS NULL THEN
        NEW.duration := EXTRACT(EPOCH FROM (NEW.check_out_time - NEW.check_in_time))/60;
        
        -- Update location occupancy
        UPDATE locations
        SET current_occupancy = current_occupancy - 1
        WHERE id = NEW.location_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for attendance checkout
CREATE TRIGGER on_attendance_checkout
    BEFORE UPDATE ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION handle_attendance_checkout();

-- Function to handle attendance check-in
CREATE OR REPLACE FUNCTION handle_attendance_checkin()
RETURNS TRIGGER AS $$
BEGIN
    -- Update location occupancy
    UPDATE locations
    SET current_occupancy = current_occupancy + 1
    WHERE id = NEW.location_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for attendance checkin
CREATE TRIGGER on_attendance_checkin
    AFTER INSERT ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION handle_attendance_checkin();