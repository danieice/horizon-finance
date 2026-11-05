import type { Currency } from "@/types";

export const CURRENCIES: Currency[] = ["USD", "EUR", "GBP", "NGN", "XAF"];

// symbol shown before an amount
export const currencySymbol: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  NGN: "₦",
  XAF: "FCFA ",
};

// indicative rates vs USD, for the mock converter (1 USD = X)
export const rateToUSD: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  NGN: 1550,
  XAF: 605,
};

export function formatAmount(amount: number, currency: Currency): string {
  const fixed = currency === "NGN" || currency === "XAF" ? 0 : 2;
  return `${currencySymbol[currency]}${amount.toLocaleString("en-US", {
    minimumFractionDigits: fixed,
    maximumFractionDigits: fixed,
  })}`;
}