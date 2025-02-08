import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoanTypesScreen from "./loan-types";
import LoanOptionsScreen from "./loan-options";

export type LoanTypesStackParamList = {
  LoanTypes: undefined;
  LoanOptions: { loanTypeId: number };
};

const Stack = createNativeStackNavigator<LoanTypesStackParamList>();

export default function LoanTypesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="LoanTypes" component={LoanTypesScreen} />
      <Stack.Screen name="LoanOptions" component={LoanOptionsScreen} />
    </Stack.Navigator>
  );
}
