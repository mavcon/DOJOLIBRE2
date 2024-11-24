-- Drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Add missing columns to profiles if they don't exist
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing profiles to include email
UPDATE profiles
SET email = (
    SELECT email 
    FROM auth.users 
    WHERE users.id = profiles.id
)
WHERE email IS NULL;

-- Make email required and unique
ALTER TABLE profiles
    ALTER COLUMN email SET NOT NULL,
    ADD CONSTRAINT profiles_email_key UNIQUE (email);

-- Recreate policies with proper checks
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

-- Update handle_new_user function to include email
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO profiles (
        id,
        email,
        name,
        role,
        dob,
        is_active
    )
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        COALESCE((new.raw_user_meta_data->>'role')::text, 'MEMBER'),
        COALESCE((new.raw_user_meta_data->>'dob')::date, NOW()),
        true
    );
    RETURN new;
END;
$$;