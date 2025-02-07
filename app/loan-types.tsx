import { LoanType } from "@/model/loan-type";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { AntDesign } from "@expo/vector-icons";

const LoanTypesScreen = () => {
  const { t } = useTranslation();
  const db = useSQLiteContext();
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);

  useEffect(() => {
    async function setup() {
      const result = await db.getAllAsync<LoanType>("SELECT * FROM loan_types");
      setLoanTypes(result);
    }
    setup();
  }, []);

  const [type, setType] = useState("");
  const [interestRate, setInterestRate] = useState("");

  const interestRateRef = useRef<TextInput>(null);

  const addLoanType = async () => {
    const rate = parseFloat(interestRate);
    if (!type || isNaN(rate)) return;

    const statement = await db.prepareAsync(
      "INSERT INTO loan_types (type, interestRate) VALUES ($type, $interestRate)"
    );
    try {
      const result = await statement.executeAsync({
        $type: type,
        $interestRate: rate,
      });

      setLoanTypes((old) => [
        ...old,
        { id: result.lastInsertRowId, type, interestRate: rate },
      ]);
      setType("");
      setInterestRate("");
    } finally {
      await statement.finalizeAsync();
    }
  };

  const deleteLoanType = async (id: number) => {
    const statement = await db.prepareAsync(
      "DELETE FROM loan_types WHERE id = $id"
    );
    try {
      await statement.executeAsync({ $id: id });

      setLoanTypes((old) => old.filter((loanType) => loanType.id !== id));
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
        <Text style={styles.title}>{t("loan_types.title")}</Text>

        {/* Loan Type List */}
        <View style={styles.loanList}>
          {loanTypes.map((loanType) => (
            <View key={loanType.id} style={styles.loanCard}>
              <View>
                <Text style={styles.loanType}>{loanType.type}</Text>
                <Text style={styles.loanRate}>{loanType.interestRate}%</Text>
              </View>
              <TouchableOpacity onPress={() => deleteLoanType(loanType.id)}>
                <AntDesign name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            {t("loan_types.placeholder.type")}
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={type}
              onChangeText={setType}
              keyboardType="default"
              placeholder={t("loan_types.placeholder.type")}
              placeholderTextColor={Colors.light.textLight}
              returnKeyType="go"
              style={styles.input}
              onSubmitEditing={() => interestRateRef.current?.focus()}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            {t("loan_types.placeholder.interest")}
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={interestRateRef}
              value={interestRate}
              onChangeText={setInterestRate}
              keyboardType="decimal-pad"
              placeholder={t("loan_types.placeholder.interest")}
              placeholderTextColor={Colors.light.textLight}
              returnKeyType="done"
              style={styles.input}
            />
            <Text style={styles.inputUnit}>%</Text>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity onPress={addLoanType} style={styles.button}>
          <Text style={styles.buttonText}>{t("loan_types.add")}</Text>
        </TouchableOpacity>
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
    fontSize: 20,
  },
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

export default LoanTypesScreen;
