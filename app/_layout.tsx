import { SplashScreen, Stack } from "expo-router";
import { useColorScheme } from "../hooks/useColorScheme";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import initI18n from "@/i18n";

SplashScreen.preventAutoHideAsync();

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
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </ThemeProvider>
  );
}
