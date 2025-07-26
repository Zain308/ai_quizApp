-- Create confirmed demo user script
-- Run this in your Supabase SQL Editor to create a confirmed demo user

-- First, delete any existing demo user to start fresh
DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'demo@aiquizmaster.com');
DELETE FROM public.user_profiles WHERE id IN (SELECT id FROM auth.users WHERE email = 'demo@aiquizmaster.com');
DELETE FROM public.user_stats WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'demo@aiquizmaster.com');
DELETE FROM public.quiz_sessions WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'demo@aiquizmaster.com');
DELETE FROM auth.users WHERE email = 'demo@aiquizmaster.com';

-- Create a new confirmed demo user
DO $$
DECLARE
    demo_user_id UUID := gen_random_uuid();
BEGIN
    -- Insert into auth.users with email confirmed
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        confirmation_sent_at,
        confirmation_token,
        recovery_sent_at,
        email_change_sent_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        last_sign_in_at,
        email_change_token_current,
        email_change_confirm_status
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        demo_user_id,
        'authenticated',
        'authenticated',
        'demo@aiquizmaster.com',
        crypt('demo123456', gen_salt('bf')),
        NOW(), -- This confirms the email immediately
        NOW(),
        '',
        NULL,
        NULL,
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "Demo User", "avatar_url": "/placeholder-user.jpg"}',
        FALSE,
        NOW(),
        NOW(),
        NOW(),
        '',
        0
    );
    
    -- Insert into auth.identities
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        demo_user_id,
        format('{"sub": "%s", "email": "demo@aiquizmaster.com", "email_verified": true}', demo_user_id)::jsonb,
        'email',
        NOW(),
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Demo user created successfully with ID: %', demo_user_id;
END $$;

-- Verify the demo user was created and is confirmed
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    u.created_at
FROM auth.users u
WHERE u.email = 'demo@aiquizmaster.com';
