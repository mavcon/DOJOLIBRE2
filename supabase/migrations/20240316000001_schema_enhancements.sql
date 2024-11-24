-- Add new enum types if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('MEMBER', 'PARTNER', 'ADMIN', 'SUPER_ADMIN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
        CREATE TYPE subscription_tier AS ENUM ('basic', 'pro', 'premium');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
    END IF;
END $$;

-- Add new columns to existing profiles table
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"showConnections": true, "showBio": true}'::JSONB,
    ADD COLUMN IF NOT EXISTS interactions JSONB DEFAULT '{"following": [], "followers": [], "blocked": []}'::JSONB,
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS avatar_url TEXT,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create new tables
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

-- Enhance locations table
ALTER TABLE locations
    ADD COLUMN IF NOT EXISTS qr_code_url TEXT,
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS rules TEXT[];

-- Enhance attendance_records table
ALTER TABLE attendance_records
    ADD COLUMN IF NOT EXISTS calories_burned NUMERIC(10,2),
    ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add read_at to messages table
ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Create notifications table if it doesn't exist
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

-- Create changelog table if it doesn't exist
CREATE TABLE IF NOT EXISTS changelog (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    changes JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelog ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
    DROP POLICY IF EXISTS "Only admins can manage subscriptions" ON subscriptions;
    DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
    DROP POLICY IF EXISTS "System can create notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
    DROP POLICY IF EXISTS "Admins can view changelog" ON changelog;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Add policies
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

CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view changelog"
    ON changelog FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('ADMIN', 'SUPER_ADMIN')
        )
    );

-- Add new triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add attendance triggers if they don't exist
DO $$ BEGIN
    CREATE OR REPLACE FUNCTION handle_attendance_checkout()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.check_out_time IS NOT NULL AND OLD.check_out_time IS NULL THEN
            NEW.duration := EXTRACT(EPOCH FROM (NEW.check_out_time - NEW.check_in_time))/60;
            
            UPDATE locations
            SET current_occupancy = current_occupancy - 1
            WHERE id = NEW.location_id;
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION handle_attendance_checkin()
    RETURNS TRIGGER AS $$
    BEGIN
        UPDATE locations
        SET current_occupancy = current_occupancy + 1
        WHERE id = NEW.location_id;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
EXCEPTION
    WHEN duplicate_function THEN NULL;
END $$;

DROP TRIGGER IF EXISTS on_attendance_checkout ON attendance_records;
CREATE TRIGGER on_attendance_checkout
    BEFORE UPDATE ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION handle_attendance_checkout();

DROP TRIGGER IF EXISTS on_attendance_checkin ON attendance_records;
CREATE TRIGGER on_attendance_checkin
    AFTER INSERT ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION handle_attendance_checkin();