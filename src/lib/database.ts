import { supabase } from "./supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  pin_hash: string | null;
  account_type: "personal" | "business" | null;
  country: string | null;
  onboarding_complete: boolean;
  created_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  currency: string;
  balance: number;
  account_number: string;
  sort_code: string;
  is_primary: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  account_id: string;
  type: "credit" | "debit";
  category: string;
  description: string;
  amount: number;
  balance_after: number;
  counterparty_name: string | null;
  reference: string | null;
  created_at: string;
}

export interface Card {
  id: string;
  account_id: string;
  card_number: string;
  card_holder_name: string;
  expiry_date: string;
  card_type: "visa" | "mastercard";
  status: "active" | "frozen" | "cancelled";
  daily_limit: number;
  created_at: string;
}

export interface Beneficiary {
  id: string;
  user_id: string;
  name: string;
  account_number: string;
  sort_code: string;
  bank_name: string;
  avatar_url?: string;
  created_at: string;
}

export interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  updated_at: string;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  return data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<
    Pick<
      Profile,
      | "full_name"
      | "phone"
      | "avatar_url"
      | "account_type"
      | "country"
      | "onboarding_complete"
      | "pin_hash"
    >
  >,
) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Profile;
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

export async function getAccounts(userId: string): Promise<Account[]> {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .order("is_primary", { ascending: false });

  if (error) {
    console.error("Error fetching accounts:", error);
    return [];
  }
  return data ?? [];
}

export async function getAccount(accountId: string): Promise<Account | null> {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", accountId)
    .single();

  if (error) return null;
  return data;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function getTransactions(
  accountId: string,
  limit = 50,
  offset = 0,
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
  return data ?? [];
}

export async function getRecentTransactions(
  accountId: string,
  limit = 5,
): Promise<Transaction[]> {
  return getTransactions(accountId, limit);
}

export async function getTransaction(
  transactionId: string,
): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", transactionId)
    .single();

  if (error) return null;
  return data;
}

// ─── Transfers ────────────────────────────────────────────────────────────────

export async function transferMoney(
  fromAccountId: string,
  toAccountId: string,
  amount: number,
  description: string,
) {
  const { data, error } = await supabase.rpc("transfer_money", {
    p_from_account_id: fromAccountId,
    p_to_account_id: toAccountId,
    p_amount: amount,
    p_description: description,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function transferToExternal(
  fromAccountId: string,
  amount: number,
  beneficiaryName: string,
  reference: string,
) {
  const { data, error } = await supabase.rpc("transfer_external", {
    p_from_account_id: fromAccountId,
    p_amount: amount,
    p_beneficiary_name: beneficiaryName,
    p_reference: reference,
  });

  if (error) throw new Error(error.message);
  return data;
}

// ─── Top Up ───────────────────────────────────────────────────────────────────

export async function topUpAccount(accountId: string, amount: number) {
  const { data, error } = await supabase.rpc("top_up_account", {
    p_account_id: accountId,
    p_amount: amount,
  });

  if (error) throw new Error(error.message);
  return data;
}

// ─── Cards ────────────────────────────────────────────────────────────────────

export async function getCards(accountId: string): Promise<Card[]> {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching cards:", error);
    return [];
  }
  return data ?? [];
}

export async function getUserCards(userId: string): Promise<Card[]> {
  const { data, error } = await supabase
    .from("cards")
    .select("*, accounts!inner(user_id)")
    .eq("accounts.user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user cards:", error);
    return [];
  }
  return data ?? [];
}

export async function updateCardStatus(cardId: string, status: Card["status"]) {
  const { data, error } = await supabase
    .from("cards")
    .update({ status })
    .eq("id", cardId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Card;
}

export async function updateCardLimit(cardId: string, dailyLimit: number) {
  const { data, error } = await supabase
    .from("cards")
    .update({ daily_limit: dailyLimit })
    .eq("id", cardId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Card;
}

export async function createCard(
  accountId: string,
  cardHolderName: string,
  cardType: "visa" | "mastercard",
): Promise<Card> {
  // Generate a masked card number (only store last 4 digits visibly)
  const last4 = Math.floor(1000 + Math.random() * 9000).toString();
  const cardNumber = `****  ****  ****  ${last4}`;
  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 3);
  const expiryDate = `${String(expiry.getMonth() + 1).padStart(2, "0")}/${String(expiry.getFullYear()).slice(-2)}`;

  const { data, error } = await supabase
    .from("cards")
    .insert({
      account_id: accountId,
      card_number: cardNumber,
      card_holder_name: cardHolderName,
      expiry_date: expiryDate,
      card_type: cardType,
      status: "active",
      daily_limit: 1000,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Card;
}

// ─── Beneficiaries ────────────────────────────────────────────────────────────

export async function getBeneficiaries(userId: string): Promise<Beneficiary[]> {
  const { data, error } = await supabase
    .from("beneficiaries")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching beneficiaries:", error);
    return [];
  }
  return data ?? [];
}

export async function addBeneficiary(
  userId: string,
  beneficiary: Omit<Beneficiary, "id" | "user_id" | "created_at">,
): Promise<Beneficiary> {
  const { data, error } = await supabase
    .from("beneficiaries")
    .insert({ ...beneficiary, user_id: userId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Beneficiary;
}

export async function deleteBeneficiary(beneficiaryId: string) {
  const { error } = await supabase
    .from("beneficiaries")
    .delete()
    .eq("id", beneficiaryId);

  if (error) throw new Error(error.message);
}

// ─── Exchange Rates ───────────────────────────────────────────────────────────

export async function getExchangeRates(): Promise<ExchangeRate[]> {
  const { data, error } = await supabase
    .from("exchange_rates")
    .select("*")
    .order("from_currency");

  if (error) {
    console.error("Error fetching exchange rates:", error);
    return [];
  }
  return data ?? [];
}

export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string,
): Promise<number | null> {
  const { data, error } = await supabase
    .from("exchange_rates")
    .select("rate")
    .eq("from_currency", fromCurrency)
    .eq("to_currency", toCurrency)
    .single();

  if (error) return null;
  return data?.rate ?? null;
}

export async function exchangeMoney(
  fromAccountId: string,
  toAccountId: string,
  amount: number,
  fromCurrency: string,
  toCurrency: string,
) {
  const { data, error } = await supabase.rpc("exchange_money", {
    p_from_account_id: fromAccountId,
    p_to_account_id: toAccountId,
    p_amount: amount,
    p_from_currency: fromCurrency,
    p_to_currency: toCurrency,
  });

  if (error) throw new Error(error.message);
  return data;
}

