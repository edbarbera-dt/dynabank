-- ============================================================================
-- DynaBank - Initial Schema Migration
-- ============================================================================
-- Run this in your Supabase SQL Editor or via `supabase db push`
-- ============================================================================

-- ─── Profiles ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  pin_hash TEXT,
  account_type TEXT CHECK (account_type IN ('personal', 'business')),
  country TEXT,
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ─── Accounts ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Current Account',
  currency TEXT NOT NULL DEFAULT 'GBP',
  balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  account_number TEXT NOT NULL DEFAULT '',
  sort_code TEXT NOT NULL DEFAULT '',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts"
  ON public.accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON public.accounts FOR UPDATE
  USING (auth.uid() = user_id);

-- ─── Transactions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT NOT NULL DEFAULT '',
  amount NUMERIC(12, 2) NOT NULL,
  balance_after NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  counterparty_name TEXT,
  reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts
      WHERE accounts.id = transactions.account_id
      AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.accounts
      WHERE accounts.id = transactions.account_id
      AND accounts.user_id = auth.uid()
    )
  );

-- ─── Cards ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  card_number TEXT NOT NULL,
  card_holder_name TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  card_type TEXT NOT NULL CHECK (card_type IN ('visa', 'mastercard')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'cancelled')),
  daily_limit NUMERIC(12, 2) NOT NULL DEFAULT 1000.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cards"
  ON public.cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts
      WHERE accounts.id = cards.account_id
      AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own cards"
  ON public.cards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts
      WHERE accounts.id = cards.account_id
      AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own cards"
  ON public.cards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.accounts
      WHERE accounts.id = cards.account_id
      AND accounts.user_id = auth.uid()
    )
  );

-- ─── Beneficiaries ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  sort_code TEXT NOT NULL,
  bank_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own beneficiaries"
  ON public.beneficiaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own beneficiaries"
  ON public.beneficiaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own beneficiaries"
  ON public.beneficiaries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own beneficiaries"
  ON public.beneficiaries FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Exchange Rates ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate NUMERIC(10, 6) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_currency, to_currency)
);

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exchange rates"
  ON public.exchange_rates FOR SELECT
  USING (true);

-- ─── Service Role Permissions ─────────────────────────────────────────────────
-- Required so the auth trigger (handle_new_user) can insert into public tables

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT INSERT ON public.profiles TO supabase_auth_admin;
GRANT INSERT ON public.accounts TO supabase_auth_admin;

-- ─── Functions ────────────────────────────────────────────────────────────────

-- Generate a random 8-digit account number
CREATE OR REPLACE FUNCTION generate_account_number()
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION generate_account_number() TO supabase_auth_admin;

-- Generate a random sort code (XX-XX-XX format)
CREATE OR REPLACE FUNCTION generate_sort_code()
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 100)::TEXT, 2, '0') || '-' ||
         LPAD(FLOOR(RANDOM() * 100)::TEXT, 2, '0') || '-' ||
         LPAD(FLOOR(RANDOM() * 100)::TEXT, 2, '0');
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION generate_sort_code() TO supabase_auth_admin;

-- ─── Auto-create profile & accounts on signup ─────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );

  -- Create Current Account
  INSERT INTO public.accounts (user_id, name, currency, balance, account_number, sort_code, is_primary)
  VALUES (
    NEW.id,
    'Current Account',
    'GBP',
    0.00,
    generate_account_number(),
    generate_sort_code(),
    TRUE
  );

  -- Create Savings Account
  INSERT INTO public.accounts (user_id, name, currency, balance, account_number, sort_code, is_primary)
  VALUES (
    NEW.id,
    'Savings Account',
    'GBP',
    0.00,
    generate_account_number(),
    generate_sort_code(),
    FALSE
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Transfer Money (atomic) ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.transfer_money(
  p_from_account_id UUID,
  p_to_account_id UUID,
  p_amount NUMERIC,
  p_description TEXT DEFAULT 'Transfer'
)
RETURNS JSONB AS $$
DECLARE
  v_from_balance NUMERIC;
  v_to_balance NUMERIC;
  v_from_new_balance NUMERIC;
  v_to_new_balance NUMERIC;
  v_from_name TEXT;
  v_to_name TEXT;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Lock and fetch from account
  SELECT balance, name INTO v_from_balance, v_from_name
  FROM public.accounts WHERE id = p_from_account_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Source account not found';
  END IF;

  -- Check sufficient balance
  IF v_from_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Lock and fetch to account
  SELECT balance, name INTO v_to_balance, v_to_name
  FROM public.accounts WHERE id = p_to_account_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Destination account not found';
  END IF;

  -- Calculate new balances
  v_from_new_balance := v_from_balance - p_amount;
  v_to_new_balance := v_to_balance + p_amount;

  -- Update balances
  UPDATE public.accounts SET balance = v_from_new_balance WHERE id = p_from_account_id;
  UPDATE public.accounts SET balance = v_to_new_balance WHERE id = p_to_account_id;

  -- Create debit transaction
  INSERT INTO public.transactions (account_id, type, category, description, amount, balance_after, counterparty_name, reference)
  VALUES (p_from_account_id, 'debit', 'transfer', p_description, p_amount, v_from_new_balance, v_to_name, 'TRF-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8));

  -- Create credit transaction
  INSERT INTO public.transactions (account_id, type, category, description, amount, balance_after, counterparty_name, reference)
  VALUES (p_to_account_id, 'credit', 'transfer', p_description, p_amount, v_to_new_balance, v_from_name, 'TRF-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8));

  RETURN jsonb_build_object(
    'success', TRUE,
    'from_balance', v_from_new_balance,
    'to_balance', v_to_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Transfer to External (beneficiary) ──────────────────────────────────────

CREATE OR REPLACE FUNCTION public.transfer_external(
  p_from_account_id UUID,
  p_amount NUMERIC,
  p_beneficiary_name TEXT,
  p_reference TEXT DEFAULT ''
)
RETURNS JSONB AS $$
DECLARE
  v_from_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  SELECT balance INTO v_from_balance
  FROM public.accounts WHERE id = p_from_account_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found';
  END IF;

  IF v_from_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  v_new_balance := v_from_balance - p_amount;

  UPDATE public.accounts SET balance = v_new_balance WHERE id = p_from_account_id;

  INSERT INTO public.transactions (account_id, type, category, description, amount, balance_after, counterparty_name, reference)
  VALUES (p_from_account_id, 'debit', 'transfer', 'Transfer to ' || p_beneficiary_name, p_amount, v_new_balance, p_beneficiary_name, COALESCE(NULLIF(p_reference, ''), 'TRF-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8)));

  RETURN jsonb_build_object('success', TRUE, 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Top Up Account ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.top_up_account(
  p_account_id UUID,
  p_amount NUMERIC
)
RETURNS JSONB AS $$
DECLARE
  v_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  SELECT balance INTO v_balance
  FROM public.accounts WHERE id = p_account_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found';
  END IF;

  v_new_balance := v_balance + p_amount;

  UPDATE public.accounts SET balance = v_new_balance WHERE id = p_account_id;

  INSERT INTO public.transactions (account_id, type, category, description, amount, balance_after, counterparty_name, reference)
  VALUES (p_account_id, 'credit', 'top_up', 'Account top-up', p_amount, v_new_balance, 'Top Up', 'TOP-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8));

  RETURN jsonb_build_object('success', TRUE, 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Exchange Money ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.exchange_money(
  p_from_account_id UUID,
  p_to_account_id UUID,
  p_amount NUMERIC,
  p_from_currency TEXT,
  p_to_currency TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_rate NUMERIC;
  v_converted_amount NUMERIC;
  v_from_balance NUMERIC;
  v_to_balance NUMERIC;
  v_from_new_balance NUMERIC;
  v_to_new_balance NUMERIC;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Get exchange rate
  SELECT rate INTO v_rate
  FROM public.exchange_rates
  WHERE from_currency = p_from_currency AND to_currency = p_to_currency;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Exchange rate not found for % to %', p_from_currency, p_to_currency;
  END IF;

  v_converted_amount := ROUND(p_amount * v_rate, 2);

  -- Lock accounts
  SELECT balance INTO v_from_balance
  FROM public.accounts WHERE id = p_from_account_id FOR UPDATE;

  IF v_from_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  SELECT balance INTO v_to_balance
  FROM public.accounts WHERE id = p_to_account_id FOR UPDATE;

  v_from_new_balance := v_from_balance - p_amount;
  v_to_new_balance := v_to_balance + v_converted_amount;

  UPDATE public.accounts SET balance = v_from_new_balance WHERE id = p_from_account_id;
  UPDATE public.accounts SET balance = v_to_new_balance WHERE id = p_to_account_id;

  -- Debit transaction
  INSERT INTO public.transactions (account_id, type, category, description, amount, balance_after, counterparty_name, reference)
  VALUES (p_from_account_id, 'debit', 'exchange', 'Exchange ' || p_from_currency || ' to ' || p_to_currency, p_amount, v_from_new_balance, 'Currency Exchange', 'EXC-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8));

  -- Credit transaction
  INSERT INTO public.transactions (account_id, type, category, description, amount, balance_after, counterparty_name, reference)
  VALUES (p_to_account_id, 'credit', 'exchange', 'Exchange ' || p_from_currency || ' to ' || p_to_currency, v_converted_amount, v_to_new_balance, 'Currency Exchange', 'EXC-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8));

  RETURN jsonb_build_object(
    'success', TRUE,
    'rate', v_rate,
    'converted_amount', v_converted_amount,
    'from_new_balance', v_from_new_balance,
    'to_new_balance', v_to_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Seed Exchange Rates ──────────────────────────────────────────────────────

INSERT INTO public.exchange_rates (from_currency, to_currency, rate) VALUES
  ('GBP', 'EUR', 1.17),
  ('GBP', 'USD', 1.27),
  ('EUR', 'GBP', 0.85),
  ('EUR', 'USD', 1.09),
  ('USD', 'GBP', 0.79),
  ('USD', 'EUR', 0.92)
ON CONFLICT (from_currency, to_currency) DO UPDATE SET rate = EXCLUDED.rate, updated_at = now();
