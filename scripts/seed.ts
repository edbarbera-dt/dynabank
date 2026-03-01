/**
 * DynaBank Seed Script
 *
 * Creates a demo user with realistic banking data:
 * - Demo user: demo@dynabank.com / Demo1234!
 * - Current Account (GBP) with £4,250.80
 * - Savings Account (GBP) with £12,500.00
 * - 30+ transactions spanning 60 days
 * - 2 virtual cards
 * - 5 beneficiaries
 *
 * Usage: npm run seed
 * Requires: EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Error: EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_EMAIL = "demo@dynabank.com";
const DEMO_PASSWORD = "Demo1234!";
const DEMO_NAME = "Alex Johnson";

async function seed() {
  console.log("🏦 DynaBank Seed Script");
  console.log("========================\n");

  // 1. Create or get demo user
  console.log("1. Creating demo user...");
  let userId: string;

  // Check if user exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === DEMO_EMAIL);

  if (existing) {
    userId = existing.id;
    console.log(`   User already exists: ${userId}`);
  } else {
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
    });

    if (error) {
      // If trigger fails (missing permissions), try creating user without trigger
      console.log(`   ⚠️  createUser failed: ${error.message}`);
      console.log("   Attempting workaround: creating user via auth.signUp...");

      // Use raw SQL to temporarily disable the trigger, create user, then re-enable
      // Or try an alternative: create user with admin API, ignoring trigger
      const { data: rawUser, error: rawError } =
        await supabase.auth.admin.createUser({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
          email_confirm: true,
          // Skip automatic confirmation trigger
          user_metadata: { skip_trigger: true },
        });

      if (rawError) {
        console.error(
          "\n   ❌ User creation failed. This is likely a permissions issue.",
        );
        console.error(
          "   Run the following SQL in your Supabase SQL Editor:\n",
        );
        console.error(
          "   GRANT USAGE ON SCHEMA public TO supabase_auth_admin;",
        );
        console.error(
          "   GRANT INSERT ON public.profiles TO supabase_auth_admin;",
        );
        console.error(
          "   GRANT INSERT ON public.accounts TO supabase_auth_admin;",
        );
        console.error(
          "   GRANT EXECUTE ON FUNCTION generate_account_number() TO supabase_auth_admin;",
        );
        console.error(
          "   GRANT EXECUTE ON FUNCTION generate_sort_code() TO supabase_auth_admin;\n",
        );
        console.error(
          "   Or run: supabase/fixes/001_grant_trigger_permissions.sql",
        );
        throw rawError;
      }
      userId = rawUser.user.id;
    } else {
      userId = newUser.user.id;
    }
    console.log(`   Created user: ${userId}`);

    // Wait for trigger to create profile & accounts
    await new Promise((r) => setTimeout(r, 2000));
  }

  // 2. Update profile
  console.log("2. Updating profile...");
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    full_name: DEMO_NAME,
    phone: "+447700900123",
    country: "United Kingdom",
    account_type: "personal",
    onboarding_complete: true,
    pin_hash:
      "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3", // SHA-256 of "123456"
  });
  if (profileError) throw profileError;
  console.log("   Profile updated.");

  // 3. Setup accounts
  console.log("3. Setting up accounts...");

  // Get existing accounts (created by trigger)
  let { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId);

  if (!accounts || accounts.length === 0) {
    // Create accounts manually if trigger didn't fire
    const { error: acc1Error } = await supabase.from("accounts").insert({
      user_id: userId,
      name: "Current Account",
      account_number: "12345678",
      sort_code: "040004",
      currency: "GBP",
      balance: 4250.8,
      is_primary: true,
    });
    if (acc1Error) throw acc1Error;

    const { error: acc2Error } = await supabase.from("accounts").insert({
      user_id: userId,
      name: "Savings",
      account_number: "87654321",
      sort_code: "040004",
      currency: "GBP",
      balance: 12500.0,
      is_primary: false,
    });
    if (acc2Error) throw acc2Error;

    // Re-fetch
    const { data: newAccounts } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", userId);
    accounts = newAccounts;
  } else {
    // Update existing account balances
    const primary = accounts.find((a) => a.is_primary);
    const savings = accounts.find((a) => !a.is_primary);

    if (primary) {
      await supabase
        .from("accounts")
        .update({ balance: 4250.8, name: "Current Account" })
        .eq("id", primary.id);
    }
    if (savings) {
      await supabase
        .from("accounts")
        .update({ balance: 12500.0, name: "Savings" })
        .eq("id", savings.id);
    }
  }

  const currentAccount = accounts!.find((a) => a.is_primary)!;
  const savingsAccount = accounts!.find((a) => !a.is_primary)!;
  console.log(
    `   Current Account: ${currentAccount.id} (£${currentAccount.balance})`,
  );
  console.log(
    `   Savings Account: ${savingsAccount.id} (£${savingsAccount.balance})`,
  );

  // 4. Clear old demo data
  console.log("4. Clearing old demo data...");
  await supabase
    .from("transactions")
    .delete()
    .eq("account_id", currentAccount.id);
  await supabase
    .from("transactions")
    .delete()
    .eq("account_id", savingsAccount.id);
  // Cards don't have user_id — delete via account IDs
  await supabase
    .from("cards")
    .delete()
    .in(
      "account_id",
      accounts!.map((a) => a.id),
    );
  await supabase.from("beneficiaries").delete().eq("user_id", userId);
  console.log("   Cleared.");

  // 5. Seed transactions
  console.log("5. Seeding transactions...");
  const now = new Date();
  const transactions = generateTransactions(currentAccount.id, now);

  // Insert in batches
  for (let i = 0; i < transactions.length; i += 10) {
    const batch = transactions.slice(i, i + 10);
    const { error } = await supabase.from("transactions").insert(batch);
    if (error) throw error;
  }
  console.log(`   Created ${transactions.length} transactions.`);

  // Add a few savings transactions
  const savingsTxns = [
    {
      account_id: savingsAccount.id,
      type: "credit",
      amount: 500.0,
      currency: "GBP",
      category: "transfer",
      description: "Monthly savings",
      counterparty_name: "Current Account",
      reference: "Monthly savings",
      balance_after: 12500.0,
      created_at: daysAgo(now, 5),
    },
    {
      account_id: savingsAccount.id,
      type: "credit",
      amount: 500.0,
      currency: "GBP",
      category: "transfer",
      description: "Monthly savings",
      counterparty_name: "Current Account",
      reference: "Monthly savings",
      balance_after: 12000.0,
      created_at: daysAgo(now, 35),
    },
  ];
  await supabase.from("transactions").insert(savingsTxns);
  console.log("   Added savings transactions.");

  // 6. Seed cards
  console.log("6. Seeding cards...");
  const cards = [
    {
      account_id: currentAccount.id,
      card_number: "4532891234567890",
      card_holder_name: DEMO_NAME,
      expiry_date: "09/27",
      card_type: "visa",
      status: "active",
      daily_limit: 1000,
    },
    {
      account_id: currentAccount.id,
      card_number: "4532894561237890",
      card_holder_name: DEMO_NAME,
      expiry_date: "12/28",
      card_type: "mastercard",
      status: "active",
      daily_limit: 500,
    },
  ];
  const { error: cardsError } = await supabase.from("cards").insert(cards);
  if (cardsError) throw cardsError;
  console.log("   Created 2 cards.");

  // 7. Seed beneficiaries
  console.log("7. Seeding beneficiaries...");
  const beneficiaries = [
    {
      user_id: userId,
      name: "Sarah Williams",
      account_number: "23456789",
      sort_code: "200415",
      bank_name: "Barclays",
    },
    {
      user_id: userId,
      name: "James Taylor",
      account_number: "34567890",
      sort_code: "309213",
      bank_name: "HSBC",
    },
    {
      user_id: userId,
      name: "Emily Chen",
      account_number: "45678901",
      sort_code: "040004",
      bank_name: "DynaBank",
    },
    {
      user_id: userId,
      name: "Mohammed Ali",
      account_number: "56789012",
      sort_code: "601613",
      bank_name: "NatWest",
    },
    {
      user_id: userId,
      name: "Landlord - ABC Properties",
      account_number: "67890123",
      sort_code: "200415",
      bank_name: "Barclays",
    },
  ];
  const { error: benError } = await supabase
    .from("beneficiaries")
    .insert(beneficiaries);
  if (benError) throw benError;
  console.log("   Created 5 beneficiaries.");

  // Done
  console.log("\n========================");
  console.log("✅ Seed complete!");
  console.log(`\n📱 Login with:`);
  console.log(`   Email:    ${DEMO_EMAIL}`);
  console.log(`   Password: ${DEMO_PASSWORD}`);
  console.log(`   PIN:      123456`);
}

function generateTransactions(accountId: string, now: Date) {
  const txns: any[] = [];
  let balance = 4250.8;

  // Work backwards from current balance
  const items = [
    // Today
    {
      days: 0,
      type: "debit",
      amount: 4.5,
      cat: "food",
      counterparty: "Pret A Manger",
      ref: "Lunch",
    },
    {
      days: 0,
      type: "debit",
      amount: 12.99,
      cat: "subscription",
      counterparty: "Netflix",
      ref: "Monthly subscription",
    },
    // Yesterday
    {
      days: 1,
      type: "debit",
      amount: 35.0,
      cat: "shopping",
      counterparty: "Amazon",
      ref: "Order #12345",
    },
    {
      days: 1,
      type: "debit",
      amount: 2.8,
      cat: "transport",
      counterparty: "TfL",
      ref: "Contactless",
    },
    // 2 days ago
    {
      days: 2,
      type: "credit",
      amount: 3200.0,
      cat: "salary",
      counterparty: "Dynatrace Ltd",
      ref: "Monthly salary",
    },
    {
      days: 2,
      type: "debit",
      amount: 850.0,
      cat: "payment",
      counterparty: "ABC Properties",
      ref: "Rent - March",
    },
    // 3 days ago
    {
      days: 3,
      type: "debit",
      amount: 45.6,
      cat: "food",
      counterparty: "Tesco",
      ref: "Weekly shop",
    },
    {
      days: 3,
      type: "debit",
      amount: 6.4,
      cat: "food",
      counterparty: "Costa Coffee",
      ref: "Coffee",
    },
    // 5 days ago
    {
      days: 5,
      type: "debit",
      amount: 500.0,
      cat: "transfer",
      counterparty: "Savings Account",
      ref: "Monthly savings",
    },
    {
      days: 5,
      type: "debit",
      amount: 150.0,
      cat: "transfer",
      counterparty: "Sarah Williams",
      ref: "Dinner split",
    },
    // 7 days ago
    {
      days: 7,
      type: "debit",
      amount: 29.99,
      cat: "entertainment",
      counterparty: "Vue Cinema",
      ref: "Movie tickets",
    },
    {
      days: 7,
      type: "debit",
      amount: 55.0,
      cat: "shopping",
      counterparty: "Zara",
      ref: "Clothing",
    },
    // 10 days ago
    {
      days: 10,
      type: "debit",
      amount: 9.99,
      cat: "subscription",
      counterparty: "Spotify",
      ref: "Premium subscription",
    },
    {
      days: 10,
      type: "debit",
      amount: 22.5,
      cat: "transport",
      counterparty: "Uber",
      ref: "Trip to airport",
    },
    // 12 days ago
    {
      days: 12,
      type: "credit",
      amount: 75.0,
      cat: "transfer",
      counterparty: "James Taylor",
      ref: "Birthday money",
    },
    {
      days: 12,
      type: "debit",
      amount: 38.9,
      cat: "food",
      counterparty: "Deliveroo",
      ref: "Friday dinner",
    },
    // 15 days ago
    {
      days: 15,
      type: "debit",
      amount: 120.0,
      cat: "shopping",
      counterparty: "John Lewis",
      ref: "Home accessories",
    },
    {
      days: 15,
      type: "debit",
      amount: 3.6,
      cat: "food",
      counterparty: "Greggs",
      ref: "Breakfast",
    },
    // 18 days ago
    {
      days: 18,
      type: "debit",
      amount: 67.5,
      cat: "entertainment",
      counterparty: "O2 Arena",
      ref: "Concert tickets",
    },
    // 20 days ago
    {
      days: 20,
      type: "debit",
      amount: 15.0,
      cat: "transport",
      counterparty: "TfL",
      ref: "Weekly travelcard",
    },
    {
      days: 20,
      type: "debit",
      amount: 89.0,
      cat: "shopping",
      counterparty: "Nike",
      ref: "Running shoes",
    },
    // 25 days ago
    {
      days: 25,
      type: "debit",
      amount: 42.3,
      cat: "food",
      counterparty: "Sainsburys",
      ref: "Groceries",
    },
    {
      days: 25,
      type: "debit",
      amount: 200.0,
      cat: "transfer",
      counterparty: "Mohammed Ali",
      ref: "Holiday fund",
    },
    // 30 days ago
    {
      days: 30,
      type: "credit",
      amount: 3200.0,
      cat: "salary",
      counterparty: "Dynatrace Ltd",
      ref: "Monthly salary",
    },
    {
      days: 30,
      type: "debit",
      amount: 850.0,
      cat: "payment",
      counterparty: "ABC Properties",
      ref: "Rent - February",
    },
    // 32 days ago
    {
      days: 32,
      type: "debit",
      amount: 12.99,
      cat: "subscription",
      counterparty: "Netflix",
      ref: "Monthly subscription",
    },
    {
      days: 32,
      type: "debit",
      amount: 9.99,
      cat: "subscription",
      counterparty: "Spotify",
      ref: "Premium subscription",
    },
    // 35 days ago
    {
      days: 35,
      type: "debit",
      amount: 500.0,
      cat: "transfer",
      counterparty: "Savings Account",
      ref: "Monthly savings",
    },
    {
      days: 35,
      type: "debit",
      amount: 78.4,
      cat: "food",
      counterparty: "Ocado",
      ref: "Online shop",
    },
    // 40 days ago
    {
      days: 40,
      type: "debit",
      amount: 34.99,
      cat: "entertainment",
      counterparty: "PlayStation Store",
      ref: "Game purchase",
    },
    {
      days: 40,
      type: "debit",
      amount: 18.5,
      cat: "transport",
      counterparty: "Uber",
      ref: "Late night ride",
    },
    // 45 days ago
    {
      days: 45,
      type: "credit",
      amount: 250.0,
      cat: "transfer",
      counterparty: "Emily Chen",
      ref: "Trip refund",
    },
    {
      days: 45,
      type: "debit",
      amount: 65.0,
      cat: "shopping",
      counterparty: "Uniqlo",
      ref: "Winter clothing",
    },
    // 50 days ago
    {
      days: 50,
      type: "debit",
      amount: 11.2,
      cat: "food",
      counterparty: "Wagamama",
      ref: "Lunch",
    },
    {
      days: 50,
      type: "debit",
      amount: 95.0,
      cat: "payment",
      counterparty: "EE",
      ref: "Phone bill",
    },
  ];

  // Calculate running balance
  let runningBalance = balance;
  for (const item of items) {
    if (item.type === "debit") {
      runningBalance = +(runningBalance + item.amount).toFixed(2);
    } else {
      runningBalance = +(runningBalance - item.amount).toFixed(2);
    }
  }

  // Now create transactions with correct balance_after
  let currentBalance = runningBalance;
  for (const item of items) {
    if (item.type === "credit") {
      currentBalance = +(currentBalance + item.amount).toFixed(2);
    } else {
      currentBalance = +(currentBalance - item.amount).toFixed(2);
    }

    txns.push({
      account_id: accountId,
      type: item.type,
      amount: item.amount,
      currency: "GBP",
      category: item.cat,
      description: item.ref,
      counterparty_name: item.counterparty,
      reference: item.ref,
      balance_after: currentBalance,
      created_at: daysAgo(now, item.days),
    });
  }

  return txns;
}

function daysAgo(now: Date, days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  // Random hour between 8-22
  d.setHours(Math.floor(Math.random() * 14) + 8);
  d.setMinutes(Math.floor(Math.random() * 60));
  return d.toISOString();
}

// Run
seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Seed failed:", err);
    process.exit(1);
  });

