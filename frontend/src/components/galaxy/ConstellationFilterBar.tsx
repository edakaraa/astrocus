import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii } from "../../shared/theme";

export type ConstellationFilterId = "all" | "active" | "completed";

type FilterOption = {
  id: ConstellationFilterId;
  label: string;
};

type ConstellationFilterBarProps = {
  options: readonly FilterOption[];
  value: ConstellationFilterId;
  onChange: (id: ConstellationFilterId) => void;
};

export const ConstellationFilterBar: React.FC<ConstellationFilterBarProps> = ({
  options,
  value,
  onChange,
}) => (
  <View style={styles.row}>
    {options.map((item) => {
      const active = value === item.id;
      return (
        <Pressable
          accessibilityRole="button"
          key={item.id}
          onPress={() => onChange(item.id)}
          style={[styles.chip, active ? styles.chipActive : null]}
        >
          <Text style={[styles.text, active ? styles.textActive : null]}>{item.label}</Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    padding: 4,
  },
  chip: {
    alignItems: "center",
    borderRadius: radii.pill,
    flex: 1,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  text: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: "800",
  },
  textActive: {
    color: colors.warmOffWhite,
  },
});
