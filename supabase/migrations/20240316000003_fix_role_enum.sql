-- Drop and recreate user_role enum if it exists
DO $$ 
BEGIN
    DROP TYPE IF EXISTS user_role CASCADE;
    CREATE TYPE user_role AS ENUM ('MEMBER', 'PARTNER', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Alter profiles table to use enum
ALTER TABLE profiles 
    ALTER COLUMN role TYPE user_role USING role::user_role;

-- Add constraint for partner_info
ALTER TABLE profiles
    DROP CONSTRAINT IF EXISTS valid_partner_info,
    ADD CONSTRAINT valid_partner_info CHECK (
        (role = 'PARTNER' AND partner_info IS NOT NULL) OR
        (role != 'PARTNER' AND partner_info IS NULL)
    );

-- Update handle_new_user function to use enum
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
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'MEMBER'::user_role),
        COALESCE((new.raw_user_meta_data->>'dob')::date, NOW()),
        true
    );
    RETURN new;
END;
$$;