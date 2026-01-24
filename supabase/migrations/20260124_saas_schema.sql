-- Create custom types for Subscriptions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pricing_type') THEN
        CREATE TYPE pricing_type AS ENUM ('one_time', 'recurring');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pricing_plan_interval') THEN
        CREATE TYPE pricing_plan_interval AS ENUM ('day', 'week', 'month', 'year');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused');
    END IF;
END $$;

-- 1. Profiles (Extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name text,
  email text,
  avatar_url text,
  billing_address jsonb,
  payment_method jsonb,
  updated_at timestamptz DEFAULT now()
);

-- 2. Products
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  active boolean,
  name text,
  description text,
  image text,
  metadata jsonb
);

-- 3. Prices
CREATE TABLE IF NOT EXISTS prices (
  id text PRIMARY KEY,
  product_id text REFERENCES products,
  active boolean,
  description text,
  unit_amount int8,
  currency text,
  type pricing_type,
  interval pricing_plan_interval,
  interval_count int,
  trial_period_days int,
  metadata jsonb
);

-- 4. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  status subscription_status,
  metadata jsonb,
  price_id text REFERENCES prices,
  quantity int,
  cancel_at_period_end boolean,
  created timestamptz DEFAULT now(),
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz DEFAULT now(),
  ended_at timestamptz,
  cancel_at timestamptz,
  canceled_at timestamptz,
  trial_start timestamptz,
  trial_end timestamptz
);

-- 5. Customers (Stripe Mapping)
CREATE TABLE IF NOT EXISTS customers (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  stripe_customer_id text
);

-- Note: RLS disabled as per project guidelines for simplicity during initial setup.
-- If needed, can be enabled later with: ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
