-- Create custom types for Subscriptions
CREATE TYPE pricing_type AS ENUM ('one_time', 'recurring');
CREATE TYPE pricing_plan_interval AS ENUM ('day', 'week', 'month', 'year');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused');

-- 1. Profiles (Extends auth.users)
-- This table stores user data that is accessible from the frontend
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name text,
  avatar_url text,
  billing_address jsonb,
  payment_method jsonb,
  updated_at timestamptz DEFAULT now()
);

-- 2. Products
-- Stores Stripe products synced to Supabase
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  active boolean,
  name text,
  description text,
  image text,
  metadata jsonb
);

-- 3. Prices
-- Stores Stripe prices synced to Supabase
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
-- Stores user subscription status and details
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
-- Maps Supabase users to Stripe customers
CREATE TABLE IF NOT EXISTS customers (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  stripe_customer_id text
);

-- --- AUTOMATIC PROFILE CREATION ---
-- This function and trigger ensure that every time a user signs up via Auth,
-- a corresponding entry is created in the public.profiles table.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function on every user creation in auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Realtime for subscriptions to show instant updates in the UI
ALTER PUBLICATION supabase_realtime ADD TABLE subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
