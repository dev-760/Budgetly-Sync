export type Language = "en" | "fr";
export type TransactionKind = "income" | "expense";
export type BucketId = "cash" | "card";
export type FinanceFrequency = "monthly" | "weekly" | "yearly";
export type ReminderLeadDays = 0 | 1 | 3 | 7;

export type Bucket = { id: BucketId; name: string; balance: number; color: string; icon: string };
export type BucketTransfer = { id: string; from: BucketId; to: BucketId; amount: number; note?: string; createdAt: string };
export type Loan = { id: string; name: string; amount: number; dueDate?: string; active: boolean };
export type Liability = { id: string; name: string; amount: number; dueDate?: string; active: boolean };
export type Subscription = { id: string; name: string; amount: number; nextDueDate: string; frequency: FinanceFrequency; active: boolean };
export type Lend = { id: string; name: string; amount: number; from: BucketId; on: string; due?: string; settled: boolean };
export type BuiltInCategoryId =
  | "food"
  | "transport"
  | "housing"
  | "studies"
  | "phoneInternet"
  | "cafe"
  | "entertainment"
  | "shopping"
  | "health"
  | "travel"
  | "family"
  | "other"
  | "scholarship"
  | "allowance"
  | "partTime"
  | "internship";

/** Built-in categories plus device-local categories created in Settings. */
export type CategoryId = BuiltInCategoryId | string;

export type CustomExpenseCategory = {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
};

export type NotificationPreferences = {
  goalDeadlines: boolean;
  scheduledIncome: boolean;
  subscriptionDue: boolean;
  loanDue: boolean;
};

export type VisualThemeId = "ocean" | "violet" | "sage";

export type AppearancePreferences = {
  colorScheme: "light" | "dark";
  visualTheme: VisualThemeId;
};

export type Transaction = {
  id: string;
  kind: TransactionKind;
  amount: number;
  categoryId: CategoryId;
  title: string;
  date: string;
  paymentMethod: "cash" | "card" | "transfer";
  note?: string;
  isRecurring?: boolean;
};

export type BudgetCategory = {
  id: CategoryId;
  limit: number;
  color: string;
  icon: string;
};

export type RecurringItem = {
  id: string;
  kind: TransactionKind;
  amount: number;
  categoryId: CategoryId;
  title: string;
  nextDueDate: string;
  frequency: "monthly" | "weekly";
  reminderLeadDays?: ReminderLeadDays;
};

export type SavingsGoal = {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: string;
  reminderLeadDays?: ReminderLeadDays;
  monthlyContributionAmount?: number;
  lastAutoContributionMonth?: string;
  icon: string;
};

export type NotificationItem = {
  id: string;
  type: "warning" | "info" | "success";
  titleKey: string;
  bodyKey: string;
  createdAt: string;
  isRead: boolean;
};

export type AppSettings = {
  language: Language;
  currency: "MAD";
  notificationsEnabled: boolean;
  onboardingComplete: boolean;
  monthlySpendingLimit?: number;
  displayName?: string;
  profileImageUri?: string;
  customExpenseCategories: CustomExpenseCategory[];
  notificationPreferences: NotificationPreferences;
  appearance: AppearancePreferences;
  cigaretteTracker?: { monthlyLimit?: number; entries: { id: string; amount: number; date: string }[] };
};

export type FinanceSummary = {
  income: number;
  expenses: number;
  availableBalance: number;
  cashBalance: number;
  cardBalance: number;
  upcomingTotal: number;
  plannedBudgetCommitments: number;
  subscriptionTotal: number;
  loansReceivable: number;
  lentOutstanding: number;
  liabilities: number;
  netWorth: number;
  safeToSpend: number;
  dailySafeToSpend: number;
  daysRemaining: number;
};

export const categoryIds: BuiltInCategoryId[] = [
  "food",
  "transport",
  "studies",
  "phoneInternet",
  "cafe",
  "entertainment",
  "shopping",
  "health",
  "travel",
  "other",
];

export const incomeCategoryIds: BuiltInCategoryId[] = ["scholarship", "allowance", "family", "partTime", "internship", "other"];

export const translations = {
  en: {
    home: "Home",
    transactions: "Transactions",
    budget: "Budget",
    finance: "Finance",
    insights: "Insights",
    profile: "Profile",
    safeToSpend: "Safe to Spend",
    dailySafe: "Daily safe-to-spend",
    availableBalance: "Available balance",
    thisMonth: "This month",
    income: "Income",
    spending: "Spending",
    addExpense: "Add expense",
    addIncome: "Add income",
    recentTransactions: "Recent transactions",
    upcoming: "Upcoming expenses",
    viewAll: "View all",
    budgetHealth: "Budget health",
    remaining: "remaining",
    overBudget: "over budget",
    spendToday: "You can spend up to this amount today.",
    goodMorning: "Your money, in one glance",
    search: "Search transactions",
    all: "All",
    expense: "Expense",
    amount: "Amount",
    category: "Category",
    description: "Description",
    date: "Date",
    paymentMethod: "Payment method",
    optionalNote: "Optional note",
    saveExpense: "Save expense",
    saveIncome: "Save income",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    close: "Close",
    saved: "Saved",
    transactionSaved: "Your money plan has been updated.",
    monthlyPlan: "Monthly plan",
    spent: "Spent",
    setBudget: "Set budget",
    budgetLimit: "Monthly limit",
    updateBudget: "Update budget",
    insightsTitle: "Your money story",
    spendingByCategory: "Spending by category",
    incomeVsExpenses: "Income vs expenses",
    weeklySpending: "Weekly spending",
    balanceOverTime: "Balance over time",
    highestCategory: "Top spending category",
    goals: "Savings goals",
    addGoal: "Add goal",
    notifications: "Notifications",
    markAllRead: "Mark all read",
    noNotifications: "You're all caught up",
    language: "Language",
    english: "English",
    french: "Français",
    currency: "Currency",
    recurringItems: "Recurring items",
    preferences: "Preferences",
    clearLocalData: "Clear my local data",
    welcome: "Welcome to Budgetly",
    welcomeBody: "Let's organize your money in a few simple steps.",
    getStarted: "Get started",
    continue: "Continue",
    finish: "Create my budget",
    mainIncome: "What is your main income?",
    recurringExpenses: "Any regular payments?",
    categoriesSetup: "What do you usually spend on?",
    savingsGoal: "Choose a first goal",
    skip: "Skip for now",
    studentTip: "Built for student life in Morocco",
    notificationsEnabled: "Notifications",
    noTransactions: "No transactions yet",
    noTransactionsBody: "Add an income or expense to see it here.",
    filter: "Filter",
    clear: "Clear",
    cash: "Cash",
    card: "Card",
    transfer: "Transfer",
    recurring: "Monthly recurring",
    oneTime: "One-time",
    source: "Source",
    food: "Food",
    transport: "Transport",
    housing: "Housing",
    studies: "Studies",
    phoneInternet: "Phone & Internet",
    cafe: "Café",
    entertainment: "Entertainment",
    shopping: "Shopping",
    health: "Health",
    travel: "Travel",
    family: "Family support",
    other: "Other",
    scholarship: "Scholarship",
    allowance: "Family allowance",
    partTime: "Part-time job",
    internship: "Internship",
    foodInsight: "You spent more on food than last month.",
    remainingInsight: "You still have room to plan the rest of the month.",
    spendingInsight: "Your spending is steady this week.",
    budgetWarningTitle: "Food budget is nearly used",
    budgetWarningBody: "Keep an eye on food spending for the rest of the month.",
    upcomingTitle: "Upcoming payment",
    upcomingBody: "Your next regular payment is due soon.",
  },
  fr: {
    home: "Accueil",
    transactions: "Transactions",
    budget: "Budget",
    finance: "Finances",
    insights: "Statistiques",
    profile: "Profil",
    safeToSpend: "Reste à dépenser",
    dailySafe: "Reste à dépenser par jour",
    availableBalance: "Solde disponible",
    thisMonth: "Ce mois-ci",
    income: "Revenus",
    spending: "Dépenses",
    addExpense: "Ajouter une dépense",
    addIncome: "Ajouter un revenu",
    recentTransactions: "Transactions récentes",
    upcoming: "Dépenses à venir",
    viewAll: "Tout voir",
    budgetHealth: "État du budget",
    remaining: "restant",
    overBudget: "au-dessus du budget",
    spendToday: "Tu peux dépenser ce montant aujourd'hui.",
    goodMorning: "Ton argent, en un coup d'œil",
    search: "Rechercher une transaction",
    all: "Toutes",
    expense: "Dépense",
    amount: "Montant",
    category: "Catégorie",
    description: "Description",
    date: "Date",
    paymentMethod: "Moyen de paiement",
    optionalNote: "Note facultative",
    saveExpense: "Enregistrer la dépense",
    saveIncome: "Enregistrer le revenu",
    cancel: "Annuler",
    edit: "Modifier",
    delete: "Supprimer",
    close: "Fermer",
    saved: "Enregistré",
    transactionSaved: "Ton budget a été mis à jour.",
    monthlyPlan: "Budget mensuel",
    spent: "Dépensé",
    setBudget: "Définir le budget",
    budgetLimit: "Limite mensuelle",
    updateBudget: "Mettre à jour le budget",
    insightsTitle: "Ton aperçu financier",
    spendingByCategory: "Dépenses par catégorie",
    incomeVsExpenses: "Revenus et dépenses",
    weeklySpending: "Dépenses de la semaine",
    balanceOverTime: "Évolution du solde",
    highestCategory: "Catégorie principale",
    goals: "Objectifs d'épargne",
    addGoal: "Ajouter un objectif",
    notifications: "Notifications",
    markAllRead: "Tout marquer comme lu",
    noNotifications: "Tu es à jour",
    language: "Langue",
    english: "English",
    french: "Français",
    currency: "Devise",
    recurringItems: "Éléments récurrents",
    preferences: "Préférences",
    clearLocalData: "Effacer mes données locales",
    welcome: "Bienvenue sur Budgetly",
    welcomeBody: "Organisons ton argent en quelques étapes simples.",
    getStarted: "Commencer",
    continue: "Continuer",
    finish: "Créer mon budget",
    mainIncome: "Quelle est ta principale source de revenus ?",
    recurringExpenses: "As-tu des paiements réguliers ?",
    categoriesSetup: "Quelles sont tes dépenses habituelles ?",
    savingsGoal: "Choisis un premier objectif",
    skip: "Plus tard",
    studentTip: "Pensé pour la vie étudiante au Maroc",
    notificationsEnabled: "Notifications",
    noTransactions: "Aucune transaction pour le moment",
    noTransactionsBody: "Ajoute un revenu ou une dépense pour la voir ici.",
    filter: "Filtrer",
    clear: "Effacer",
    cash: "Espèces",
    card: "Carte",
    transfer: "Virement",
    recurring: "Récurrent mensuel",
    oneTime: "Ponctuel",
    source: "Source",
    food: "Nourriture",
    transport: "Transport",
    housing: "Logement",
    studies: "Études",
    phoneInternet: "Téléphone et Internet",
    cafe: "Café",
    entertainment: "Divertissement",
    shopping: "Shopping",
    health: "Santé",
    travel: "Voyage",
    family: "Aide familiale",
    other: "Autre",
    scholarship: "Bourse",
    allowance: "Allocation familiale",
    partTime: "Travail à temps partiel",
    internship: "Stage",
    foodInsight: "Tu as dépensé plus en nourriture que le mois dernier.",
    remainingInsight: "Il te reste de la marge pour le reste du mois.",
    spendingInsight: "Tes dépenses sont stables cette semaine.",
    budgetWarningTitle: "Le budget nourriture est presque atteint",
    budgetWarningBody: "Surveille tes dépenses nourriture pour le reste du mois.",
    upcomingTitle: "Paiement à venir",
    upcomingBody: "Ton prochain paiement régulier arrive bientôt.",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];

export const t = (language: Language, key: TranslationKey) => translations[language][key];

export const formatMoney = (amount: number, language: Language, withSign?: "positive" | "negative") => {
  const formatted = new Intl.NumberFormat(language === "fr" ? "fr-MA" : "en-US", {
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
  const sign = withSign === "positive" ? "+" : withSign === "negative" ? "−" : "";
  return `${sign}${formatted} DH`;
};

export const formatDate = (isoDate: string, language: Language) =>
  new Intl.DateTimeFormat(language === "fr" ? "fr-MA" : "en-US", {
    day: "numeric",
    month: "short",
  }).format(new Date(isoDate));

export const createEmptyTransactions = (): Transaction[] => [];

export const defaultBuckets: Bucket[] = [
  { id: "cash", name: "Cash", balance: 0, color: "#16A77B", icon: "payments" },
  { id: "card", name: "Card", balance: 0, color: "#1A56DB", icon: "credit-card" },
];

export const defaultLoans: Loan[] = [];
export const defaultLiabilities: Liability[] = [];
export const defaultSubscriptions: Subscription[] = [];
export const defaultLends: Lend[] = [];

export const defaultBudgets: BudgetCategory[] = [];

/** A category catalog used only to configure user-created budgets; it never seeds financial data. */
export const budgetCategoryOptions: Omit<BudgetCategory, "limit">[] = [
  { id: "food", color: "#16A77B", icon: "restaurant" },
  { id: "transport", color: "#2E62D6", icon: "directions-bus" },
  { id: "studies", color: "#DD8A24", icon: "school" },
  { id: "phoneInternet", color: "#1F9BB0", icon: "wifi" },
  { id: "cafe", color: "#A86D3D", icon: "local-cafe" },
  { id: "entertainment", color: "#D55A9B", icon: "movie" },
  { id: "shopping", color: "#A05CDD", icon: "shopping-bag" },
  { id: "health", color: "#DE5C5C", icon: "favorite" },
  { id: "travel", color: "#2688B5", icon: "flight" },
  { id: "other", color: "#68738A", icon: "more-horiz" },
];

export const defaultRecurring: RecurringItem[] = [];

export const defaultGoals: SavingsGoal[] = [];

export const defaultNotifications: NotificationItem[] = [];

export const getCategoryIcon = (id: CategoryId, customCategories: CustomExpenseCategory[] = []) => {
  const custom = customCategories.find((item) => item.id === id);
  if (custom) return custom.icon;
  const icons: Record<BuiltInCategoryId, string> = {
    food: "restaurant",
    transport: "directions-bus",
    housing: "home-work",
    studies: "school",
    phoneInternet: "smartphone",
    cafe: "local-cafe",
    entertainment: "celebration",
    shopping: "shopping-bag",
    health: "favorite",
    travel: "flight",
    family: "groups",
    other: "more-horiz",
    scholarship: "school",
    allowance: "family-restroom",
    partTime: "work",
    internship: "business-center",
  };
  return icons[id as BuiltInCategoryId] ?? "category";
};

export const calculateFinance = (transactions: Transaction[], budgets: BudgetCategory[], recurring: RecurringItem[], buckets: Bucket[] = [], loans: Loan[] = [], liabilities: Liability[] = [], subscriptions: Subscription[] = [], lends: Lend[] = []): FinanceSummary => {
  const income = transactions.filter((item) => item.kind === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenses = transactions.filter((item) => item.kind === "expense").reduce((sum, item) => sum + item.amount, 0);
  const availableBalance = income - expenses;
  const bucketTotal = buckets.reduce((sum, item) => sum + item.balance, 0);
  const cashBalance = buckets.find((item) => item.id === "cash")?.balance ?? 0;
  const cardBalance = buckets.find((item) => item.id === "card")?.balance ?? 0;
  const upcomingTotal = recurring.filter((item) => item.kind === "expense").reduce((sum, item) => sum + item.amount, 0);
  const subscriptionTotal = subscriptions.filter((item) => item.active).reduce((sum, item) => sum + item.amount, 0);
  const loansReceivable = loans.filter((item) => item.active).reduce((sum, item) => sum + item.amount, 0);
  const lentOutstanding = lends.filter((item) => !item.settled).reduce((sum, item) => sum + item.amount, 0);
  const liabilitiesTotal = liabilities.filter((item) => item.active).reduce((sum, item) => sum + item.amount, 0);
  const spendingByCategory = transactions
    .filter((item) => item.kind === "expense")
    .reduce<Record<string, number>>((result, item) => ({ ...result, [item.categoryId]: (result[item.categoryId] ?? 0) + item.amount }), {});
  const plannedBudgetCommitments = budgets.reduce((sum, item) => sum + Math.max(item.limit - (spendingByCategory[item.id] ?? 0), 0), 0);
  const safeToSpend = Math.max(availableBalance - upcomingTotal - plannedBudgetCommitments, 0);
  const now = new Date();
  const daysRemaining = Math.max(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate() + 1, 1);
  return {
    income,
    expenses,
    availableBalance: bucketTotal || availableBalance,
    cashBalance,
    cardBalance,
    upcomingTotal,
    subscriptionTotal,
    loansReceivable,
    lentOutstanding,
    liabilities: liabilitiesTotal,
    netWorth: (bucketTotal || availableBalance) + loansReceivable + lentOutstanding - liabilitiesTotal,
    plannedBudgetCommitments,
    safeToSpend,
    dailySafeToSpend: Math.floor(safeToSpend / daysRemaining),
    daysRemaining,
  };
};

export const isValidMoneyAmount = (value: number) => Number.isFinite(value) && value > 0 && value <= 1_000_000;

export const sanitizeFinanceText = (value: string, maxLength = 80) => value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, maxLength);