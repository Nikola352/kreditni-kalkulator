export interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
}

export function calculateLoan(
  principal: number,
  rate: number,
  periods: number
): LoanResult {
  const monthlyPaymentCalc =
    (principal * (rate * Math.pow(1 + rate, periods))) /
    (Math.pow(1 + rate, periods) - 1);
  const totalPaymentCalc = monthlyPaymentCalc * periods;
  const totalInterestCalc = totalPaymentCalc - principal;

  return {
    monthlyPayment: monthlyPaymentCalc,
    totalPayment: totalPaymentCalc,
    totalInterest: totalInterestCalc,
  };
}
