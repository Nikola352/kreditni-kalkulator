import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as Localization from "expo-localization";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import { i18n } from "../i18n";

const LanguageScreen = ({ navigation }: { navigation: any }) => {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  useEffect(() => {
    (async () => {
      const storedLang = await AsyncStorage.getItem("language");
      if (storedLang) {
        setSelectedLanguage(storedLang);
      }
    })();
  }, []);

  const changeLanguage = async (language: string) => {
    if (language === "system") {
      const systemLang = Localization.getLocales()[0].languageTag;
      await AsyncStorage.removeItem("language");
      i18n.changeLanguage(systemLang);
      setSelectedLanguage(systemLang);
    } else {
      await AsyncStorage.setItem("language", language);
      i18n.changeLanguage(language);
      setSelectedLanguage(language);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.light.headerBackground, Colors.light.secondary]}
      style={styles.container}
    >
      <Text style={styles.title}>{t("language.title")}</Text>

      <TouchableOpacity
        style={[
          styles.button,
          selectedLanguage === "en-US" && styles.selectedButton,
        ]}
        onPress={() => changeLanguage("en-US")}
      >
        <Text style={styles.buttonText}>🇺🇸 English</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          selectedLanguage === "sr-Cyrl" && styles.selectedButton,
        ]}
        onPress={() => changeLanguage("sr-Cyrl")}
      >
        <Text style={styles.buttonText}>🇷🇸 Српски</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          selectedLanguage !== "en-US" &&
            selectedLanguage !== "sr-Cyrl" &&
            styles.selectedButton,
        ]}
        onPress={() => changeLanguage("system")}
      >
        <Text style={styles.buttonText}>🌍 {t("language.default")}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default LanguageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.headerText,
    textAlign: "center",
    marginBottom: 20,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  button: {
    width: "90%",
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 10,
    backgroundColor: Colors.light.buttonPrimary,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedButton: {
    backgroundColor: Colors.light.buttonSecondary,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.headerText,
  },
});
