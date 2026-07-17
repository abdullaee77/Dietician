-- Users
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Daily logs
CREATE TABLE IF NOT EXISTS daily_logs (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id),
  date            DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Meals
  breakfast_food  TEXT,
  breakfast_time  VARCHAR(10),
  lunch_food      TEXT,
  lunch_time      VARCHAR(10),
  dinner_food     TEXT,
  dinner_time     VARCHAR(10),
  snack_food      TEXT,
  snack_time      VARCHAR(10),

  -- Water
  water_glasses   INTEGER DEFAULT 0,

  -- Movement
  steps           INTEGER,
  exercise_desc   TEXT,
  exercise_mins   INTEGER,

  -- Sleep
  sleep_time      VARCHAR(10),
  wake_time       VARCHAR(10),
  sleep_hours     NUMERIC(4,1),

  -- Wellbeing
  energy_level    VARCHAR(10),
  bloating        BOOLEAN,

  -- Flex meal
  flex_meal       TEXT,

  -- Completion flag
  completed       BOOLEAN DEFAULT FALSE,

  UNIQUE(user_id, date)
);

-- Weight logs
CREATE TABLE IF NOT EXISTS weight_logs (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg   NUMERIC(5,2) NOT NULL,
  UNIQUE(user_id, date)
);



-- Trainer plan (single row)
CREATE TABLE IF NOT EXISTS trainer_plan (
  id              SERIAL PRIMARY KEY,
  exercise_desc   TEXT,
  exercise_mins   INTEGER,
  sleep_hours     NUMERIC(4,1),
  daily_quote     TEXT,
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Skip foods
CREATE TABLE IF NOT EXISTS skip_foods (
  id      SERIAL PRIMARY KEY,
  name    VARCHAR(100) NOT NULL,
  reason  TEXT NOT NULL
);

-- Must-eat foods
CREATE TABLE IF NOT EXISTS must_eat_foods (
  id      SERIAL PRIMARY KEY,
  name    VARCHAR(100) NOT NULL,
  reason  TEXT NOT NULL
);

-- Daily food compliance tracking
CREATE TABLE IF NOT EXISTS daily_food_log (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id),
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  food_name     VARCHAR(100) NOT NULL,
  food_type     VARCHAR(10) NOT NULL,
  complied      BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(user_id, date, food_name, food_type)
);

-- Streak history
CREATE TABLE IF NOT EXISTS streak_logs (
  id        SERIAL PRIMARY KEY,
  user_id   INTEGER REFERENCES users(id),
  date      DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, date)
);

-- ===== Migrations applied after initial table creation =====

ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS extra_meals JSONB DEFAULT '[]';
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS breakfast_skipped BOOLEAN DEFAULT FALSE;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS lunch_skipped BOOLEAN DEFAULT FALSE;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS dinner_skipped BOOLEAN DEFAULT FALSE;

ALTER TABLE trainer_plan ADD COLUMN IF NOT EXISTS pin VARCHAR(20);
ALTER TABLE trainer_plan ADD COLUMN IF NOT EXISTS weight_interval_days INTEGER DEFAULT 3;
ALTER TABLE trainer_plan ADD COLUMN IF NOT EXISTS measurement_interval_days INTEGER DEFAULT 7;

ALTER TABLE users ADD COLUMN IF NOT EXISTS pin VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS initial_weight_logged BOOLEAN DEFAULT FALSE;

-- Seed default trainer plan if none exists
INSERT INTO trainer_plan (exercise_desc, exercise_mins, sleep_hours, daily_quote, weight_interval_days, measurement_interval_days)
SELECT 'Walk or light cardio', 30, 8, 'Every day is a fresh start.', 3, 7
WHERE NOT EXISTS (SELECT 1 FROM trainer_plan);



-- Add username to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- Add steps back to daily_logs (already exists but just in case)
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS steps INTEGER;

-- New table for exercise plan items
CREATE TABLE IF NOT EXISTS exercise_plan (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order  INTEGER DEFAULT 0
);

-- Track daily exercise completion
CREATE TABLE IF NOT EXISTS daily_exercise_log (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id),
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  exercise_id   INTEGER REFERENCES exercise_plan(id),
  completed     BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, date, exercise_id)
);
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  endpoint   TEXT NOT NULL,
  p256dh     TEXT NOT NULL,
  auth       TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);