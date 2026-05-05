import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { useFonts as useOutfitFonts, Outfit_700Bold, Outfit_800ExtraBold } from "@expo-google-fonts/outfit";
import { useFonts as useDMSansFonts, DMSans_400Regular, DMSans_500Medium } from "@expo-google-fonts/dm-sans";
import { useFonts as useSpaceMonoFonts, SpaceMono_400Regular, SpaceMono_700Bold } from "@expo-google-fonts/space-mono";
import { ActivityIndicator, View } from "react-native";
import { AppProvider } from "./src/context/AppContext";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { colors } from "./src/shared/theme";

export default function App() {
  const [outfitLoaded] = useOutfitFonts({
    Outfit_700Bold,
    Outfit_800ExtraBold,
  });
  const [dmSansLoaded] = useDMSansFonts({
    DMSans_400Regular,
    DMSans_500Medium,
  });
  const [spaceMonoLoaded] = useSpaceMonoFonts({
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  if (!outfitLoaded || !dmSansLoaded || !spaceMonoLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <AppProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AppProvider>
  );
}
