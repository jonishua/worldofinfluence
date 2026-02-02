-- WORLD OF INFLUENCE: Supabase Schema Migration

-- 1. Create Profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  title TEXT DEFAULT 'Player',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Balances table
CREATE TABLE public.balances (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  rent_balance NUMERIC DEFAULT 0 NOT NULL,
  wallet_balance NUMERIC DEFAULT 0 NOT NULL,
  credits NUMERIC DEFAULT 500 NOT NULL,
  influence_bucks NUMERIC DEFAULT 0 NOT NULL,
  zoning_permits NUMERIC DEFAULT 5 NOT NULL,
  last_settled_time BIGINT DEFAULT (extract(epoch from now()) * 1000)::bigint NOT NULL,
  boost_end_time BIGINT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Parcels table
CREATE TABLE public.parcels (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  corners JSONB NOT NULL,
  center JSONB NOT NULL,
  rarity TEXT DEFAULT 'common' NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  purchase_time BIGINT NOT NULL,
  rent_rate NUMERIC NOT NULL,
  visual_feature TEXT,
  last_upgraded_at BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create City Keys table
CREATE TABLE public.city_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  region_id TEXT NOT NULL,
  count INTEGER DEFAULT 1 NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, region_id)
);

-- 5. Create Global Drops table
CREATE TABLE public.global_drops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location JSONB NOT NULL,
  rarity TEXT DEFAULT 'Common' NOT NULL,
  collected_by UUID REFERENCES auth.users ON DELETE SET NULL,
  collected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Realtime for global_drops
ALTER publication supabase_realtime ADD TABLE global_drops;

-- RPC: Collect Global Drop (Atomic)
CREATE OR REPLACE FUNCTION public.collect_global_drop(drop_id UUID)
RETURNS JSONB AS $$
DECLARE
  drop_record RECORD;
  reward_record RECORD;
BEGIN
  -- 1. Try to claim the drop
  UPDATE public.global_drops
  SET collected_by = auth.uid(),
      collected_at = timezone('utc'::text, now())
  WHERE id = drop_id AND collected_by IS NULL
  RETURNING * INTO drop_record;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Drop already collected or not found');
  END IF;

  -- 2. Logic for rewards would usually happen here or be triggered
  -- For now, we return success and the drop info
  RETURN jsonb_build_object(
    'success', true, 
    'rarity', drop_record.rarity,
    'location', drop_record.location
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS for Global Drops
ALTER TABLE public.global_drops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view uncollected global drops" ON public.global_drops FOR SELECT USING (collected_by IS NULL);
CREATE POLICY "Authenticated users can trigger collection" ON public.global_drops FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS POLICIES (Row Level Security)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own balances" ON public.balances FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own balances" ON public.balances FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view all parcels" ON public.parcels FOR SELECT USING (true);
CREATE POLICY "Users can insert their own parcels" ON public.parcels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own parcels" ON public.parcels FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE public.city_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own city keys" ON public.city_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own city keys" ON public.city_keys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own city keys" ON public.city_keys FOR INSERT WITH CHECK (auth.uid() = user_id);

-- TRIGGER: Create Profile and Balance on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');

  INSERT INTO public.balances (id)
  VALUES (new.id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
