import { create } from "zustand";

export interface Payment {
  id: string;
  title: string;
  amount: string;
  dueDate: Date;
  completedDate?: Date;
  paid?: boolean;
  tag?: string;
}

interface RecurringStore {
  payment: Payment;
  setPayment: (payment: Payment) => void;
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
}

export const initPayment = {
  id: "",
  title: "",
  amount: "",
  dueDate: new Date(),
  tag: "",
};

export const useRecurringStore = create<RecurringStore>((set) => ({
  payment: initPayment,
  setPayment: (payment: Payment) => set({ payment }),
  payments: [],
  setPayments: (payments: Payment[]) => set({ payments }),
}));
