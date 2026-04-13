
CREATE TABLE planner_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE planner_sessions (
  id VARCHAR(64) PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES planner_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE seating_plans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES planner_users(id),
  title VARCHAR(255) NOT NULL DEFAULT 'Мой план рассадки',
  event_date DATE,
  hall_width INTEGER DEFAULT 1200,
  hall_height INTEGER DEFAULT 800,
  guest_token VARCHAR(64) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE seating_tables (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES seating_plans(id),
  label VARCHAR(100) DEFAULT '',
  shape VARCHAR(20) NOT NULL DEFAULT 'round',
  x INTEGER NOT NULL DEFAULT 100,
  y INTEGER NOT NULL DEFAULT 100,
  width INTEGER NOT NULL DEFAULT 120,
  height INTEGER NOT NULL DEFAULT 120,
  seats INTEGER NOT NULL DEFAULT 8,
  color VARCHAR(20) DEFAULT '#c9a96e',
  rotation INTEGER DEFAULT 0
);

CREATE TABLE seating_guests (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES seating_plans(id),
  name VARCHAR(255) NOT NULL,
  table_id INTEGER REFERENCES seating_tables(id),
  seat_number INTEGER,
  phone VARCHAR(50),
  note VARCHAR(500),
  rsvp_status VARCHAR(20) DEFAULT 'pending'
);
