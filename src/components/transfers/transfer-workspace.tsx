"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Plus,
  Printer,
  Search,
  Send,
  UserRound,
  X,
} from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/store/useStore";
import type { Currency, Payee, Transaction } from "@/types";
import { CURRENCIES, formatAmount, rateToUSD } from "@/lib/currency";
import { mockRequest } from "@/lib/mock";
import { sanitizeText } from "@/lib/sanitize";
import { toast } from "sonner";

const pageSize = 5;

const transferSchema = (availableUsd: number) =>
  z
    .object({
      payeeId: z.string().min(1, "Choisissez un bénéficiaire."),
      amount: z.number().finite("Saisissez un montant valide.").positive("Le montant doit être supérieur à zéro."),
      currency: z.enum(["USD", "EUR", "GBP", "NGN", "XAF"]),
    })
    .superRefine(({ amount, currency }, context) => {
      if (amount / rateToUSD[currency] > availableUsd) {
        context.addIssue({
          code: "custom",
          path: ["amount"],
          message: "Le montant dépasse votre solde disponible.",
        });
      }
    });

const payeeSchema = z.object({
  name: z.string().min(1, "Saisissez un nom.").max(60, "Le nom est trop long."),
  accountNumber: z
    .string()
    .min(4, "Le numéro de compte doit contenir au moins 4 caractères.")
    .max(34, "Le numéro de compte est trop long."),
  currency: z.enum(["USD", "EUR", "GBP", "NGN", "XAF"]),
});

function convertAmount(amount: number, from: Currency, to: Currency): number {
  return (amount / rateToUSD[from]) * rateToUSD[to];
}

function currencyOptions() {
  return CURRENCIES.map((currency) => (
    <option key={currency} value={currency}>
      {currency}
    </option>
  ));
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
  const [payeeId, setPayeeId] = useState(payees[0]?.id ?? "");
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
      setTransferError(parsed.error.issues[0]?.message ?? "Vérifiez les informations saisies.");
      return;
    }

    const payee = payees.find((item) => item.id === parsed.data.payeeId);
    if (!payee) {
      setTransferError("Ce bénéficiaire n’est plus disponible.");
      return;
    }

    const safeMemo = sanitizeText(memo);
    const transaction: Transaction = {
      id: `tx-${crypto.randomUUID()}`,
      title: `Transfert vers ${payee.name}`,
      memo: safeMemo || "Transfert",
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
      toast.success("Transfert effectué.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Le transfert a échoué.");
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
      setPayeeError(parsed.error.issues[0]?.message ?? "Vérifiez les informations saisies.");
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
      toast.success("Bénéficiaire ajouté.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible d’ajouter le bénéficiaire.");
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
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Solde disponible</p>
              <p className={`mt-1.5 text-2xl font-semibold tracking-tight ${privacyMode ? "blur-sm select-none" : ""}`}>
                {formatAmount(availableBalance, user.currency)}
              </p>
            </div>
            <span className="rounded-full bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold">
              {user.currency}
            </span>
          </div>
          <p className="mt-3 border-t border-border/70 pt-2.5 text-xs text-muted-foreground">
            Taux indicatifs · conversion simulée
          </p>
        </section>

        <Card className="gap-0 rounded-2xl shadow-sm ring-1 ring-border/80 transition-shadow hover:shadow-md">
          <CardHeader className="gap-1 pb-3">
            <CardTitle className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gold/10">
                <Send className="size-4 text-gold" aria-hidden="true" />
              </span>
              <span>Nouveau transfert</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4 border-t border-border/70 pt-4" onSubmit={submitTransfer} noValidate>
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Bénéficiaire</span>
                <select
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={payeeId}
                  onChange={(event) => setPayeeId(event.target.value)}
                  aria-label="Bénéficiaire"
                >
                  <option value="">Choisir un bénéficiaire</option>
                  {payees.map((payee) => (
                    <option key={payee.id} value={payee.id}>
                      {payee.name} · {payee.currency}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-[1fr_6.5rem] gap-2">
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Vous envoyez</span>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    aria-label="Montant à envoyer"
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Devise</span>
                  <select
                    className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value as Currency)}
                    aria-label="Devise d’envoi"
                  >
                    {currencyOptions()}
                  </select>
                </label>
              </div>

              {selectedPayee && (
                <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3.5 py-3 text-sm ring-1 ring-border/50">
                  <span className="text-muted-foreground">Le bénéficiaire reçoit environ</span>
                  <span className="font-medium">
                    {formatAmount(receiveAmount, selectedPayee.currency)}
                  </span>
                </div>
              )}

              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Motif <span className="font-normal text-muted-foreground">(facultatif)</span></span>
                <Input
                  maxLength={120}
                  placeholder="Ex. Part du loyer"
                  value={memo}
                  onChange={(event) => setMemo(event.target.value)}
                />
              </label>

              {transferError && (
                <p className="text-sm text-destructive" role="alert">{transferError}</p>
              )}
              <Button className="h-10 w-full gap-2" type="submit" disabled={isSending || payees.length === 0}>
                {isSending ? <Clock3 className="size-4 animate-pulse" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
                {isSending ? "Envoi en cours…" : "Envoyer"}
              </Button>
              {payees.length === 0 && (
                <p className="text-center text-xs text-muted-foreground">
                  Ajoutez un bénéficiaire pour effectuer un transfert.
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        <Card size="sm" className="gap-0 rounded-2xl shadow-sm ring-1 ring-border/80 transition-shadow hover:shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gold/10">
                <ArrowLeftRight className="size-4 text-gold" aria-hidden="true" />
              </span>
              Convertisseur de devises
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 border-t border-border/70 pt-4">
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
              <label className="space-y-1.5 text-sm">
                <span className="text-xs text-muted-foreground">Montant</span>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={converterAmount}
                  onChange={(event) => setConverterAmount(event.target.value)}
                  aria-label="Montant à convertir"
                />
              </label>
              <label className="sr-only" htmlFor="converter-from">Devise de départ</label>
              <select
                id="converter-from"
                className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
                value={converterFrom}
                onChange={(event) => setConverterFrom(event.target.value as Currency)}
              >
                {currencyOptions()}
              </select>
            </div>
            <div className="flex items-center justify-center">
              <Button
                className="rounded-full shadow-sm"
                size="icon"
                type="button"
                variant="outline"
                onClick={switchConverterCurrencies}
                aria-label="Inverser les devises"
              >
                <ArrowLeftRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3.5 py-3 ring-1 ring-border/50">
              <span className="text-sm text-muted-foreground">Montant estimé</span>
              <div className="text-right">
                <label className="sr-only" htmlFor="converter-to">Devise d’arrivée</label>
                <select
                  id="converter-to"
                  className="mb-1 rounded border border-input bg-background px-1.5 py-0.5 text-xs"
                  value={converterTo}
                  onChange={(event) => setConverterTo(event.target.value as Currency)}
                >
                  {currencyOptions()}
                </select>
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
            <CardTitle className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gold/10">
                <Clock3 className="size-4 text-gold" aria-hidden="true" />
              </span>
              <span>Historique</span>
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                className="pl-9"
                placeholder="Rechercher une transaction"
                value={search}
                onChange={(event) => changeSearch(event.target.value)}
                aria-label="Rechercher dans l’historique"
              />
            </div>
          </CardHeader>
          <CardContent className="border-t border-border/70 pt-1">
            {visibleTransactions.length > 0 ? (
              <ul className="divide-y divide-border">
                {isSending && (
                  <li className="flex items-center gap-3 py-3" aria-label="Transfert en cours">
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
                      aria-label={`Afficher le reçu : ${transaction.title}`}
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                        {transaction.direction === "in"
                          ? <ArrowDownLeft className="size-4 text-emerald-600" aria-hidden="true" />
                          : <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{transaction.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {transaction.memo || transaction.category} · {new Date(transaction.date).toLocaleDateString()}
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
                {search ? "Aucune transaction trouvée." : "Aucune transaction pour le moment."}
              </p>
            )}
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">
                {filteredTransactions.length === 0
                  ? "0 résultat"
                  : `${historyPage * pageSize + 1}–${Math.min((historyPage + 1) * pageSize, filteredTransactions.length)} sur ${filteredTransactions.length}`}
              </p>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  type="button"
                  variant="ghost"
                  disabled={historyPage === 0}
                  onClick={() => setHistoryPage((page) => Math.max(0, page - 1))}
                  aria-label="Page précédente"
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <Button
                  size="icon"
                  type="button"
                  variant="ghost"
                  disabled={historyPage >= pageCount - 1}
                  onClick={() => setHistoryPage((page) => Math.min(pageCount - 1, page + 1))}
                  aria-label="Page suivante"
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-2xl shadow-sm ring-1 ring-border/80 transition-shadow hover:shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gold/10">
                <UserRound className="size-4 text-gold" aria-hidden="true" />
              </span>
              Bénéficiaires
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="divide-y divide-border/70 border-t border-border/70">
              {payees.map((payee) => (
                <li key={payee.id} className="flex items-center justify-between gap-3 px-1 py-3 transition-colors hover:bg-muted/40">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{payee.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{payee.accountNumber}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{payee.currency}</span>
                </li>
              ))}
              {isAddingPayee && (
                <li className="flex items-center gap-3 py-3" aria-label="Bénéficiaire en cours d’ajout">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-3 w-2/5" />
                    <Skeleton className="h-2.5 w-3/5" />
                  </div>
                  <Skeleton className="h-5 w-10 rounded-full" />
                </li>
              )}
              {payees.length === 0 && (
                <li className="py-3 text-sm text-muted-foreground">Aucun bénéficiaire enregistré.</li>
              )}
            </ul>
            <form className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-3.5" onSubmit={submitPayee} noValidate>
              <p className="flex items-center gap-2 text-sm font-medium">
                <Plus className="size-4 text-gold" aria-hidden="true" />
                Ajouter un bénéficiaire
              </p>
              <label className="block space-y-1.5 text-sm">
                <span className="text-xs text-muted-foreground">Nom</span>
                <Input
                  autoComplete="name"
                  maxLength={100}
                  placeholder="Nom du bénéficiaire"
                  value={payeeName}
                  onChange={(event) => setPayeeName(event.target.value)}
                />
              </label>
              <label className="block space-y-1.5 text-sm">
                <span className="text-xs text-muted-foreground">Numéro de compte</span>
                <Input
                  autoComplete="off"
                  maxLength={34}
                  placeholder="IBAN ou numéro de compte"
                  value={payeeAccount}
                  onChange={(event) => setPayeeAccount(event.target.value)}
                />
              </label>
              <label className="block space-y-1.5 text-sm">
                <span className="text-xs text-muted-foreground">Devise de réception</span>
                <select
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={payeeCurrency}
                  onChange={(event) => setPayeeCurrency(event.target.value as Currency)}
                  aria-label="Devise de réception du bénéficiaire"
                >
                  {currencyOptions()}
                </select>
              </label>
              {payeeError && <p className="text-sm text-destructive" role="alert">{payeeError}</p>}
              <Button className="w-full gap-2" type="submit" variant="outline" disabled={isAddingPayee}>
                {isAddingPayee ? <Clock3 className="size-4 animate-pulse" aria-hidden="true" /> : <Check className="size-4" aria-hidden="true" />}
                {isAddingPayee ? "Ajout en cours…" : "Enregistrer"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm print:static print:block print:bg-white print:p-0 print:backdrop-blur-none">
          <Card className="w-full max-w-sm shadow-xl print:max-w-none print:rounded-none print:shadow-none print:ring-0">
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-4 text-gold print:hidden" aria-hidden="true" />
                  Reçu de transfert
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">Horizon Finance</p>
              </div>
              <Button
                className="print:hidden"
                size="icon"
                type="button"
                variant="ghost"
                onClick={() => setReceipt(null)}
                aria-label="Fermer le reçu"
              >
                <X aria-hidden="true" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-y border-dashed border-border py-4 text-center">
                <p className="text-xs text-muted-foreground">Montant transféré</p>
                <p className="mt-1 text-2xl font-semibold">
                  {formatAmount(receipt.amount, receipt.currency)}
                </p>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Bénéficiaire</dt>
                  <dd className="text-right font-medium">{receipt.title.replace("Transfert vers ", "")}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Motif</dt>
                  <dd className="text-right">{receipt.memo}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Date</dt>
                  <dd className="text-right">{new Date(receipt.date).toLocaleString()}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Référence</dt>
                  <dd className="max-w-40 truncate text-right font-mono text-xs">{receipt.id}</dd>
                </div>
              </dl>
              <Button className="w-full gap-2 print:hidden" type="button" onClick={() => window.print()}>
                <Printer className="size-4" aria-hidden="true" />
                Imprimer le reçu
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
