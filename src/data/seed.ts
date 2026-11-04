import type { Card, Payee, Transaction, User } from "@/types";

export const seedUser: User = {
  name: "Daniel",
  email: "daniel@horizon.app",
  balance: 12480.52,
  currency: "USD",
};

export const seedCards: Card[] = [
  {
    id: "c1",
    label: "Horizon Metal",
    last4: "5678",
    pan: "4921 7634 2201 5678",
    cvv: "412",
    expiry: "11/28",
    holder: "DANIEL N",
    status: "active",
    limit: 5000,
    spent: 1840,
  },
  {
    id: "c2",
    label: "Virtual Everyday",
    last4: "0043",
    pan: "5273 4620 7703 0043",
    cvv: "901",
    expiry: "03/27",
    holder: "DANIEL N",
    status: "frozen",
    limit: 2000,
    spent: 320,
  },
];

export const seedTransactions: Transaction[] = [
  { id: "t1", title: "Salary", memo: "October payroll", amount: 4200, currency: "USD", direction: "in", category: "Income", date: daysAgo(2) },
  { id: "t2", title: "Whole Foods", memo: "Groceries", amount: 86.4, currency: "USD", direction: "out", category: "Food", date: daysAgo(2) },
  { id: "t3", title: "Transfer to Amina", memo: "Rent split", amount: 650, currency: "USD", direction: "out", category: "Transfer", date: daysAgo(4) },
  { id: "t4", title: "Uber", memo: "Airport", amount: 34.2, currency: "USD", direction: "out", category: "Transport", date: daysAgo(5) },
  { id: "t5", title: "Amazon", memo: "Headphones", amount: 129.99, currency: "USD", direction: "out", category: "Shopping", date: daysAgo(6) },
  { id: "t6", title: "Electric bill", memo: "Utilities", amount: 74.1, currency: "USD", direction: "out", category: "Bills", date: daysAgo(8) },
  { id: "t7", title: "Refund", memo: "Returned item", amount: 59.99, currency: "USD", direction: "in", category: "Income", date: daysAgo(9) },
  { id: "t8", title: "Spotify", memo: "Subscription", amount: 11.99, currency: "USD", direction: "out", category: "Bills", date: daysAgo(12) },
];

export const seedPayees: Payee[] = [
  { id: "p1", name: "Amina Bello", accountNumber: "0221005678", currency: "USD" },
  { id: "p2", name: "Junior Ngono", accountNumber: "0449887701", currency: "EUR" },
  { id: "p3", name: "Sarah Mbah", accountNumber: "0113446622", currency: "GBP" },
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}