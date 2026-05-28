import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";
import { formatNumber } from "../shared/formatLocale";
import { colors, fontFamilies, radii } from "../shared/theme";

type StardustPillProps = {
  amount: number;
};

export const StardustPill = ({ amount }: StardustPillProps) => {
  const { language } = useAppContext();

  return (
    <View style={styles.pill}>
      <MaterialCommunityIcons name="star-four-points" size={13} color={colors.warning} />
      <Text style={styles.text}>{formatNumber(language, amount)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    alignItems: "center",
    backgroundColor: "rgba(131,135,195,0.16)",
    borderRadius: radii.pill,
    borderColor: "rgba(232,230,200,0.14)",
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  text: {
    color: colors.text,
    fontFamily: fontFamilies.monoRegular,
    fontSize: 12,
    fontWeight: "800",
  },
});
