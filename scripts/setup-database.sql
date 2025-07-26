-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert', 'master')) DEFAULT 'intermediate',
  topic TEXT,
  question_count INTEGER DEFAULT 5,
  time_limit INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of options
  correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
  explanation TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert', 'master')) DEFAULT 'intermediate',
  subject TEXT,
  topic TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_sessions table
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  time_taken INTEGER, -- in seconds
  status TEXT CHECK (status IN ('in_progress', 'completed', 'abandoned')) DEFAULT 'in_progress'
);

-- Create user_answers table
CREATE TABLE IF NOT EXISTS public.user_answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  user_answer INTEGER CHECK (user_answer >= 0 AND user_answer <= 3),
  is_correct BOOLEAN DEFAULT FALSE,
  time_taken INTEGER, -- in seconds
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  total_quizzes INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0.00,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- in seconds
  last_quiz_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subject_id)
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  condition_type TEXT NOT NULL, -- 'quiz_count', 'score', 'streak', etc.
  condition_value INTEGER NOT NULL,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Insert default subjects
INSERT INTO public.subjects (name, description, icon, color) VALUES
  ('Mathematics', 'Algebra, Geometry, Calculus, and more', '📐', '#3B82F6'),
  ('Science', 'Physics, Chemistry, Biology, and Earth Science', '🔬', '#10B981'),
  ('History', 'World History, Ancient Civilizations, Modern Events', '📚', '#F59E0B'),
  ('Literature', 'Classic and Modern Literature, Poetry, Writing', '📖', '#8B5CF6'),
  ('Geography', 'World Geography, Countries, Capitals, and Landmarks', '🌍', '#06B6D4'),
  ('Computer Science', 'Programming, Algorithms, Data Structures', '💻', '#EF4444'),
  ('Art', 'Art History, Techniques, Famous Artists and Movements', '🎨', '#EC4899'),
  ('Music', 'Music Theory, Composers, Instruments, and History', '🎵', '#F97316'),
  ('Philosophy', 'Ethics, Logic, Metaphysics, and Great Thinkers', '🤔', '#6366F1'),
  ('Psychology', 'Human Behavior, Cognitive Science, Mental Health', '🧠', '#14B8A6')
ON CONFLICT (name) DO NOTHING;

-- Insert sample achievements
INSERT INTO public.achievements (name, description, icon, condition_type, condition_value, points) VALUES
  ('First Quiz', 'Complete your first quiz', '🎯', 'quiz_count', 1, 10),
  ('Quiz Master', 'Complete 10 quizzes', '🏆', 'quiz_count', 10, 50),
  ('Perfect Score', 'Get 100% on a quiz', '⭐', 'score', 100, 25),
  ('Speed Demon', 'Complete a quiz in under 2 minutes', '⚡', 'time', 120, 30),
  ('Streak Starter', 'Get 3 questions right in a row', '🔥', 'streak', 3, 15),
  ('Knowledge Seeker', 'Complete quizzes in 5 different subjects', '📚', 'subject_count', 5, 40),
  ('Perfectionist', 'Get 100% on 5 different quizzes', '💎', 'perfect_count', 5, 75),
  ('Marathon Runner', 'Spend 1 hour total taking quizzes', '🏃', 'total_time', 3600, 35),
  ('Early Bird', 'Take a quiz before 8 AM', '🌅', 'early_quiz', 1, 20),
  ('Night Owl', 'Take a quiz after 10 PM', '🦉', 'late_quiz', 1, 20)
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users can only see and edit their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Subjects are readable by everyone, only admins can modify
CREATE POLICY "Subjects are viewable by everyone" ON public.subjects FOR SELECT USING (true);

-- Users can only see their own quizzes
CREATE POLICY "Users can view own quizzes" ON public.quizzes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own quizzes" ON public.quizzes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quizzes" ON public.quizzes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own quizzes" ON public.quizzes FOR DELETE USING (auth.uid() = user_id);

-- Users can only see questions from their own quizzes
CREATE POLICY "Users can view questions from own quizzes" ON public.questions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.quizzes WHERE quizzes.id = questions.quiz_id AND quizzes.user_id = auth.uid()));
CREATE POLICY "Users can create questions for own quizzes" ON public.questions FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.quizzes WHERE quizzes.id = questions.quiz_id AND quizzes.user_id = auth.uid()));
CREATE POLICY "Users can update questions from own quizzes" ON public.questions FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.quizzes WHERE quizzes.id = questions.quiz_id AND quizzes.user_id = auth.uid()));
CREATE POLICY "Users can delete questions from own quizzes" ON public.questions FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.quizzes WHERE quizzes.id = questions.quiz_id AND quizzes.user_id = auth.uid()));

-- Users can only see their own quiz sessions
CREATE POLICY "Users can view own quiz sessions" ON public.quiz_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own quiz sessions" ON public.quiz_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quiz sessions" ON public.quiz_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Users can only see their own answers
CREATE POLICY "Users can view own answers" ON public.user_answers FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.quiz_sessions WHERE quiz_sessions.id = user_answers.session_id AND quiz_sessions.user_id = auth.uid()));
CREATE POLICY "Users can create own answers" ON public.user_answers FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.quiz_sessions WHERE quiz_sessions.id = user_answers.session_id AND quiz_sessions.user_id = auth.uid()));

-- Users can only see their own progress
CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Achievements are viewable by everyone
CREATE POLICY "Achievements are viewable by everyone" ON public.achievements FOR SELECT USING (true);

-- Users can only see their own achievements
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can earn achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create functions and triggers

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
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
DECLARE
  quiz_user_id UUID;
  quiz_subject_id UUID;
  session_score INTEGER;
  session_total INTEGER;
  session_correct INTEGER;
BEGIN
  -- Get quiz details
  SELECT q.user_id, q.subject_id INTO quiz_user_id, quiz_subject_id
  FROM public.quizzes q
  WHERE q.id = NEW.quiz_id;

  -- Get session stats
  SELECT NEW.score, NEW.total_questions, NEW.correct_answers 
  INTO session_score, session_total, session_correct;

  -- Update or insert user progress
  INSERT INTO public.user_progress (user_id, subject_id, total_quizzes, total_questions, correct_answers, last_quiz_at)
  VALUES (quiz_user_id, quiz_subject_id, 1, session_total, session_correct, NEW.completed_at)
  ON CONFLICT (user_id, subject_id)
  DO UPDATE SET
    total_quizzes = user_progress.total_quizzes + 1,
    total_questions = user_progress.total_questions + session_total,
    correct_answers = user_progress.correct_answers + session_correct,
    average_score = ROUND((user_progress.correct_answers + session_correct)::DECIMAL / (user_progress.total_questions + session_total) * 100, 2),
    last_quiz_at = NEW.completed_at,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update progress when quiz session is completed
DROP TRIGGER IF EXISTS on_quiz_session_completed ON public.quiz_sessions;
CREATE TRIGGER on_quiz_session_completed
  AFTER UPDATE OF completed_at ON public.quiz_sessions
  FOR EACH ROW
  WHEN (OLD.completed_at IS NULL AND NEW.completed_at IS NOT NULL)
  EXECUTE FUNCTION public.update_user_progress();

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION public.check_achievements()
RETURNS TRIGGER AS $$
DECLARE
  achievement_record RECORD;
  user_quiz_count INTEGER;
  user_perfect_count INTEGER;
  user_subject_count INTEGER;
BEGIN
  -- Check quiz count achievements
  SELECT COUNT(*) INTO user_quiz_count
  FROM public.quiz_sessions
  WHERE user_id = NEW.user_id AND status = 'completed';

  -- Check perfect score achievements
  SELECT COUNT(*) INTO user_perfect_count
  FROM public.quiz_sessions
  WHERE user_id = NEW.user_id AND status = 'completed' AND score = 100;

  -- Check subject diversity achievements
  SELECT COUNT(DISTINCT q.subject_id) INTO user_subject_count
  FROM public.quiz_sessions qs
  JOIN public.quizzes q ON q.id = qs.quiz_id
  WHERE qs.user_id = NEW.user_id AND qs.status = 'completed';

  -- Award achievements based on conditions
  FOR achievement_record IN 
    SELECT * FROM public.achievements 
    WHERE (condition_type = 'quiz_count' AND condition_value <= user_quiz_count)
       OR (condition_type = 'score' AND condition_value <= NEW.score)
       OR (condition_type = 'perfect_count' AND condition_value <= user_perfect_count)
       OR (condition_type = 'subject_count' AND condition_value <= user_subject_count)
  LOOP
    INSERT INTO public.user_achievements (user_id, achievement_id)
    VALUES (NEW.user_id, achievement_record.id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to check achievements when quiz session is completed
DROP TRIGGER IF EXISTS on_check_achievements ON public.quiz_sessions;
CREATE TRIGGER on_check_achievements
  AFTER UPDATE OF completed_at ON public.quiz_sessions
  FOR EACH ROW
  WHEN (OLD.completed_at IS NULL AND NEW.completed_at IS NOT NULL)
  EXECUTE FUNCTION public.check_achievements();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON public.quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_subject_id ON public.quizzes(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON public.questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON public.quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_quiz_id ON public.quiz_sessions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_session_id ON public.user_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
