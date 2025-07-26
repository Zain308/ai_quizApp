-- First, delete any existing demo user to avoid conflicts
DELETE FROM auth.users WHERE email = 'demo@aiquizmaster.com';

-- Create the demo user with confirmed email
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'demo@aiquizmaster.com',
  crypt('demo123456', gen_salt('bf')),
  NOW(),
  NOW(),
  '',
  NOW(),
  '',
  NULL,
  '',
  '',
  NULL,
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Demo User","avatar_url":""}',
  FALSE,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL
);

-- Get the demo user ID
DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@aiquizmaster.com';
    
    -- Create identity for the demo user
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
        format('{"sub":"%s","email":"demo@aiquizmaster.com","email_verified":true,"phone_verified":false}', demo_user_id)::jsonb,
        'email',
        NOW(),
        NOW(),
        NOW()
    );

    -- Create user profile
    INSERT INTO public.user_profiles (
        id,
        email,
        full_name,
        avatar_url,
        created_at,
        updated_at
    ) VALUES (
        demo_user_id,
        'demo@aiquizmaster.com',
        'Demo User',
        '',
        NOW(),
        NOW()
    );

    -- Create some sample quiz sessions
    INSERT INTO public.quiz_sessions (
        id,
        user_id,
        subject,
        difficulty,
        total_questions,
        correct_answers,
        score,
        time_taken,
        completed_at,
        created_at
    ) VALUES 
    (
        gen_random_uuid(),
        demo_user_id,
        'Mathematics',
        'intermediate',
        10,
        8,
        80,
        300,
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    ),
    (
        gen_random_uuid(),
        demo_user_id,
        'Science',
        'beginner',
        10,
        7,
        70,
        250,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    );

    -- Create user stats
    INSERT INTO public.user_stats (
        user_id,
        total_quizzes,
        total_questions,
        correct_answers,
        average_score,
        best_score,
        total_time,
        favorite_subject,
        current_streak,
        best_streak,
        created_at,
        updated_at
    ) VALUES (
        demo_user_id,
        2,
        20,
        15,
        75.0,
        80.0,
        550,
        'Mathematics',
        2,
        2,
        NOW(),
        NOW()
    );
END $$;

-- Verify the demo user was created successfully
SELECT 
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    up.full_name,
    us.total_quizzes
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
LEFT JOIN public.user_stats us ON u.id = us.user_id
WHERE u.email = 'demo@aiquizmaster.com';
