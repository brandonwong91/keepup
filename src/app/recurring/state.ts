import { create } from "zustand";

export interface Transaction {
  id: string;
  amount: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  title: string;
  amount: string;
  dueDate: Date;
  completedDate?: Date;
  paid?: boolean;
  tag?: string;
  updated?: boolean;
  transactions: Transaction[];
}

export interface UpdatingTag {
  id: string;
  tag: string;
}

export interface UpdatingTransaction {
  id: string;
  amount: string;
}

interface RecurringStore {
  payment: Payment;
  setPayment: (payment: Payment) => void;
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
  updatingTag: {
    id: string;
    tag: string;
  };
  setUpdatingTag: (updatingTag: UpdatingTag) => void;
  updatingTransaction: UpdatingTransaction;
  setUpdatingTransaction: (updatingTransaction: UpdatingTransaction) => void;
}

export const initPayment = {
  id: "",
  title: "",
  amount: "",
  dueDate: new Date(),
  tag: "",
  transactions: [],
  updated: false,
  updatingTransactionAmount: "",
};

export const useRecurringStore = create<RecurringStore>((set) => ({
  payment: initPayment,
  setPayment: (payment: Payment) => set({ payment }),
  payments: [],
  setPayments: (payments: Payment[]) => set({ payments }),
  updatingTag: {
    id: "",
    tag: "",
  },
  setUpdatingTag: (updatingTag: UpdatingTag) => set({ updatingTag }),
  updatingTransaction: {
    id: "",
    amount: "",
  },
  setUpdatingTransaction: (updatingTransaction: UpdatingTransaction) =>
    set({ updatingTransaction }),
}));
