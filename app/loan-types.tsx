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
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

const LoanTypesScreen = () => {
  const { t } = useTranslation();
  const db = useSQLiteContext();
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

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

  const addOrUpdateLoanType = async () => {
    Keyboard.dismiss();

    const rate = parseFloat(interestRate);
    if (!type || isNaN(rate)) return;

    if (editingId === null) {
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
      } finally {
        await statement.finalizeAsync();
      }
    } else {
      const statement = await db.prepareAsync(
        "UPDATE loan_types SET type = $type, interestRate = $interestRate WHERE id = $id"
      );
      try {
        await statement.executeAsync({
          $id: editingId,
          $type: type,
          $interestRate: rate,
        });

        setLoanTypes((old) =>
          old.map((loanType) =>
            loanType.id === editingId
              ? { id: editingId, type, interestRate: rate }
              : loanType
          )
        );
        setEditingId(null);
      } finally {
        await statement.finalizeAsync();
      }
    }

    setType("");
    setInterestRate("");
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

  const startEditing = (loanType: LoanType) => {
    setType(loanType.type);
    setInterestRate(loanType.interestRate.toString());
    setEditingId(loanType.id);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setType("");
    setInterestRate("");
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
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() => startEditing(loanType)}
                  style={styles.editButton}
                >
                  <MaterialIcons name="edit" size={24} color="blue" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteLoanType(loanType.id)}
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
        <TouchableOpacity onPress={addOrUpdateLoanType} style={styles.button}>
          <Text style={styles.buttonText}>
            {editingId === null ? t("loan_types.add") : t("loan_types.update")}
          </Text>
        </TouchableOpacity>

        {/* Cancel Button (Visible Only in Edit Mode) */}
        {editingId !== null && (
          <TouchableOpacity onPress={cancelEditing} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>
              {t("loan_types.cancel")}
            </Text>
          </TouchableOpacity>
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
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    marginRight: 15,
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
  cancelButton: {
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    backgroundColor: "gray",
    marginTop: 10,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textTransform: "uppercase",
  },
});

export default LoanTypesScreen;
