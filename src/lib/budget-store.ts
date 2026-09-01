"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  AppSettings,
  Transaction,
  BudgetCategory,
  RecurringItem,
  SavingsGoal,
  NotificationItem,
  Bucket,
  BucketTransfer,
  Loan,
  Liability,
  Subscription,
  Lend,
  TransactionKind,
  CategoryId,
  CustomExpenseCategory,
  Language,
  AppearancePreferences,
  NotificationPreferences,
  defaultBuckets,
  defaultBudgets,
  defaultRecurring,
  defaultGoals,
  defaultNotifications,
  defaultLoans,
  defaultLiabilities,
  defaultSubscriptions,
  defaultLends,
  budgetCategoryOptions,
  isValidMoneyAmount,
  sanitizeFinanceText,
  calculateFinance,
  translations,
  type TranslationKey,
  t,
  formatMoney,
  formatDate,
  getCategoryIcon,
  createEmptyTransactions,
} from './budget-data';
import { storage } from './storage';

type BudgetData = {
  settings: AppSettings;
  transactions: Transaction[];
  budgets: BudgetCategory[];
  recurring: RecurringItem[];
  goals: SavingsGoal[];
  notifications: NotificationItem[];
  buckets: Bucket[];
  transfers: BucketTransfer[];
  loans: Loan[];
  liabilities: Liability[];
  subscriptions: Subscription[];
  lends: Lend[];
};

type AddTransactionInput = {
  kind: TransactionKind;
  amount: number;
  categoryId: CategoryId;
  title: string;
  date: string;
  paymentMethod: Transaction["paymentMethod"];
  note?: string;
  isRecurring?: boolean;
};

type BudgetActions = {
  hydrated: boolean;
  initialize: () => Promise<void>;
  setLanguage: (language: Language) => void;
  setAppearancePreferences: (preferences: Partial<AppearancePreferences>) => void;
  addCustomExpenseCategory: (category: Pick<CustomExpenseCategory, "name" | "color" | "icon">) => boolean;
  updateCustomExpenseCategory: (id: string, category: Pick<CustomExpenseCategory, "name" | "color" | "icon">) => boolean;
  removeCustomExpenseCategory: (id: string) => boolean;
  setNotificationPreferences: (preferences: Partial<NotificationPreferences>) => void;
  setMonthlySpendingLimit: (amount?: number) => boolean;
  updateProfile: (profile: { displayName?: string; profileImageUri?: string }) => void;
  setCigaretteMonthlyLimit: (amount?: number) => boolean;
  addCigaretteSpend: (amount: number, date: string) => boolean;
  completeOnboarding: () => void;
  addTransaction: (input: AddTransactionInput) => void;
  updateTransaction: (id: string, input: AddTransactionInput) => void;
  deleteTransaction: (id: string) => void;
  setBudget: (id: CategoryId, amount: number) => void;
  addGoal: (goal: Omit<SavingsGoal, "id">) => void;
  updateGoal: (id: string, goal: Omit<SavingsGoal, "id" | "savedAmount">) => boolean;
  deleteGoal: (id: string) => void;
  addGoalContribution: (id: string, amount: number) => void;
  toggleNotifications: () => void;
  markNotificationsRead: () => void;
  clearLocalData: () => void;
  logout: () => void;
  upsertTransfer: (input: Omit<BucketTransfer, "id" | "createdAt"> & { id?: string }) => boolean;
  removeTransfer: (id: string) => void;
  upsertLoan: (loan: Omit<Loan, "id"> & { id?: string }) => boolean;
  removeLoan: (id: string) => void;
  upsertSubscription: (subscription: Omit<Subscription, "id"> & { id?: string }) => boolean;
  removeSubscription: (id: string) => void;
  upsertRecurringIncome: (income: Omit<RecurringItem, "id" | "kind" | "categoryId"> & { id?: string }) => boolean;
  removeRecurringIncome: (id: string) => void;
  upsertLend: (lend: Omit<Lend, "id" | "settled"> & { id?: string; settled?: boolean }) => boolean;
  settleLend: (id: string) => void;
  removeLend: (id: string) => void;
  syncToCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;
};

type BudgetStore = BudgetData & BudgetActions;

const createDefaultData = (): BudgetData => ({
  settings: {
    language: "en",
    currency: "MAD",
    notificationsEnabled: true,
    onboardingComplete: false,
    monthlySpendingLimit: undefined,
    displayName: undefined,
    profileImageUri: undefined,
    customExpenseCategories: [],
    notificationPreferences: { goalDeadlines: true, scheduledIncome: true, subscriptionDue: true, loanDue: true },
    appearance: { colorScheme: "light", visualTheme: "ocean" },
    cigaretteTracker: { monthlyLimit: undefined, entries: [] },
  },
  transactions: createEmptyTransactions(),
  budgets: defaultBudgets,
  recurring: defaultRecurring,
  goals: defaultGoals,
  notifications: defaultNotifications,
  buckets: defaultBuckets,
  transfers: [],
  loans: defaultLoans,
  liabilities: defaultLiabilities,
  subscriptions: defaultSubscriptions,
  lends: defaultLends,
});

const applyTransactionToBuckets = (buckets: Bucket[], transaction: Transaction, direction: 1 | -1) => {
  if (transaction.paymentMethod !== "cash" && transaction.paymentMethod !== "card") return buckets;
  const delta = (transaction.kind === "income" ? transaction.amount : -transaction.amount) * direction;
  return buckets.map((bucket) => 
    bucket.id === transaction.paymentMethod 
      ? { ...bucket, balance: Math.round((bucket.balance + delta) * 100) / 100 } 
      : bucket
  );
};

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set, get) => ({
      ...createDefaultData(),
      hydrated: false,
      
      initialize: async () => {
        const jwt = storage.getItem('budgetly_jwt');
        if (jwt) {
          try {
            await get().loadFromCloud();
          } catch (error) {
            console.error('Cloud hydration failed:', error);
          }
        }
        set({ hydrated: true });
      },

      setLanguage: (language) => set((state) => ({ settings: { ...state.settings, language } })),
      
      setAppearancePreferences: (preferences) => 
        set((state) => ({ settings: { ...state.settings, appearance: { ...state.settings.appearance, ...preferences } } })),
      
      addCustomExpenseCategory: (category) => {
        const name = sanitizeFinanceText(category.name, 24);
        if (!name || !/^#[0-9A-Fa-f]{6}$/.test(category.color) || !sanitizeFinanceText(category.icon, 40)) return false;
        set((state) => ({ 
          settings: { 
            ...state.settings, 
            customExpenseCategories: [...(state.settings.customExpenseCategories ?? []), { 
              id: `custom-${Date.now()}`, 
              name, 
              color: category.color, 
              icon: sanitizeFinanceText(category.icon, 40), 
              createdAt: new Date().toISOString() 
            }].slice(0, 30) 
          } 
        }));
        return true;
      },

      updateCustomExpenseCategory: (id, category) => {
        const name = sanitizeFinanceText(category.name, 24);
        const state = get();
        if (!name || !/^#[0-9A-Fa-f]{6}$/.test(category.color) || !sanitizeFinanceText(category.icon, 40) || 
            !state.settings.customExpenseCategories.some((item) => item.id === id)) return false;
        set((state) => ({ 
          settings: { 
            ...state.settings, 
            customExpenseCategories: state.settings.customExpenseCategories.map((item) => 
              item.id === id ? { ...item, name, color: category.color, icon: sanitizeFinanceText(category.icon, 40) } : item
            ) 
          } 
        }));
        return true;
      },

      removeCustomExpenseCategory: (id) => {
        const state = get();
        const inUse = state.transactions.some((item) => item.categoryId === id) || 
                     state.budgets.some((item) => item.id === id) || 
                     state.recurring.some((item) => item.categoryId === id);
        if (inUse || !state.settings.customExpenseCategories.some((item) => item.id === id)) return false;
        set((state) => ({ 
          settings: { 
            ...state.settings, 
            customExpenseCategories: state.settings.customExpenseCategories.filter((item) => item.id !== id) 
          } 
        }));
        return true;
      },

      setNotificationPreferences: (preferences) => 
        set((state) => ({ settings: { ...state.settings, notificationPreferences: { ...state.settings.notificationPreferences, ...preferences } } })),
      
      setMonthlySpendingLimit: (amount) => {
        if (amount !== undefined && !isValidMoneyAmount(amount)) return false;
        set((state) => ({ settings: { ...state.settings, monthlySpendingLimit: amount } }));
        return true;
      },

      updateProfile: (profile) => 
        set((state) => ({ 
          settings: { 
            ...state.settings, 
            displayName: profile.displayName !== undefined ? sanitizeFinanceText(profile.displayName) : state.settings.displayName, 
            profileImageUri: profile.profileImageUri !== undefined ? profile.profileImageUri : state.settings.profileImageUri 
          } 
        })),
      
      setCigaretteMonthlyLimit: (amount) => {
        if (amount !== undefined && !isValidMoneyAmount(amount)) return false;
        set((state) => ({ 
          settings: { 
            ...state.settings, 
            cigaretteTracker: { entries: state.settings.cigaretteTracker?.entries ?? [], monthlyLimit: amount } 
          } 
        }));
        return true;
      },

      addCigaretteSpend: (amount, date) => {
        if (!isValidMoneyAmount(amount) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
        set((state) => ({ 
          settings: { 
            ...state.settings, 
            cigaretteTracker: { 
              monthlyLimit: state.settings.cigaretteTracker?.monthlyLimit, 
              entries: [{ id: `cigarette-${Date.now()}`, amount, date }, ...(state.settings.cigaretteTracker?.entries ?? [])].slice(0, 200) 
            } 
          } 
        }));
        return true;
      },

      completeOnboarding: () => set((state) => ({ settings: { ...state.settings, onboardingComplete: true } })),
      
      addTransaction: (input) => set((state) => {
        if (!isValidMoneyAmount(input.amount) || !sanitizeFinanceText(input.title)) return state;
        const transaction = { 
          ...input, 
          title: sanitizeFinanceText(input.title), 
          note: input.note ? sanitizeFinanceText(input.note, 160) : undefined, 
          id: `txn-${Date.now()}` 
        };
        return { 
          transactions: [transaction, ...state.transactions].slice(0, 500), 
          buckets: applyTransactionToBuckets(state.buckets, transaction, 1) 
        };
      }),

      updateTransaction: (id, input) => set((state) => {
        if (!isValidMoneyAmount(input.amount) || !sanitizeFinanceText(input.title)) return state;
        const previous = state.transactions.find((item) => item.id === id);
        if (!previous) return state;
        const transaction = { 
          ...input, 
          title: sanitizeFinanceText(input.title), 
          note: input.note ? sanitizeFinanceText(input.note, 160) : undefined, 
          id 
        };
        return { 
          transactions: state.transactions.map((item) => item.id === id ? transaction : item), 
          buckets: applyTransactionToBuckets(applyTransactionToBuckets(state.buckets, previous, -1), transaction, 1) 
        };
      }),

      deleteTransaction: (id) => set((state) => {
        const previous = state.transactions.find((item) => item.id === id);
        return previous ? { 
          transactions: state.transactions.filter((item) => item.id !== id), 
          buckets: applyTransactionToBuckets(state.buckets, previous, -1) 
        } : state;
      }),

      setBudget: (id, amount) => set((state) => {
        if (!isValidMoneyAmount(amount)) return state;
        const exists = state.budgets.some((item) => item.id === id);
        const category = budgetCategoryOptions.find((item) => item.id === id) ?? 
                        state.settings.customExpenseCategories.find((item) => item.id === id) ?? 
                        defaultBudgets.find((item) => item.id === id) ?? 
                        { id, color: "#1A56DB", icon: "wallet" };
        return { 
          budgets: exists 
            ? state.budgets.map((item) => item.id === id ? { ...item, limit: amount } : item) 
            : [...state.budgets, { ...category, limit: amount }] 
        };
      }),

      addGoal: (goal) => set((state) => {
        if (!isValidMoneyAmount(goal.targetAmount) || goal.savedAmount < 0 || !sanitizeFinanceText(goal.title) || 
            (goal.monthlyContributionAmount !== undefined && !isValidMoneyAmount(goal.monthlyContributionAmount))) return state;
        const monthlyContributionAmount = goal.monthlyContributionAmount;
        return { 
          goals: [...state.goals, { 
            ...goal, 
            title: sanitizeFinanceText(goal.title), 
            savedAmount: Math.min(goal.savedAmount, goal.targetAmount), 
            monthlyContributionAmount, 
            id: `goal-${Date.now()}` 
          }] 
        };
      }),

      updateGoal: (id, goal) => {
        if (!isValidMoneyAmount(goal.targetAmount) || !sanitizeFinanceText(goal.title) || 
            (goal.monthlyContributionAmount !== undefined && !isValidMoneyAmount(goal.monthlyContributionAmount))) return false;
        let updated = false;
        set((state) => ({ 
          goals: state.goals.map((item) => {
            if (item.id !== id) return item;
            updated = true;
            return { ...item, ...goal, title: sanitizeFinanceText(goal.title), savedAmount: Math.min(item.savedAmount, goal.targetAmount) };
          }) 
        }));
        return updated;
      },

      deleteGoal: (id) => set((state) => ({ goals: state.goals.filter((item) => item.id !== id) })),
      
      addGoalContribution: (id, amount) => set((state) => 
        !isValidMoneyAmount(amount) 
          ? state 
          : ({ goals: state.goals.map((item) => item.id === id ? { ...item, savedAmount: Math.min(item.targetAmount, item.savedAmount + amount) } : item) })),
      
      toggleNotifications: () => set((state) => ({ settings: { ...state.settings, notificationsEnabled: !state.settings.notificationsEnabled } })),
      
      markNotificationsRead: () => set((state) => ({ notifications: state.notifications.map((item) => ({ ...item, isRead: true })) })),
      
      clearLocalData: () => set(() => ({ ...createDefaultData() })),

      logout: () => {
        storage.removeItem('budgetly_jwt');
        set(() => ({ ...createDefaultData() }));
      },

      upsertTransfer: (input) => {
        const state = get();
        if (!isValidMoneyAmount(input.amount)) return false;
        const transfer = { 
          ...input, 
          id: input.id || `transfer-${Date.now()}`, 
          createdAt: new Date().toISOString() 
        };
        set((state) => ({ 
          transfers: input.id 
            ? state.transfers.map((item) => item.id === input.id ? transfer : item) 
            : [...state.transfers, transfer] 
        }));
        return true;
      },

      removeTransfer: (id) => set((state) => ({ transfers: state.transfers.filter((item) => item.id !== id) })),

      upsertLoan: (loan) => {
        if (!isValidMoneyAmount(loan.amount)) return false;
        const newLoan = { ...loan, id: loan.id || `loan-${Date.now()}` };
        set((state) => ({ 
          loans: loan.id 
            ? state.loans.map((item) => item.id === loan.id ? newLoan : item) 
            : [...state.loans, newLoan] 
        }));
        return true;
      },

      removeLoan: (id) => set((state) => ({ loans: state.loans.filter((item) => item.id !== id) })),

      upsertSubscription: (subscription) => {
        if (!isValidMoneyAmount(subscription.amount)) return false;
        const newSubscription = { ...subscription, id: subscription.id || `sub-${Date.now()}` };
        set((state) => ({ 
          subscriptions: subscription.id 
            ? state.subscriptions.map((item) => item.id === subscription.id ? newSubscription : item) 
            : [...state.subscriptions, newSubscription] 
        }));
        return true;
      },

      removeSubscription: (id) => set((state) => ({ subscriptions: state.subscriptions.filter((item) => item.id !== id) })),

      upsertRecurringIncome: (income) => {
        if (!isValidMoneyAmount(income.amount)) return false;
        const newIncome = { ...income, id: income.id || `recurring-${Date.now()}`, kind: "income" as const, categoryId: "scholarship" as const };
        set((state) => ({ 
          recurring: income.id 
            ? state.recurring.map((item) => item.id === income.id ? newIncome : item) 
            : [...state.recurring, newIncome] 
        }));
        return true;
      },

      removeRecurringIncome: (id) => set((state) => ({ recurring: state.recurring.filter((item) => item.id !== id) })),

      upsertLend: (lend) => {
        if (!isValidMoneyAmount(lend.amount)) return false;
        const newLend = { ...lend, id: lend.id || `lend-${Date.now()}`, settled: lend.settled || false };
        set((state) => ({ 
          lends: lend.id 
            ? state.lends.map((item) => item.id === lend.id ? newLend : item) 
            : [...state.lends, newLend] 
        }));
        return true;
      },

      settleLend: (id) => set((state) => ({ lends: state.lends.map((item) => item.id === id ? { ...item, settled: true } : item) })),
      
      removeLend: (id) => set((state) => ({ lends: state.lends.filter((item) => item.id !== id) })),

      syncToCloud: async () => {
        const jwt = storage.getItem('budgetly_jwt');
        if (!jwt) return;

        const state = get();
        const data = {
          settings: state.settings,
          transactions: state.transactions,
          budgets: state.budgets,
          recurring: state.recurring,
          goals: state.goals,
          notifications: state.notifications,
          buckets: state.buckets,
          transfers: state.transfers,
          loans: state.loans,
          liabilities: state.liabilities,
          subscriptions: state.subscriptions,
          lends: state.lends,
        };

        try {
          await fetch('/api/sync', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({ data })
          });
        } catch (error) {
          console.error('Sync to cloud failed:', error);
        }
      },

      loadFromCloud: async () => {
        const jwt = storage.getItem('budgetly_jwt');
        if (!jwt) return;

        try {
          const res = await fetch('/api/sync', {
            headers: { 'Authorization': `Bearer ${jwt}` }
          });
          
          if (res.ok) {
            const { data } = await res.json();
            if (data && Object.keys(data).length > 0) {
              set(data as BudgetData);
            }
          } else if (res.status === 401) {
            storage.removeItem('budgetly_jwt');
          }
        } catch (error) {
          console.error('Load from cloud failed:', error);
        }
      },
    }),
    {
      name: 'budgetly-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.initialize();
      },
    }
  )
);

// Helper hook for computed values
export const useBudget = () => {
  const store = useBudgetStore();
  const language = store.settings.language;
  
  return {
    ...store,
    t: (key: TranslationKey) => t(language, key),
    finance: calculateFinance(
      store.transactions,
      store.budgets,
      store.recurring,
      store.buckets,
      store.loans,
      store.liabilities,
      store.subscriptions,
      store.lends
    ),
    categoryName: (id: CategoryId) => {
      const custom = store.settings.customExpenseCategories.find(c => c.id === id);
      if (custom) return custom.name;
      return t(language, id as TranslationKey);
    },
  };
};