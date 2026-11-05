"use client";

import { useState, type FormEvent } from "react";
import {
  ArrowLeftRight,
  Check,
  ChevronDown,
  Clock3,
  Plus,
  Send,
  Users,
} from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/store/useStore";
import type { Currency, Payee, Transaction } from "@/types";
import { CURRENCIES, formatAmount, rateToUSD } from "@/lib/currency";
import { mockRequest } from "@/lib/mock";
import { sanitizeText } from "@/lib/sanitize";
import { toast } from "sonner";
import { RecentActivity, TransactionDetails } from "@/components/analytics";

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

  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

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

  const selectedTransaction = transactions.find(
    (transaction) => transaction.id === selectedTransactionId
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
      setSelectedTransactionId(completedTransfer.id);
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

  function switchConverterCurrencies() {
    setConverterFrom(converterTo);
    setConverterTo(converterFrom);
  }

  return (
    <>
      <main className="flex-1 space-y-5 px-4 py-5 print:hidden">
        {selectedTransaction ? (
          <TransactionDetails
            tx={selectedTransaction}
            onBack={() => setSelectedTransactionId(null)}
          />
        ) : (
          <>
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

        <RecentActivity onSelectTransaction={setSelectedTransactionId} />

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
          </>
        )}
      </main>

    </>
  );
}
