import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { calculateLoan } from "../util/loanCalculator";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "react-i18next";
import { LoanType } from "@/model/loan-type";
import { useSQLiteContext } from "expo-sqlite";
import PickerSelect from "react-native-picker-select";

const LoanCalculatorScreen = () => {
  const { t } = useTranslation();
  const db = useSQLiteContext();

  const [amount, setAmount] = useState("");
  const [months, setMonths] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [results, setResults] = useState<{
    monthlyPayment: string;
    totalPayment: string;
    totalInterest: string;
  } | null>(null);

  const monthsRef = useRef<TextInput>(null);
  const interestRateRef = useRef<TextInput>(null);

  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [selectedLoanType, setSelectedLoanType] = useState<LoanType | null>(
    null
  );

  useEffect(() => {
    async function setup() {
      const result = await db.getAllAsync<LoanType>("SELECT * FROM loan_types");
      setLoanTypes(result);
    }
    setup();
  }, []);

  useEffect(() => {
    if (selectedLoanType) {
      if (selectedLoanType) {
        setInterestRate(selectedLoanType.interestRate.toString());
      }
    }
  }, [selectedLoanType]);

  const calculate = () => {
    Keyboard.dismiss();

    const principal = parseFloat(amount);
    const rate = parseFloat(interestRate) / 100 / 12;
    const periods = parseInt(months);

    if (principal && rate && periods) {
      const result = calculateLoan(principal, rate, periods);
      setResults({
        monthlyPayment: result.monthlyPayment.toFixed(2),
        totalPayment: result.totalPayment.toFixed(2),
        totalInterest: result.totalInterest.toFixed(2),
      });
    }
  };

  const resetCalculator = () => {
    setAmount("");
    setMonths("");
    setInterestRate("");
    setResults(null);
  };

  const ResultRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={styles.resultValue}>{value} KM</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={[Colors.light.headerBackground, Colors.light.secondary]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{t("loan_calculator")}</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t("calculator.amount")}</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
              placeholder={t("calculator.placeholder.amount")}
              placeholderTextColor={Colors.light.textLight}
              returnKeyType="go"
              style={[styles.input, styles.inputWithUnit]}
              onSubmitEditing={() => monthsRef.current?.focus()}
            />
            <Text style={styles.inputUnit}>KM</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t("calculator.term")}</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={monthsRef}
              value={months}
              onChangeText={setMonths}
              keyboardType="number-pad"
              placeholder={t("calculator.placeholder.term")}
              placeholderTextColor={Colors.light.textLight}
              returnKeyType="go"
              style={[styles.input, styles.inputWithUnit]}
              onSubmitEditing={() => interestRateRef.current?.focus()}
            />
            <Text style={styles.inputUnit}>{t("calculator.months")}</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t("calculator.loan_type")}</Text>
          <View style={styles.selectWrapper}>
            <PickerSelect
              onValueChange={(val) => setSelectedLoanType(val)}
              items={loanTypes.map((type) => ({
                label: type.type,
                value: type,
              }))}
              placeholder={{
                label: t("calculator.placeholder.loan_type"),
                value: null,
              }}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t("calculator.interest")}</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={interestRateRef}
              value={interestRate}
              onChangeText={setInterestRate}
              keyboardType="number-pad"
              placeholder={t("calculator.placeholder.interest")}
              placeholderTextColor={Colors.light.textLight}
              returnKeyType="done"
              style={[styles.input, styles.inputWithUnit]}
            />
            <Text style={styles.inputUnit}>%</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={calculate}
            style={[styles.calculatorButton, styles.calculateButton]}
          >
            <Text style={styles.buttonText}>{t("calculator.calculate")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={resetCalculator}
            style={[styles.calculatorButton, styles.resetButton]}
          >
            <Text style={styles.buttonText}>{t("calculator.reset")}</Text>
          </TouchableOpacity>
        </View>

        {results && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>{t("calculator.details")}</Text>
            <ResultRow
              label={t("calculator.monthly_payment")}
              value={results.monthlyPayment}
            />
            <ResultRow
              label={t("calculator.total_payment")}
              value={results.totalPayment}
            />
            <ResultRow
              label={t("calculator.total_interest")}
              value={results.totalInterest}
            />
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.headerText,
    textAlign: "center",
    marginBottom: 30,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: Colors.light.headerText,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    backgroundColor: Colors.light.inputBackground,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: 10,
    padding: 15,
    color: Colors.light.text,
    fontSize: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.inputBackground,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  inputWithUnit: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: Colors.light.text,
  },
  inputUnit: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "bold",
  },
  selectWrapper: {
    backgroundColor: Colors.light.inputBackground,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  calculatorButton: {
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    width: "48%",
  },
  calculateButton: {
    backgroundColor: Colors.light.buttonPrimary,
  },
  resetButton: {
    backgroundColor: Colors.light.buttonSecondary,
  },
  buttonText: {
    color: Colors.light.headerText,
    fontWeight: "bold",
  },
  resultsContainer: {
    marginTop: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  resultsTitle: {
    color: Colors.light.headerText,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    textTransform: "uppercase",
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  resultLabel: {
    color: Colors.light.headerText,
    fontWeight: "600",
    fontSize: 16,
  },
  resultValue: {
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 30,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
});

export default LoanCalculatorScreen;
