import { useRoute } from "@react-navigation/native";
import { LoanOption } from "@/model/loan-option";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  ScrollView,
  Keyboard,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function LoanOptionsScreen() {
  const { t } = useTranslation();

  const route = useRoute();
  const { loanTypeId } = route.params as { loanTypeId: number };
  const db = useSQLiteContext();
  const [loanOptions, setLoanOptions] = useState<LoanOption[]>([]);
  const [editingOption, setEditingOption] = useState<LoanOption | null>(null);

  const [startAmount, setStartAmount] = useState("");
  const [smallInterestRate, setSmallInterestRate] = useState("");
  const [largeInterestRate, setLargeInterestRate] = useState("");

  useEffect(() => {
    async function fetchLoanOptions() {
      const result = await db.getAllAsync<LoanOption>(
        "SELECT * FROM loan_options WHERE loanTypeId = ? ORDER BY startAmount",
        [loanTypeId]
      );
      setLoanOptions(result);
    }
    fetchLoanOptions();
  }, [loanTypeId]);

  const addLoanOption = async () => {
    Keyboard.dismiss();

    const startAmountVal = parseFloat(startAmount);
    const smallInterestRateVal = parseFloat(smallInterestRate);
    const largeInterestRateVal = parseFloat(largeInterestRate);

    if (!startAmountVal || !smallInterestRateVal || !largeInterestRateVal) {
      return;
    }

    const statement = await db.prepareAsync(
      "INSERT INTO loan_options (loanTypeId, startAmount, smallInterestRate, largeInterestRate) VALUES ($loanTypeId, $startAmount, $smallInterestRate, $largeInterestRate)"
    );
    try {
      const result = await statement.executeAsync({
        $loanTypeId: loanTypeId,
        $startAmount: startAmountVal,
        $smallInterestRate: smallInterestRateVal,
        $largeInterestRate: largeInterestRateVal,
      });
      const opts = [
        ...loanOptions,
        {
          id: result.lastInsertRowId,
          loanTypeId,
          startAmount: startAmountVal,
          smallInterestRate: smallInterestRateVal,
          largeInterestRate: largeInterestRateVal,
        },
      ];
      opts.sort((a, b) => a.startAmount - b.startAmount);
      setLoanOptions(opts);

      setStartAmount("");
      setSmallInterestRate("");
      setLargeInterestRate("");
    } finally {
      await statement.finalizeAsync();
    }
  };

  const deleteLoanOption = async (id: number) => {
    const statement = await db.prepareAsync(
      "DELETE FROM loan_options WHERE id = $id"
    );
    try {
      await statement.executeAsync({ $id: id });
      setLoanOptions((old) => old.filter((option) => option.id !== id));
    } finally {
      await statement.finalizeAsync();
    }
  };

  const updateLoanOption = async () => {
    Keyboard.dismiss();

    if (!editingOption) return;

    const startAmountVal = parseFloat(startAmount);
    const smallInterestRateVal = parseFloat(smallInterestRate);
    const largeInterestRateVal = parseFloat(largeInterestRate);

    if (
      (startAmountVal != 0 && !startAmountVal) ||
      !smallInterestRateVal ||
      !largeInterestRateVal
    ) {
      return;
    }

    await db.runAsync(
      "UPDATE loan_options SET startAmount = ?, smallInterestRate = ?, largeInterestRate = ? WHERE id = ?",
      [
        startAmountVal,
        smallInterestRateVal,
        largeInterestRateVal,
        editingOption.id!,
      ]
    );

    setEditingOption({
      ...editingOption,
      startAmount: startAmountVal,
      smallInterestRate: smallInterestRateVal,
      largeInterestRate: largeInterestRateVal,
    });

    setLoanOptions((old) =>
      old.map((option) =>
        option.id === editingOption.id
          ? {
              ...editingOption,
              startAmount: startAmountVal,
              smallInterestRate: smallInterestRateVal,
              largeInterestRate: largeInterestRateVal,
            }
          : option
      )
    );
    setEditingOption(null);
    setStartAmount("");
    setSmallInterestRate("");
    setLargeInterestRate("");
  };

  const handleEdit = (option: LoanOption) => {
    setEditingOption(option);
    setStartAmount(option.startAmount.toString());
    setSmallInterestRate(option.smallInterestRate.toString());
    setLargeInterestRate(option.largeInterestRate.toString());
  };

  return (
    <LinearGradient
      colors={[Colors.light.headerBackground, Colors.light.secondary]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{t("loan_options.title")}</Text>

        {/* Loan Option List */}
        <View style={styles.loanList}>
          {loanOptions.map((option, idx) => (
            <View key={idx} style={styles.loanCard}>
              <View>
                <Text style={styles.loanType}>
                  {t("loan_options.card.amount")} {option.startAmount}
                </Text>
                <Text style={styles.loanRate}>
                  {t("loan_options.card.short_term")} {option.smallInterestRate}
                  %
                </Text>
                <Text style={styles.loanRate}>
                  {t("loan_options.card.long_term")} {option.largeInterestRate}%
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => handleEdit(option)}
                  style={styles.editButton}
                >
                  <AntDesign name="edit" size={24} color="blue" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteLoanOption(option.id!)}
                  style={styles.deleteButton}
                >
                  <AntDesign name="delete" size={24} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            {t("loan_options.label.start_amount")}
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={startAmount}
              onChangeText={setStartAmount}
              keyboardType="numeric"
              placeholder={t("loan_options.placeholder.start_amount")}
              placeholderTextColor={Colors.light.textLight}
              returnKeyType="next"
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            {t("loan_options.label.short-term")}
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={smallInterestRate}
              onChangeText={setSmallInterestRate}
              keyboardType="numeric"
              placeholder={t("loan_options.placeholder.short-term")}
              placeholderTextColor={Colors.light.textLight}
              returnKeyType="next"
              style={styles.input}
            />
            <Text style={styles.inputUnit}>%</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            {t("loan_options.label.long-term")}
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={largeInterestRate}
              onChangeText={setLargeInterestRate}
              keyboardType="numeric"
              placeholder={t("loan_options.placeholder.long-term")}
              placeholderTextColor={Colors.light.textLight}
              returnKeyType="done"
              style={styles.input}
            />
            <Text style={styles.inputUnit}>%</Text>
          </View>
        </View>

        {editingOption ? (
          <TouchableOpacity onPress={updateLoanOption} style={styles.button}>
            <Text style={styles.buttonText}>{t("loan_options.update")}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={addLoanOption} style={styles.button}>
            <Text style={styles.buttonText}>{t("loan_options.add")}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

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
  loanList: {
    marginBottom: 20,
  },
  loanCard: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  loanType: {
    color: Colors.light.headerText,
    fontWeight: "bold",
    fontSize: 18,
  },
  loanRate: {
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    marginRight: 10,
  },
  deleteButton: {},
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: Colors.light.headerText,
    marginBottom: 8,
    fontWeight: "600",
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
  input: {
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
  button: {
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    backgroundColor: Colors.light.buttonPrimary,
    marginTop: 10,
  },
  buttonText: {
    color: Colors.light.headerText,
    fontWeight: "bold",
    fontSize: 16,
    textTransform: "uppercase",
  },
});
