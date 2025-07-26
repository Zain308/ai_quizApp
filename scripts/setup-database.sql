-- Enable RLS
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_progress ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_sessions table
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    score INTEGER NOT NULL DEFAULT 0,
    time_taken INTEGER, -- in seconds
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.quiz_sessions(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of options
    correct_answer INTEGER NOT NULL,
    explanation TEXT,
    question_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_answers table
CREATE TABLE IF NOT EXISTS public.user_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.quiz_sessions(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE NOT NULL,
    user_answer INTEGER,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    time_taken INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    total_quizzes INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    average_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    best_score INTEGER NOT NULL DEFAULT 0,
    total_time INTEGER NOT NULL DEFAULT 0, -- in seconds
    last_quiz_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, subject, topic, difficulty)
);

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own quiz sessions" ON public.quiz_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz sessions" ON public.quiz_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz sessions" ON public.quiz_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view questions from own sessions" ON public.quiz_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.quiz_sessions 
            WHERE quiz_sessions.id = quiz_questions.session_id 
            AND quiz_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert questions for own sessions" ON public.quiz_questions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quiz_sessions 
            WHERE quiz_sessions.id = quiz_questions.session_id 
            AND quiz_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own answers" ON public.user_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.quiz_sessions 
            WHERE quiz_sessions.id = user_answers.session_id 
            AND quiz_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own answers" ON public.user_answers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quiz_sessions 
            WHERE quiz_sessions.id = user_answers.session_id 
            AND quiz_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Functions and Triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user progress
CREATE OR REPLACE FUNCTION public.update_user_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update progress when quiz is completed
    IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
        INSERT INTO public.user_progress (
            user_id, subject, topic, difficulty,
            total_quizzes, total_questions, correct_answers,
            average_score, best_score, total_time, last_quiz_at
        )
        VALUES (
            NEW.user_id, NEW.subject, NEW.topic, NEW.difficulty,
            1, NEW.total_questions, NEW.correct_answers,
            NEW.score, NEW.score, COALESCE(NEW.time_taken, 0), NEW.completed_at
        )
        ON CONFLICT (user_id, subject, topic, difficulty)
        DO UPDATE SET
            total_quizzes = user_progress.total_quizzes + 1,
            total_questions = user_progress.total_questions + NEW.total_questions,
            correct_answers = user_progress.correct_answers + NEW.correct_answers,
            average_score = ROUND(
                (user_progress.average_score * user_progress.total_quizzes + NEW.score) / 
                (user_progress.total_quizzes + 1), 2
            ),
            best_score = GREATEST(user_progress.best_score, NEW.score),
            total_time = user_progress.total_time + COALESCE(NEW.time_taken, 0),
            last_quiz_at = NEW.completed_at,
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updating user progress
DROP TRIGGER IF EXISTS on_quiz_completed ON public.quiz_sessions;
CREATE TRIGGER on_quiz_completed
    AFTER UPDATE ON public.quiz_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_user_progress();

-- Insert sample subjects and topics
INSERT INTO public.quiz_sessions (id, user_id, subject, topic, difficulty, total_questions, correct_answers, score, completed_at)
VALUES 
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Mathematics', 'Algebra', 'easy', 0, 0, 0, NULL)
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
