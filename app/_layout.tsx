import { Colors } from "@/constants/Colors";
import { initI18n } from "@/i18n";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { SplashScreen } from "expo-router";
import { useEffect, useState } from "react";

import { useColorScheme } from "../hooks/useColorScheme";
import CalculatorScreen from "./calculator";
import LanguageScreen from "./language";
import { StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useThemeColor } from "@/hooks/useThemeColor";
import { SQLiteProvider } from "expo-sqlite";
import { migrateDbIfNeeded } from "@/util/db-setup";
import LoanTypesScreen from "./loan-types/loan-types";
import LoanTypesStack from "./loan-types/_layout";

SplashScreen.preventAutoHideAsync();

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: any) => {
  const { t } = useTranslation();
  const headerBackgroundColor = useThemeColor({}, "headerBackground");
  const secondaryColor = useThemeColor({}, "headerBackground");

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContainer}
    >
      <LinearGradient
        colors={[headerBackgroundColor, secondaryColor]}
        style={styles.drawerGradient}
      >
        <Text style={styles.drawerTitle}>{t("loan_calculator")}</Text>
      </LinearGradient>
      <DrawerItem
        label={t("navigation.calculator")}
        onPress={() => props.navigation.navigate("Calculator")}
        labelStyle={styles.drawerLabel}
        style={styles.drawerItem}
      />
      <DrawerItem
        label={t("navigation.loan_types")}
        onPress={() => props.navigation.navigate("LoanTypes")}
        labelStyle={styles.drawerLabel}
        style={styles.drawerItem}
      />
      <DrawerItem
        label={t("navigation.language")}
        onPress={() => props.navigation.navigate("Language")}
        labelStyle={styles.drawerLabel}
        style={styles.drawerItem}
      />
    </DrawerContentScrollView>
  );
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const [i18nLoaded, setI18nLoaded] = useState(false);

  useEffect(() => {
    initI18n().then(() => {
      setI18nLoaded(true);
      SplashScreen.hideAsync();
    });
  }, []);

  if (!fontsLoaded || !i18nLoaded) {
    return null;
  }

  return (
    <SQLiteProvider
      databaseName="kreditni-kalkulator.db"
      onInit={migrateDbIfNeeded}
    >
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Drawer.Navigator
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            headerShown: false,
            drawerStyle: {
              backgroundColor: Colors.light.headerBackground,
              width: 250,
            },
          }}
        >
          <Drawer.Screen name="Calculator" component={CalculatorScreen} />
          <Drawer.Screen name="LoanTypes" component={LoanTypesStack} />
          <Drawer.Screen name="Language" component={LanguageScreen} />
        </Drawer.Navigator>
      </ThemeProvider>
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    paddingVertical: 30,
  },
  drawerGradient: {
    padding: 30,
    alignItems: "center",
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.light.headerText,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  drawerItem: {
    marginVertical: 5,
    borderRadius: 10,
    overflow: "hidden",
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.light.headerText,
  },
});
