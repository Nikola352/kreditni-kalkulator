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

export default function LoanOptionsScreen() {
  const route = useRoute();
  const { loanTypeId } = route.params as { loanTypeId: number };
  const db = useSQLiteContext();
  const [loanOptions, setLoanOptions] = useState<LoanOption[]>([]);
  const [newOption, setNewOption] = useState<LoanOption>({
    startAmount: 0,
    smallInterestRate: 0,
    largeInterestRate: 0,
    loanTypeId: loanTypeId,
  });

  useEffect(() => {
    async function fetchLoanOptions() {
      const result = await db.getAllAsync<LoanOption>(
        "SELECT * FROM loan_options WHERE loanTypeId = ?",
        [loanTypeId]
      );
      setLoanOptions(result);
    }
    fetchLoanOptions();
  }, [loanTypeId]);

  const addLoanOption = async () => {
    Keyboard.dismiss();

    await db.runAsync(
      "INSERT INTO loan_options (loanTypeId, startAmount, smallInterestRate, largeInterestRate) VALUES (?, ?, ?, ?)",
      [
        loanTypeId,
        newOption.startAmount,
        newOption.smallInterestRate,
        newOption.largeInterestRate,
      ]
    );
    setLoanOptions([...loanOptions, { ...newOption, loanTypeId }]);
    setNewOption({
      startAmount: 0,
      smallInterestRate: 0,
      largeInterestRate: 0,
      loanTypeId,
    });
  };

  const handleNumericInput = (text: string, field: keyof LoanOption) => {
    const numericValue = parseFloat(text);
    if (!isNaN(numericValue)) {
      setNewOption({ ...newOption, [field]: numericValue });
    } else {
      setNewOption({ ...newOption, [field]: 0 });
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

  return (
    <LinearGradient
      colors={[Colors.light.headerBackground, Colors.light.secondary]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Loan Options</Text>

        {/* Loan Option List */}
        <View style={styles.loanList}>
          {loanOptions.map((option, idx) => (
            <View key={idx} style={styles.loanCard}>
              <View>
                <Text style={styles.loanType}>
                  Amount ≥ {option.startAmount}
                </Text>
                <Text style={styles.loanRate}>
                  Short Term: {option.smallInterestRate}%
                </Text>
                <Text style={styles.loanRate}>
                  Long Term: {option.largeInterestRate}%
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => deleteLoanOption(option.id!)}
                style={styles.deleteButton}
              >
                <AntDesign name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Start Amount</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={newOption.startAmount.toString()}
              onChangeText={(text) => handleNumericInput(text, "startAmount")}
              keyboardType="numeric"
              placeholder="Start Amount"
              placeholderTextColor={Colors.light.textLight}
              returnKeyType="next"
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Short-Term Interest Rate</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={newOption.smallInterestRate.toString()}
              onChangeText={(text) =>
                handleNumericInput(text, "smallInterestRate")
              }
              keyboardType="numeric"
              placeholder="Short-Term Interest Rate"
              placeholderTextColor={Colors.light.textLight}
              returnKeyType="next"
              style={styles.input}
            />
            <Text style={styles.inputUnit}>%</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Long-Term Interest Rate</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={newOption.largeInterestRate.toString()}
              onChangeText={(text) =>
                handleNumericInput(text, "largeInterestRate")
              }
              keyboardType="numeric"
              placeholder="Long-Term Interest Rate"
              placeholderTextColor={Colors.light.textLight}
              returnKeyType="done"
              style={styles.input}
            />
            <Text style={styles.inputUnit}>%</Text>
          </View>
        </View>

        <TouchableOpacity onPress={addLoanOption} style={styles.button}>
          <Text style={styles.buttonText}>Add Option</Text>
        </TouchableOpacity>
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
