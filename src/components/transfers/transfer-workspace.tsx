"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Plus,
  Printer,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/store/useStore";
import type { Currency, Payee, Transaction } from "@/types";
import { CURRENCIES, formatAmount, rateToUSD } from "@/lib/currency";
import { mockRequest } from "@/lib/mock";
import { sanitizeText } from "@/lib/sanitize";
import { toast } from "sonner";

const pageSize = 5;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function printReceipt(transaction: Transaction): boolean {
  const printWindow = window.open("", "_blank", "popup,width=420,height=600");
  if (!printWindow) return false;

  const isTransfer = transaction.title.startsWith("Transfer to ");
  const title = escapeHtml(isTransfer ? "Payee" : "Transaction");
  const value = escapeHtml(
    isTransfer ? transaction.title.replace("Transfer to ", "") : transaction.title
  );
  const reference = escapeHtml(transaction.memo);
  const date = escapeHtml(new Date(transaction.date).toLocaleString("en-US"));
  const amount = escapeHtml(formatAmount(transaction.amount, transaction.currency));

  printWindow.document.write(`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Horizon Finance receipt</title>
        <style>
          @page { size: 80mm 70mm; margin: 0; }
          * { box-sizing: border-box; }
          html, body { width: 80mm; height: 70mm; margin: 0; background: #fff; color: #111; }
          body { padding: 5mm; font: 12px Arial, sans-serif; }
          main { width: 70mm; }
          header { padding-bottom: 3mm; border-bottom: 1px dashed #999; }
          h1 { margin: 0; font-size: 15px; font-weight: 600; }
          header p { margin: 1mm 0 0; color: #555; font-size: 10px; }
          .amount { padding: 4mm 0; text-align: center; border-bottom: 1px dashed #999; }
          .amount p { margin: 0; color: #555; font-size: 10px; }
          .amount strong { display: block; margin-top: 1mm; font-size: 20px; }
          dl { margin: 3mm 0 0; }
          dl div { display: flex; justify-content: space-between; gap: 4mm; margin-top: 2mm; }
          dt { color: #555; }
          dd { max-width: 46mm; margin: 0; text-align: right; overflow-wrap: anywhere; }
        </style>
      </head>
      <body>
        <main>
          <header><h1>Transfer receipt</h1><p>Horizon Finance</p></header>
          <section class="amount"><p>Transfer amount</p><strong>${amount}</strong></section>
          <dl>
            <div><dt>${title}</dt><dd>${value}</dd></div>
            <div><dt>Reference</dt><dd>${reference}</dd></div>
            <div><dt>Date</dt><dd>${date}</dd></div>
          </dl>
        </main>
      </body>
    </html>`);
  printWindow.document.close();
  printWindow.addEventListener("afterprint", () => printWindow.close(), { once: true });
  printWindow.setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 100);
  return true;
}

const transferSchema = (availableUsd: number) =>
  z
    .object({
      payeeId: z.string().min(1, "Choose a payee."),
      amount: z.number().finite("Enter a valid amount.").positive("Amount must be greater than zero."),
      currency: z.enum(["USD", "EUR", "GBP", "NGN", "XAF"]),
    })
    .superRefine(({ amount, currency }, context) => {
      if (amount / rateToUSD[currency] > availableUsd) {
        context.addIssue({
          code: "custom",
          path: ["amount"],
          message: "Amount exceeds your available balance.",
        });
      }
    });

const payeeSchema = z.object({
  name: z.string().min(1, "Enter a name.").max(60, "Name is too long."),
  accountNumber: z
    .string()
    .min(4, "Account number must contain at least 4 characters.")
    .max(34, "Account number is too long."),
  currency: z.enum(["USD", "EUR", "GBP", "NGN", "XAF"]),
});

function convertAmount(amount: number, from: Currency, to: Currency): number {
  return (amount / rateToUSD[from]) * rateToUSD[to];
}

function isCurrency(value: string): value is Currency {
  return CURRENCIES.some((currency) => currency === value);
}

function CurrencySelect({
  value,
  onValueChange,
  label,
  className,
}: {
  value: Currency;
  onValueChange: (value: Currency) => void;
  label: string;
  className: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="min-w-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setIsOpen(false);
      }}
    >
      <button
        type="button"
        className={`flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-2 text-sm outline-none transition-colors focus-visible:border-gold focus-visible:bg-gold/10 focus-visible:ring-3 focus-visible:ring-gold/30 ${className}`}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{value}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div
          className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-sm"
          role="listbox"
          aria-label={label}
        >
          {CURRENCIES.map((currency) => (
            <button
              key={currency}
              type="button"
              role="option"
              aria-selected={value === currency}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm outline-none transition-colors hover:bg-gold/20 focus-visible:bg-gold/20 ${
                value === currency ? "bg-gold/20 font-medium text-gold" : ""
              }`}
              onClick={() => {
                if (isCurrency(currency)) onValueChange(currency);
                setIsOpen(false);
              }}
            >
              <span>{currency}</span>
              {value === currency && <Check className="size-4" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TransferWorkspace() {
  const user = useStore((state) => state.user);
  const transactions = useStore((state) => state.transactions);
  const payees = useStore((state) => state.payees);
  const privacyMode = useStore((state) => state.privacyMode);
  const addTransaction = useStore((state) => state.addTransaction);
  const addPayee = useStore((state) => state.addPayee);

  const [availableUsd, setAvailableUsd] = useState(user.balance / rateToUSD[user.currency]);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>(user.currency);
  const [payeeId, setPayeeId] = useState("");
  const [memo, setMemo] = useState("");
  const [transferError, setTransferError] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [converterAmount, setConverterAmount] = useState("100");
  const [converterFrom, setConverterFrom] = useState<Currency>("USD");
  const [converterTo, setConverterTo] = useState<Currency>("EUR");

  const [search, setSearch] = useState("");
  const [historyPage, setHistoryPage] = useState(0);
  const [receipt, setReceipt] = useState<Transaction | null>(null);

  const [payeeName, setPayeeName] = useState("");
  const [payeeAccount, setPayeeAccount] = useState("");
  const [payeeCurrency, setPayeeCurrency] = useState<Currency>("USD");
  const [payeeError, setPayeeError] = useState("");
  const [isAddingPayee, setIsAddingPayee] = useState(false);

  const selectedPayee = payees.find((payee) => payee.id === payeeId);
  const numericAmount = Number(amount);
  const amountInUsd = Number.isFinite(numericAmount) && numericAmount > 0
    ? numericAmount / rateToUSD[currency]
    : 0;
  const receiveAmount = selectedPayee && amountInUsd > 0
    ? amountInUsd * rateToUSD[selectedPayee.currency]
    : 0;

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter((transaction) =>
        !query ||
        [transaction.title, transaction.memo, transaction.currency, transaction.category]
          .some((value) => value.toLocaleLowerCase().includes(query))
      );
  }, [search, transactions]);

  const pageCount = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const visibleTransactions = filteredTransactions.slice(
    historyPage * pageSize,
    (historyPage + 1) * pageSize
  );
  const converterValue = Number(converterAmount);
  const convertedValue = Number.isFinite(converterValue) && converterValue > 0
    ? convertAmount(converterValue, converterFrom, converterTo)
    : 0;
  const availableBalance = availableUsd * rateToUSD[user.currency];

  async function submitTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTransferError("");

    const parsed = transferSchema(availableUsd).safeParse({
      payeeId,
      amount: Number(amount),
      currency,
    });
    if (!parsed.success) {
      setTransferError(parsed.error.issues[0]?.message ?? "Please check the information you entered.");
      return;
    }

    const payee = payees.find((item) => item.id === parsed.data.payeeId);
    if (!payee) {
      setTransferError("This payee is no longer available.");
      return;
    }

    const safeMemo = sanitizeText(memo);
    const transaction: Transaction = {
      id: `tx-${crypto.randomUUID()}`,
      title: `Transfer to ${payee.name}`,
      memo: safeMemo || "Transfer",
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      direction: "out",
      category: "Transfer",
      date: new Date().toISOString(),
    };

    setIsSending(true);
    try {
      const completedTransfer = await mockRequest(transaction);
      addTransaction(completedTransfer);
      setAvailableUsd((current) => current - completedTransfer.amount / rateToUSD[completedTransfer.currency]);
      setReceipt(completedTransfer);
      setAmount("");
      setMemo("");
      toast.success("Transfer sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Transfer failed.");
    } finally {
      setIsSending(false);
    }
  }

  async function submitPayee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPayeeError("");

    const parsed = payeeSchema.safeParse({
      name: sanitizeText(payeeName),
      accountNumber: sanitizeText(payeeAccount),
      currency: payeeCurrency,
    });
    if (!parsed.success) {
      setPayeeError(parsed.error.issues[0]?.message ?? "Please check the information you entered.");
      return;
    }

    const payee: Payee = {
      id: `payee-${crypto.randomUUID()}`,
      ...parsed.data,
    };

    setIsAddingPayee(true);
    try {
      const savedPayee = await mockRequest(payee);
      addPayee(savedPayee);
      setPayeeId(savedPayee.id);
      setCurrency(savedPayee.currency);
      setPayeeName("");
      setPayeeAccount("");
      toast.success("Payee added.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add payee.");
    } finally {
      setIsAddingPayee(false);
    }
  }

  function changeSearch(value: string) {
    setSearch(value);
    setHistoryPage(0);
  }

  function switchConverterCurrencies() {
    setConverterFrom(converterTo);
    setConverterTo(converterFrom);
  }

  return (
    <>
      <main className="flex-1 space-y-5 px-4 py-5 print:hidden">
        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border/80">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Available balance</p>
              <p className={`mt-1.5 text-2xl font-semibold tracking-tight ${privacyMode ? "blur-sm select-none" : ""}`}>
                {formatAmount(availableBalance, user.currency)}
              </p>
            </div>
            <span className="rounded-full bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold">
              {user.currency}
            </span>
          </div>
          <p className="mt-3 border-t border-border/70 pt-2.5 text-xs text-muted-foreground">
            Indicative rates · simulated conversion
          </p>
        </section>

        <Card className="gap-0 rounded-2xl shadow-sm ring-1 ring-border/80 transition-shadow hover:shadow-md">
          <CardHeader className="gap-1 pb-3">
            <SectionHeader icon={Send} title="New transfer" />
          </CardHeader>
          <CardContent>
            <form id="new-transfer" className="space-y-4 border-t border-border/70 pt-4" onSubmit={submitTransfer} noValidate>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium">Payee</span>
                <Button asChild size="sm" variant="outline">
                  <a href="#add-payee">Add a payee</a>
                </Button>
              </div>

              <div className="grid grid-cols-[1fr_6.5rem] gap-2">
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">You send</span>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    aria-label="Amount to send"
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Currency</span>
                  <CurrencySelect
                    className="h-8 w-full"
                    value={currency}
                    onValueChange={setCurrency}
                    label="Send currency"
                  />
                </label>
              </div>

              {selectedPayee && (
                <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3.5 py-3 text-sm ring-1 ring-border/50">
                  <span className="text-muted-foreground">Recipient gets approximately</span>
                  <span className="font-medium">
                    {formatAmount(receiveAmount, selectedPayee.currency)}
                  </span>
                </div>
              )}

              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Reference <span className="font-normal text-muted-foreground">(optional)</span></span>
                <Input
                  maxLength={120}
                  placeholder="e.g. Rent split"
                  value={memo}
                  onChange={(event) => setMemo(event.target.value)}
                />
              </label>

              {transferError && (
                <p className="text-sm text-destructive" role="alert">{transferError}</p>
              )}
              <Button className="h-10 w-full gap-2" type="submit" disabled={isSending || !payeeId}>
                {isSending ? <Clock3 className="size-4 animate-pulse" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
                {isSending ? "Sending…" : "Send"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card size="sm" className="gap-0 rounded-2xl shadow-sm ring-1 ring-border/80 transition-shadow hover:shadow-md">
          <CardHeader className="pb-0">
            <SectionHeader icon={ArrowLeftRight} title="Currency converter" />
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
              <label className="space-y-1.5 text-sm">
                <span className="text-xs text-muted-foreground">Amount</span>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={converterAmount}
                  onChange={(event) => setConverterAmount(event.target.value)}
                  aria-label="Amount to convert"
                />
              </label>
              <label className="sr-only" htmlFor="converter-from">From currency</label>
              <CurrencySelect
                className="h-8"
                value={converterFrom}
                onValueChange={setConverterFrom}
                label="From currency"
              />
            </div>
            <div className="flex items-center justify-center">
              <Button
                className="rounded-full shadow-sm"
                size="icon"
                type="button"
                variant="outline"
                onClick={switchConverterCurrencies}
                aria-label="Swap currencies"
              >
                <ArrowLeftRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3.5 py-3 ring-1 ring-border/50">
              <span className="text-sm text-muted-foreground">Estimated amount</span>
              <div className="text-right">
                <label className="sr-only" htmlFor="converter-to">To currency</label>
                <CurrencySelect
                  className="mb-1 h-7 text-xs"
                  value={converterTo}
                  onValueChange={setConverterTo}
                  label="To currency"
                />
                <p className="font-semibold">{formatAmount(convertedValue, converterTo)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              1 {converterFrom} ≈ {formatAmount(rateToUSD[converterTo] / rateToUSD[converterFrom], converterTo)}
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-2xl shadow-sm ring-1 ring-border/80 transition-shadow hover:shadow-md">
          <CardHeader className="gap-3 pb-3">
            <SectionHeader icon={Clock} title="Recent activity" />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                className="pl-9"
                placeholder="Search transactions"
                value={search}
                onChange={(event) => changeSearch(event.target.value)}
                aria-label="Search transaction history"
              />
            </div>
          </CardHeader>
          <CardContent className="border-t border-border/70 pt-1">
            {visibleTransactions.length > 0 ? (
              <ul className="divide-y divide-border">
                {isSending && (
                  <li className="flex items-center gap-3 py-3" aria-label="Transfer in progress">
                    <Skeleton className="size-9 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-2.5 w-1/2" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </li>
                )}
                {visibleTransactions.map((transaction) => (
                  <li key={transaction.id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => setReceipt(transaction)}
                      aria-label={`View receipt: ${transaction.title}`}
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                        {transaction.direction === "in"
                          ? <ArrowDownLeft className="size-4 text-emerald-600" aria-hidden="true" />
                          : <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{transaction.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {transaction.memo || transaction.category} · {new Date(transaction.date).toLocaleDateString("en-US")}
                        </span>
                      </span>
                      <span className={`shrink-0 text-sm font-semibold ${transaction.direction === "in" ? "text-emerald-600" : ""}`}>
                        {transaction.direction === "in" ? "+" : "−"}
                        {formatAmount(transaction.amount, transaction.currency)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {search ? "No transactions found." : "No transactions yet."}
              </p>
            )}
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">
                {filteredTransactions.length === 0
                  ? "0 results"
                  : `${historyPage * pageSize + 1}–${Math.min((historyPage + 1) * pageSize, filteredTransactions.length)} of ${filteredTransactions.length}`}
              </p>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  type="button"
                  variant="ghost"
                  disabled={historyPage === 0}
                  onClick={() => setHistoryPage((page) => Math.max(0, page - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <Button
                  size="icon"
                  type="button"
                  variant="ghost"
                  disabled={historyPage >= pageCount - 1}
                  onClick={() => setHistoryPage((page) => Math.min(pageCount - 1, page + 1))}
                  aria-label="Next page"
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-2xl shadow-sm ring-1 ring-border/80 transition-shadow hover:shadow-md">
          <CardHeader className="pb-3">
            <SectionHeader icon={Users} title="Payees" />
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="divide-y divide-border/70 border-t border-border/70">
              {payees.map((payee) => (
                <li key={payee.id} className="flex items-center justify-between gap-3 px-1 py-3 transition-colors hover:bg-muted/40">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{payee.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{payee.accountNumber}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{payee.currency}</span>
                    <Button
                      size="sm"
                      type="button"
                      variant={payee.id === payeeId ? "secondary" : "outline"}
                      disabled={payee.id === payeeId}
                      onClick={() => {
                        setPayeeId(payee.id);
                        document.getElementById("new-transfer")?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {payee.id === payeeId ? "Selected" : "Use"}
                    </Button>
                  </div>
                </li>
              ))}
              {isAddingPayee && (
                <li className="flex items-center gap-3 py-3" aria-label="Adding payee">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-3 w-2/5" />
                    <Skeleton className="h-2.5 w-3/5" />
                  </div>
                  <Skeleton className="h-5 w-10 rounded-full" />
                </li>
              )}
              {payees.length === 0 && (
                <li className="py-3 text-sm text-muted-foreground">No saved payees.</li>
              )}
            </ul>
            <form id="add-payee" className="scroll-mt-4 space-y-3 rounded-xl border border-border/70 bg-muted/20 p-3.5" onSubmit={submitPayee} noValidate>
              <p className="flex items-center gap-2 text-sm font-medium">
                <Plus className="size-4 text-gold" aria-hidden="true" />
                Add a payee
              </p>
              <label className="block space-y-1.5 text-sm">
                <span className="text-xs text-muted-foreground">Name</span>
                <Input
                  autoComplete="name"
                  maxLength={100}
                  placeholder="Payee name"
                  value={payeeName}
                  onChange={(event) => setPayeeName(event.target.value)}
                />
              </label>
              <label className="block space-y-1.5 text-sm">
                <span className="text-xs text-muted-foreground">Account number</span>
                <Input
                  autoComplete="off"
                  maxLength={34}
                  placeholder="IBAN or account number"
                  value={payeeAccount}
                  onChange={(event) => setPayeeAccount(event.target.value)}
                />
              </label>
              <label className="block space-y-1.5 text-sm">
                <span className="text-xs text-muted-foreground">Receiving currency</span>
                <CurrencySelect
                  className="h-9 w-full"
                  value={payeeCurrency}
                  onValueChange={setPayeeCurrency}
                  label="Payee receiving currency"
                />
              </label>
              {payeeError && <p className="text-sm text-destructive" role="alert">{payeeError}</p>}
              <Button className="w-full gap-2" type="submit" variant="outline" disabled={isAddingPayee}>
                {isAddingPayee ? <Clock3 className="size-4 animate-pulse" aria-hidden="true" /> : <Check className="size-4" aria-hidden="true" />}
                {isAddingPayee ? "Adding…" : "Save payee"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-sm shadow-xl">
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-4 text-gold print:hidden" aria-hidden="true" />
                  Transfer receipt
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">Horizon Finance</p>
              </div>
              <Button
                className="print:hidden"
                size="icon"
                type="button"
                variant="ghost"
                onClick={() => setReceipt(null)}
                aria-label="Close receipt"
              >
                <X aria-hidden="true" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="border-y border-dashed border-border py-3 text-center">
                <p className="text-xs text-muted-foreground">Transfer amount</p>
                <p className="mt-1 text-2xl font-semibold">
                  {formatAmount(receipt.amount, receipt.currency)}
                </p>
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">
                    {receipt.title.startsWith("Transfer to ") ? "Payee" : "Transaction"}
                  </dt>
                  <dd className="text-right font-medium">
                    {receipt.title.startsWith("Transfer to ")
                      ? receipt.title.replace("Transfer to ", "")
                      : receipt.title}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Reference</dt>
                  <dd className="text-right">{receipt.memo}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Date</dt>
                  <dd className="text-right">{new Date(receipt.date).toLocaleString("en-US")}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Transaction ID</dt>
                  <dd className="max-w-40 truncate text-right font-mono text-xs">{receipt.id}</dd>
                </div>
              </dl>
              <Button
                className="w-full gap-2"
                type="button"
                onClick={() => {
                  if (!printReceipt(receipt)) {
                    toast.error("Allow pop-ups to print the receipt.");
                  }
                }}
              >
                <Printer className="size-4" aria-hidden="true" />
                Print receipt
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
