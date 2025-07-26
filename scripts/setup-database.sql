-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT '#3B82F6',
  icon VARCHAR(50) DEFAULT 'BookOpen',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert', 'master')),
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  quiz_count INTEGER DEFAULT 0,
  last_quiz_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subject_id, difficulty)
);

-- Create quiz_sessions table
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert', 'master')),
  questions JSONB,
  answers INTEGER[],
  score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 10,
  completed_at TIMESTAMP WITH TIME ZONE,
  xp_earned INTEGER DEFAULT 0,
  time_taken INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type VARCHAR(50) NOT NULL,
  achievement_data JSONB,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  quiz_streak INTEGER DEFAULT 0,
  total_quizzes INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  total_questions_answered INTEGER DEFAULT 0,
  favorite_subject_id UUID REFERENCES subjects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subjects
INSERT INTO subjects (name, category, description, color, icon) VALUES
('Computer Science', 'Technology', 'Programming, algorithms, data structures, and software engineering', '#3B82F6', 'Code'),
('Mathematics', 'STEM', 'Algebra, calculus, geometry, statistics, and mathematical reasoning', '#10B981', 'Calculator'),
('Physics', 'Science', 'Mechanics, thermodynamics, electromagnetism, and quantum physics', '#F59E0B', 'Zap'),
('Chemistry', 'Science', 'Organic, inorganic, physical chemistry, and chemical reactions', '#EF4444', 'Flask'),
('Biology', 'Science', 'Cell biology, genetics, ecology, evolution, and human anatomy', '#22C55E', 'Leaf'),
('History', 'Humanities', 'World history, ancient civilizations, wars, and historical events', '#8B5CF6', 'Clock'),
('Geography', 'Social Studies', 'World geography, countries, capitals, and physical features', '#06B6D4', 'MapPin'),
('English Literature', 'Language Arts', 'Classic literature, poetry, grammar, and writing skills', '#EC4899', 'BookOpen'),
('Psychology', 'Social Science', 'Human behavior, cognitive psychology, and mental processes', '#F97316', 'Brain'),
('Economics', 'Social Science', 'Microeconomics, macroeconomics, and economic principles', '#84CC16', 'TrendingUp'),
('Philosophy', 'Humanities', 'Ethics, logic, metaphysics, and philosophical thinking', '#6366F1', 'Lightbulb'),
('Art History', 'Arts', 'Famous artists, art movements, and artistic techniques', '#D946EF', 'Palette'),
('Music Theory', 'Arts', 'Musical notation, harmony, rhythm, and composition', '#14B8A6', 'Music'),
('Astronomy', 'Science', 'Solar system, stars, galaxies, and space exploration', '#7C3AED', 'Star'),
('Environmental Science', 'Science', 'Ecology, climate change, and environmental conservation', '#059669', 'Globe')
ON CONFLICT (name) DO NOTHING;

-- Create function to update user progress
CREATE OR REPLACE FUNCTION update_user_progress(
  p_user_id UUID,
  p_subject_id UUID,
  p_difficulty VARCHAR,
  p_score INTEGER,
  p_total_questions INTEGER,
  p_xp_earned INTEGER
) RETURNS VOID AS $$
BEGIN
  -- Insert or update user_progress
  INSERT INTO user_progress (
    user_id, subject_id, difficulty, total_questions, correct_answers, total_xp, best_score, quiz_count, last_quiz_at, updated_at
  ) VALUES (
    p_user_id, p_subject_id, p_difficulty, p_total_questions, p_score, p_xp_earned, p_score, 1, NOW(), NOW()
  )
  ON CONFLICT (user_id, subject_id, difficulty) DO UPDATE SET
    total_questions = user_progress.total_questions + p_total_questions,
    correct_answers = user_progress.correct_answers + p_score,
    total_xp = user_progress.total_xp + p_xp_earned,
    best_score = GREATEST(user_progress.best_score, p_score),
    quiz_count = user_progress.quiz_count + 1,
    last_quiz_at = NOW(),
    updated_at = NOW();

  -- Insert or update user_stats
  INSERT INTO user_stats (
    user_id, total_xp, total_quizzes, total_correct_answers, total_questions_answered, updated_at
  ) VALUES (
    p_user_id, p_xp_earned, 1, p_score, p_total_questions, NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = user_stats.total_xp + p_xp_earned,
    level = GREATEST(1, (user_stats.total_xp + p_xp_earned) / 100 + 1),
    total_quizzes = user_stats.total_quizzes + 1,
    total_correct_answers = user_stats.total_correct_answers + p_score,
    total_questions_answered = user_stats.total_questions_answered + p_total_questions,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_subject_id ON user_progress(subject_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_subject_id ON quiz_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- Enable Row Level Security
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Subjects are viewable by everyone" ON subjects FOR SELECT USING (true);

CREATE POLICY "Users can view their own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own quiz sessions" ON quiz_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quiz sessions" ON quiz_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quiz sessions" ON quiz_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);
