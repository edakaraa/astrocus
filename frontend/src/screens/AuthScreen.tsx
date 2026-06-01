import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";
import { GradientButton } from "../components/GradientButton";
import { AstroAlertModal } from "../components/AstroAlertModal";
import { colors, fontFamilies, layout, spacing, typography } from "../shared/theme";
import { isEmailConfirmationRequiredError } from "../lib/authErrors";
import { oauthUserMessage } from "../lib/authErrors";
import { isAppleSignInAvailable } from "../lib/appleAuth";
import { t } from "../shared/i18n";

const BG = colors.chineseBlack;

const clamp = (min: number, value: number, max: number) => Math.min(max, Math.max(min, value));

const vw = (width: number, percent: number) => (width * percent) / 100;

const vh = (height: number, percent: number) => (height * percent) / 100;

/** Twinkling stars — full viewport (0–100% height). */
const STAR_DATA = Array.from({ length: 72 }, (_, i) => {
  const seed = (i + 1) * 19.3;
  return {
    cx: Math.abs(Math.sin(seed) * 10000) % 100,
    cy: Math.abs(Math.cos(seed * 1.4) * 10000) % 100,
    sizePx: i % 4 === 0 ? 2.6 : i % 4 === 1 ? 2 : i % 4 === 2 ? 1.4 : 1,
    baseOpacity: 0.32 + (Math.abs(Math.cos(seed * 0.7)) % 1) * 0.55,
    delay: (i * 173) % 3200,
    duration: 2200 + (i * 97) % 1600,
    isCross: i % 8 === 0,
    gold: i % 7 === 0,
  };
});

/** Static fill stars — denser sky, especially lower half. */
const STATIC_SKY = Array.from({ length: 64 }, (_, i) => {
  const seed = (i + 1) * 31.1;
  const lowerBias = i % 3 === 0 ? 55 + (Math.abs(Math.sin(seed * 1.2) * 10000) % 45) : Math.abs(Math.cos(seed * 1.15) * 10000) % 100;
  return {
    cx: Math.abs(Math.sin(seed) * 10000) % 100,
    cy: lowerBias,
    sizePx: i % 5 === 0 ? 1.8 : i % 5 === 1 ? 1.2 : 0.9,
    opacity: 0.22 + (Math.abs(Math.sin(seed * 0.85)) % 1) * 0.38,
    gold: i % 9 === 0,
  };
});

function useAuthLayout(width: number, height: number) {
  return useMemo(() => {
    const cardWidth = Math.min(vw(width, 90), clamp(280, width * 0.92, 480));
    const maxCardHeight = vh(height, 90);

    return {
      cardWidth,
      maxCardHeight,
      cardPadV: clamp(28, vh(height, 5), 48),
      cardPadH: clamp(20, vw(width, 5), 40),
      cardGap: clamp(12, vh(height, 2.5), 20),
      cardRadius: clamp(16, vw(width, 3), 28),
      inputSize: typography.bodyLarge.fontSize,
      inputLineHeight: typography.bodyLarge.lineHeight,
      inputPadV: clamp(10, vh(height, 1.8), 16),
      inputPadH: clamp(12, vw(width, 2), 18),
      inputRadius: clamp(10, vw(width, 2), 14),
      fieldGap: clamp(4, vh(height, 0.8), 8),
      labelMarginBottom: vh(height, 0.5),
      dividerGap: clamp(8, vw(width, 1.5), 12),
      iconSize: clamp(18, vw(width, 4.5), 22),
      eyeRight: clamp(10, vw(width, 2), 16),
      screenPadH: vw(width, 5),
    };
  }, [height, width]);
}

function StarBackground({ width, height }: { width: number; height: number }) {
  const anims = useRef(STAR_DATA.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(STAR_DATA[i].delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: STAR_DATA[i].duration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: STAR_DATA[i].duration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {STATIC_SKY.map((s, i) => {
        const left = (s.cx / 100) * width;
        const top = (s.cy / 100) * height;
        const color = s.gold ? "#E8C97A" : "#E8E6C8";
        return (
          <View
            key={`static-${i}`}
            pointerEvents="none"
            style={{
              position: "absolute",
              left: left - s.sizePx / 2,
              top: top - s.sizePx / 2,
              width: s.sizePx,
              height: s.sizePx,
              borderRadius: s.sizePx / 2,
              backgroundColor: color,
              opacity: s.opacity,
            }}
          />
        );
      })}
      {STAR_DATA.map((s, i) => {
        const left = (s.cx / 100) * width;
        const top = (s.cy / 100) * height;
        const color = s.gold ? "#E8C97A" : "#E8E6C8";
        const opacity = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [s.baseOpacity * 0.45, s.baseOpacity],
        });

        if (s.isCross) {
          return (
            <Animated.View
              key={i}
              pointerEvents="none"
              style={{
                position: "absolute",
                left: left - 5,
                top: top - 5,
                width: 10,
                height: 10,
                opacity,
              }}
            >
              <Svg width={10} height={10} viewBox="0 0 10 10">
                <Line x1={5} y1={1} x2={5} y2={9} stroke={color} strokeWidth={0.9} strokeOpacity={0.85} />
                <Line x1={1} y1={5} x2={9} y2={5} stroke={color} strokeWidth={0.9} strokeOpacity={0.65} />
                <Circle cx={5} cy={5} r={1.1} fill={color} />
              </Svg>
            </Animated.View>
          );
        }

        return (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={{
              position: "absolute",
              left: left - s.sizePx / 2,
              top: top - s.sizePx / 2,
              width: s.sizePx,
              height: s.sizePx,
              borderRadius: s.sizePx / 2,
              backgroundColor: color,
              opacity,
            }}
          />
        );
      })}
    </View>
  );
}

type AuthFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  accessibilityLabel: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "sentences";
  metrics: ReturnType<typeof useAuthLayout>;
  right?: React.ReactNode;
};

function AuthField({
  label,
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "sentences",
  metrics,
  right,
}: AuthFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: metrics.fieldGap }}>
      <Text style={[styles.label, { marginBottom: metrics.labelMarginBottom }]}>{label}</Text>
      <View style={{ position: "relative" }}>
        <TextInput
          accessibilityLabel={accessibilityLabel}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.35)"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            fontSize: metrics.inputSize,
            lineHeight: metrics.inputLineHeight,
            color: colors.text,
            fontFamily: fontFamilies.bodyRegular,
            paddingVertical: metrics.inputPadV,
            paddingHorizontal: metrics.inputPadH,
            paddingRight: right ? metrics.inputPadH + metrics.iconSize + metrics.eyeRight : metrics.inputPadH,
            backgroundColor: focused ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.06)",
            borderWidth: 1,
            borderColor: focused ? "rgba(130, 100, 255, 0.7)" : "rgba(255,255,255,0.1)",
            borderRadius: metrics.inputRadius,
          }}
        />
        {right ? (
          <View
            style={{
              position: "absolute",
              right: metrics.eyeRight,
              top: "50%",
              transform: [{ translateY: -metrics.iconSize / 2 }],
            }}
          >
            {right}
          </View>
        ) : null}
      </View>
    </View>
  );
}

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant: "google" | "apple";
  metrics: ReturnType<typeof useAuthLayout>;
  loading?: boolean;
};

function AuthButton({ label, onPress, disabled, variant, metrics, loading }: AuthButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        variant === "apple" ? styles.appleBtn : styles.googleBtn,
        { opacity: disabled || loading ? 0.55 : 1 },
      ]}
    >
      <MaterialCommunityIcons
        name={variant === "apple" ? "apple" : "google"}
        size={metrics.iconSize}
        color="#ffffff"
      />
      <Text style={styles.googleBtnText}>{label}</Text>
    </Pressable>
  );
}

export const AuthScreen = () => {
  const router = useRouter();
  const {
    authMode,
    setAuthMode,
    register,
    login,
    continueWithGoogle,
    continueWithApple,
    resetPassword,
    language,
  } = useAppContext();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const metrics = useAuthLayout(width, height);
  const titleSize = Math.max(26, Math.min(32, Math.round(width * 0.075)));
  const titleLineHeight = Math.round(titleSize * 1.14);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [astroAlert, setAstroAlert] = useState<{ title: string; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "ios") {
      return;
    }
    void isAppleSignInAvailable().then(setAppleAvailable);
  }, []);

  const showAstroAlert = useCallback((title: string, message: string) => {
    setAstroAlert({ title, message });
  }, []);

  const isLogin = authMode === "login";

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    try {
      if (isLogin) {
        if (!email.trim() || !password.trim()) {
          Alert.alert(t(language, "appName"), t(language, "fieldsRequired"));
          return;
        }
        setIsSubmitting(true);
        await login({ email, password }, language);
        return;
      }

      if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim()) {
        Alert.alert(t(language, "appName"), t(language, "registerFieldsRequired"));
        return;
      }

      if (password.length < 8) {
        Alert.alert(t(language, "appName"), t(language, "weakPassword"));
        return;
      }

      if (!acceptedTerms) {
        Alert.alert(t(language, "appName"), t(language, "termsRequired"));
        return;
      }

      setIsSubmitting(true);
      await register(
        {
          email,
          password,
          username: username.trim(),
          displayName: fullName.trim(),
        },
        language,
      );
    } catch (error) {
      if (isEmailConfirmationRequiredError(error)) {
        Alert.alert(t(language, "appName"), `${error.email} ${error.message}`, [
          { text: t(language, "goToLogin"), onPress: () => setAuthMode("login") },
        ]);
        return;
      }
      Alert.alert(
        t(language, "appName"),
        error instanceof Error ? error.message : t(language, "errorGeneric"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isGoogleLoading) {
      return;
    }
    setIsGoogleLoading(true);
    try {
      await continueWithGoogle();
    } catch (error) {
      const { title, message } = oauthUserMessage(error, language, "google");
      showAstroAlert(title, message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (isAppleLoading) {
      return;
    }
    setIsAppleLoading(true);
    try {
      await continueWithApple();
    } catch (error) {
      const { title, message } = oauthUserMessage(error, language, "apple");
      showAstroAlert(title, message);
    } finally {
      setIsAppleLoading(false);
    }
  };

  const passwordToggle = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isPasswordVisible ? t(language, "hidePassword") : t(language, "showPassword")}
      onPress={() => setIsPasswordVisible((current) => !current)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <MaterialCommunityIcons
        name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
        size={metrics.iconSize}
        color="rgba(255,255,255,0.55)"
      />
    </Pressable>
  );

  const cardShellStyle: StyleProp<ViewStyle> = {
    width: metrics.cardWidth,
    maxHeight: metrics.maxCardHeight,
    borderRadius: metrics.cardRadius,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  };

  const cardContent = (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
      style={{ maxHeight: metrics.maxCardHeight }}
      contentContainerStyle={{
        gap: metrics.cardGap,
        paddingVertical: metrics.cardPadV,
        paddingHorizontal: metrics.cardPadH,
      }}
    >
      <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleLineHeight }]}>
        {isLogin ? t(language, "authWelcomeBack") : t(language, "createAccount")}
      </Text>

      <Text style={styles.subtitle}>
        {isLogin ? t(language, "authLoginSubtitle") : t(language, "createAccountSubtitle")}
      </Text>

      {isLogin ? (
        <>
          <AuthField
            label={t(language, "email")}
            value={email}
            onChangeText={setEmail}
            placeholder={t(language, "emailPlaceholder")}
            accessibilityLabel={t(language, "email")}
            keyboardType="email-address"
            autoCapitalize="none"
            metrics={metrics}
          />
          <AuthField
            label={t(language, "password")}
            value={password}
            onChangeText={setPassword}
            placeholder={t(language, "passwordPlaceholder")}
            accessibilityLabel={t(language, "password")}
            secureTextEntry={!isPasswordVisible}
            autoCapitalize="none"
            metrics={metrics}
            right={passwordToggle}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(language, "forgotPassword")}
            onPress={async () => {
              if (!email.trim()) {
                Alert.alert(t(language, "appName"), t(language, "enterEmailFirst"));
                return;
              }
              try {
                await resetPassword(email);
                Alert.alert(t(language, "appName"), t(language, "passwordResetSent"));
              } catch (error) {
                Alert.alert(
                  t(language, "appName"),
                  error instanceof Error ? error.message : t(language, "requestFailed"),
                );
              }
            }}
            style={styles.forgot}
          >
            <Text style={styles.forgotText}>{t(language, "forgotPassword")}</Text>
          </Pressable>
        </>
      ) : (
        <>
          <AuthField
            label={t(language, "name")}
            value={fullName}
            onChangeText={setFullName}
            placeholder={t(language, "namePlaceholder")}
            accessibilityLabel={t(language, "name")}
            metrics={metrics}
          />
          <AuthField
            label={t(language, "username")}
            value={username}
            onChangeText={setUsername}
            placeholder={t(language, "usernamePlaceholder")}
            accessibilityLabel={t(language, "username")}
            autoCapitalize="none"
            metrics={metrics}
          />
          <AuthField
            label={t(language, "email")}
            value={email}
            onChangeText={setEmail}
            placeholder={t(language, "emailPlaceholder")}
            accessibilityLabel={t(language, "email")}
            keyboardType="email-address"
            autoCapitalize="none"
            metrics={metrics}
          />
          <AuthField
            label={t(language, "password")}
            value={password}
            onChangeText={setPassword}
            placeholder={t(language, "passwordMinPlaceholder")}
            accessibilityLabel={t(language, "password")}
            secureTextEntry={!isPasswordVisible}
            autoCapitalize="none"
            metrics={metrics}
            right={passwordToggle}
          />
          <View style={{ flexDirection: "row", gap: metrics.dividerGap, alignItems: "flex-start" }}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityLabel={t(language, "acceptTerms")}
              accessibilityState={{ checked: acceptedTerms }}
              onPress={() => setAcceptedTerms((current) => !current)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View
                style={{
                  width: clamp(18, vw(width, 4.5), 22),
                  height: clamp(18, vw(width, 4.5), 22),
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: acceptedTerms ? colors.primary : colors.borderStrong,
                  backgroundColor: acceptedTerms ? colors.primary : "rgba(255,255,255,0.06)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {acceptedTerms ? (
                  <MaterialCommunityIcons name="check" size={14} color={colors.chineseBlack} />
                ) : null}
              </View>
            </Pressable>
            <Text style={styles.termsText}>
              {t(language, "acceptTerms")}{" "}
              <Text style={styles.termsLink} onPress={() => router.push("/legal/privacy-policy")}>
                {t(language, "privacyPolicyLink")}
              </Text>
            </Text>
          </View>
        </>
      )}

      <GradientButton
        fullWidth
        label={
          isSubmitting
            ? isLogin
              ? t(language, "loginSubmitting")
              : t(language, "registerSubmitting")
            : isLogin
              ? t(language, "login")
              : t(language, "createAccount")
        }
        onPress={handleSubmit}
        disabled={isSubmitting}
      />

      {isLogin ? (
        <>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t(language, "orContinueWith")}</Text>
            <View style={styles.dividerLine} />
          </View>

          <AuthButton
            label={isGoogleLoading ? t(language, "googleConnecting") : t(language, "continueWithGoogle")}
            onPress={handleGoogleLogin}
            disabled={isGoogleLoading || isAppleLoading}
            loading={isGoogleLoading}
            variant="google"
            metrics={metrics}
          />

          {appleAvailable ? (
            <AuthButton
              label={isAppleLoading ? t(language, "appleConnecting") : t(language, "continueWithApple")}
              onPress={handleAppleLogin}
              disabled={isAppleLoading || isGoogleLoading}
              loading={isAppleLoading}
              variant="apple"
              metrics={metrics}
            />
          ) : null}
        </>
      ) : null}

      <Text style={styles.bottomLink}>
        {isLogin ? (
          <>
            {t(language, "dontHaveAccount")}{" "}
            <Text style={styles.bottomLinkStrong} onPress={() => setAuthMode("register")}>
              {t(language, "register")}
            </Text>
          </>
        ) : (
          <>
            {t(language, "alreadyHaveAccount")}{" "}
            <Text style={styles.bottomLinkStrong} onPress={() => setAuthMode("login")}>
              {t(language, "login")}
            </Text>
          </>
        )}
      </Text>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
    >
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StarBackground width={width} height={height} />
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(58,62,108,0.22)", "transparent"]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "40%",
          }}
        />
        <LinearGradient
          pointerEvents="none"
          colors={["transparent", "rgba(58,62,108,0.14)"]}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "25%",
          }}
        />

        <View style={[styles.centerStage, { paddingHorizontal: metrics.screenPadH }]}>
          <BlurView intensity={50} tint="dark" style={cardShellStyle}>
            <View style={styles.cardTint}>{cardContent}</View>
          </BlurView>
        </View>

        <AstroAlertModal
          visible={astroAlert !== null}
          title={astroAlert?.title ?? t(language, "appName")}
          message={astroAlert?.message ?? ""}
          confirmLabel={t(language, "ok")}
          onClose={() => setAstroAlert(null)}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: BG,
  },
  screen: {
    flex: 1,
    backgroundColor: BG,
    overflow: "hidden",
  },
  centerStage: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTint: {
    backgroundColor: "rgba(10,17,35,0.92)",
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    color: colors.text,
    letterSpacing: -0.3,
    fontFamily: fontFamilies.display,
  },
  subtitle: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 12.5,
    fontFamily: fontFamilies.bodyRegular,
  },
  label: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: fontFamilies.bodyRegular,
  },
  forgot: {
    alignSelf: "flex-end",
  },
  forgotText: {
    color: colors.primary,
    fontSize: 11,
    fontFamily: fontFamilies.body,
  },
  googleBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: layout.touchTargetMin,
    paddingVertical: spacing.sm,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  appleBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: layout.touchTargetMin,
    paddingVertical: spacing.sm,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  googleBtnText: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fontFamilies.body,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: fontFamilies.bodyRegular,
  },
  bottomLink: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fontFamilies.bodyRegular,
  },
  bottomLinkStrong: {
    color: colors.primary,
    fontFamily: fontFamilies.body,
  },
  termsText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    fontFamily: fontFamilies.bodyRegular,
  },
  termsLink: {
    color: colors.primary,
    fontFamily: fontFamilies.body,
  },
});
