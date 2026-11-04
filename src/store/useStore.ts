import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seedCards, seedPayees, seedTransactions, seedUser } from "@/data/seed";
import type { Card, CardStatus, Payee, Transaction, User } from "@/types";

type State = {
  user: User;
  cards: Card[];
  transactions: Transaction[];
  payees: Payee[];
  privacyMode: boolean;
  locked: boolean;

  togglePrivacy: () => void;
  lock: () => void;
  unlock: () => void;

  setCardStatus: (id: string, status: CardStatus) => void;
  setCardLimit: (id: string, limit: number) => void;

  addTransaction: (tx: Transaction) => void;
  addPayee: (payee: Payee) => void;
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      user: seedUser,
      cards: seedCards,
      transactions: seedTransactions,
      payees: seedPayees,
      privacyMode: false,
      locked: false,

      togglePrivacy: () => set((s) => ({ privacyMode: !s.privacyMode })),
      lock: () => set({ locked: true }),
      unlock: () => set({ locked: false }),

      setCardStatus: (id, status) =>
        set((s) => ({ cards: s.cards.map((c) => (c.id === id ? { ...c, status } : c)) })),
      setCardLimit: (id, limit) =>
        set((s) => ({ cards: s.cards.map((c) => (c.id === id ? { ...c, limit } : c)) })),

      addTransaction: (tx) => set((s) => ({ transactions: [tx, ...s.transactions] })),
      addPayee: (payee) => set((s) => ({ payees: [payee, ...s.payees] })),
    }),
    { name: "horizon:store" }
  )
);