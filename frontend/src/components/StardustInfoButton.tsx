import React, { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";
import { t } from "../shared/i18n";
import theme from "../theme";
import { StardustInfoModal } from "./StardustInfoModal";

type StardustInfoButtonProps = {
  size?: number;
};

export const StardustInfoButton: React.FC<StardustInfoButtonProps> = ({ size = 18 }) => {
  const { language } = useAppContext();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t(language, "stardustInfoA11y")}
        hitSlop={8}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.btn, pressed ? styles.pressed : null]}
      >
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={size}
          color={theme.colors.textSecondary}
        />
      </Pressable>
      <StardustInfoModal visible={open} onClose={() => setOpen(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  btn: {
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.75,
  },
});
