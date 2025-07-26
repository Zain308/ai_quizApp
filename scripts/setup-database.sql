-- Enable RLS
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create tables
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    score INTEGER NOT NULL DEFAULT 0,
    time_taken INTEGER, -- in seconds
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of options
    correct_answer INTEGER NOT NULL, -- Index of correct option
    explanation TEXT,
    question_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    selected_answer INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_taken INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    total_quizzes INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    average_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    best_score INTEGER NOT NULL DEFAULT 0,
    total_time INTEGER NOT NULL DEFAULT 0, -- in seconds
    streak INTEGER NOT NULL DEFAULT 0,
    last_quiz_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, subject, difficulty)
);

CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    condition_type TEXT NOT NULL, -- 'score', 'streak', 'total_quizzes', etc.
    condition_value INTEGER NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, condition_type, condition_value, points) VALUES
('First Quiz', 'Complete your first quiz', '🎯', 'total_quizzes', 1, 10),
('Perfect Score', 'Get 100% on a quiz', '💯', 'score', 100, 25),
('Quiz Master', 'Complete 10 quizzes', '🏆', 'total_quizzes', 10, 50),
('Streak Starter', 'Get a 3-quiz streak', '🔥', 'streak', 3, 20),
('Knowledge Seeker', 'Complete 50 quizzes', '📚', 'total_quizzes', 50, 100),
('Speed Demon', 'Complete a quiz in under 2 minutes', '⚡', 'time', 120, 30),
('Perfectionist', 'Get 5 perfect scores', '⭐', 'perfect_scores', 5, 75)
ON CONFLICT (name) DO NOTHING;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own quiz sessions" ON public.quiz_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own quiz sessions" ON public.quiz_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quiz sessions" ON public.quiz_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view questions from own sessions" ON public.quiz_questions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.quiz_sessions WHERE id = session_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create questions for own sessions" ON public.quiz_questions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.quiz_sessions WHERE id = session_id AND user_id = auth.uid())
);

CREATE POLICY "Users can view own answers" ON public.user_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own answers" ON public.user_answers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can view achievements" ON public.achievements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can earn achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for updating progress
CREATE OR REPLACE FUNCTION update_user_progress()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_progress (
        user_id, subject, difficulty, total_quizzes, total_questions, 
        correct_answers, average_score, best_score, total_time, last_quiz_date
    )
    VALUES (
        NEW.user_id, NEW.subject, NEW.difficulty, 1, NEW.total_questions,
        NEW.correct_answers, NEW.score, NEW.score, COALESCE(NEW.time_taken, 0), NEW.completed_at
    )
    ON CONFLICT (user_id, subject, difficulty) 
    DO UPDATE SET
        total_quizzes = user_progress.total_quizzes + 1,
        total_questions = user_progress.total_questions + NEW.total_questions,
        correct_answers = user_progress.correct_answers + NEW.correct_answers,
        average_score = ROUND((user_progress.average_score * user_progress.total_quizzes + NEW.score) / (user_progress.total_quizzes + 1), 2),
        best_score = GREATEST(user_progress.best_score, NEW.score),
        total_time = user_progress.total_time + COALESCE(NEW.time_taken, 0),
        last_quiz_date = NEW.completed_at,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating progress
DROP TRIGGER IF EXISTS trigger_update_user_progress ON public.quiz_sessions;
CREATE TRIGGER trigger_update_user_progress
    AFTER UPDATE OF completed_at ON public.quiz_sessions
    FOR EACH ROW
    WHEN (NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL)
    EXECUTE FUNCTION update_user_progress();
