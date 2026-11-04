export type Currency = "USD" | "EUR" | "GBP" | "NGN" | "XAF";

export type CardStatus = "active" | "frozen";

export type Card = {
  id: string;
  label: string;
  last4: string;
  pan: string;
  cvv: string;
  expiry: string;
  holder: string;
  status: CardStatus;
  limit: number;
  spent: number;
};

export type TxDirection = "in" | "out";
export type TxCategory = "Transfer" | "Food" | "Shopping" | "Bills" | "Income" | "Transport";

export type Transaction = {
  id: string;
  title: string;
  memo: string;
  amount: number;
  currency: Currency;
  direction: TxDirection;
  category: TxCategory;
  date: string; // ISO
};

export type Payee = {
  id: string;
  name: string;
  accountNumber: string;
  currency: Currency;
};

export type AuditEvent = {
  id: string;
  action: string;
  detail: string;
  at: string; // ISO
};

export type User = {
  name: string;
  email: string;
  balance: number;
  currency: Currency;
};