export interface LoanOption {
  id?: number;
  loanTypeId: number;
  startAmount: number;
  smallInterestRate: number;
  largeInterestRate: number;
}
