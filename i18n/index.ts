import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";

import translationEn from "./locales/en-US/translation.json";
import translationSr from "./locales/sr-Cyrl/translation.json";

const resources = {
  "en-US": { translation: translationEn },
  "sr-Cyrl": { translation: translationSr },
};

const initI18n = async () => {
  let language = await AsyncStorage.getItem("language");

  if (!language) {
    language = Localization.getLocales()[0].languageTag;
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: "en-US",
    interpolation: {
      escapeValue: false,
    },
  });

  return true;
};

export { i18n, initI18n };
