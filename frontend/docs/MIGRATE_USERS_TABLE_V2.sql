-- Drop the old users table if it exists (WARNING: This will delete all user data!)
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with proper foreign key to auth.users
-- Using snake_case for column names (Supabase convention)
CREATE TABLE users (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE,
  display_name TEXT,
  username TEXT UNIQUE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policy so users can only read/update their own record
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create index on username for faster lookups
CREATE INDEX idx_users_username ON users(username);

-- Create index on phone for faster lookups
CREATE INDEX idx_users_phone ON users(phone);
