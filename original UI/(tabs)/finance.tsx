import { FinanceBoardContent } from "@/app/finance-board";

/** Finance is kept as a tab so cash, commitments, and lending are one tap away on phones. */
export default function FinanceTabScreen() {
  return <FinanceBoardContent embedded />;
}
