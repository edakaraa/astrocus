import React, { useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";
import { colors, fontFamilies, radii, spacing } from "../shared/theme";
import { SpaceScene } from "../components/SpaceScene";
import { TextField } from "../components/TextField";
import { GradientButton } from "../components/GradientButton";

export const AuthScreen = () => {
  const { authMode, setAuthMode, register, login, continueWithProvider } = useAppContext();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [galaxyName, setGalaxyName] = useState("Astrocus");
  const [fullName, setFullName] = useState("");
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);
  const [birthday, setBirthday] = useState("");
  const [favoritePlanet, setFavoritePlanet] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPlanetModalOpen, setIsPlanetModalOpen] = useState(false);

  const planetOptions = useMemo(
    () => ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"],
    [],
  );

  const screen = useMemo(() => {
    if (authMode === "login") return "login";
    return registerStep === 1 ? "register" : "register-step-2";
  }, [authMode, registerStep]);

  const handleSubmit = async () => {
    try {
      if (authMode === "login") {
        await login({ email, password });
        return;
      }

      if (registerStep === 1) {
        setRegisterStep(2);
        return;
      }

      if (!acceptedTerms) {
        Alert.alert("Astrocus", "Please accept Terms of Service and Privacy Policy.");
        return;
      }

      await register({ email, password, username: username || fullName || "explorer", galaxyName });
    } catch (error) {
      Alert.alert("Astrocus", error instanceof Error ? error.message : "Unknown error");
    }
  };

  const handleProviderLogin = async (provider: "google" | "apple") => {
    try {
      await continueWithProvider(provider);
    } catch (error) {
      Alert.alert("Astrocus", error instanceof Error ? error.message : "Network request failed");
    }
  };

  const horizontalPadding = Math.max(spacing.lg, Math.min(spacing.xl, Math.round(width * 0.08)));
  const titleSize = Math.max(26, Math.min(30, Math.round(width * 0.075)));
  const titleLineHeight = Math.round(titleSize * 1.14);

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: Math.max(18, insets.bottom + 14) }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.topBar, { paddingTop: Math.max(14, insets.top + 10), paddingHorizontal: horizontalPadding }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => {
            if (authMode === "register" && registerStep === 2) {
              setRegisterStep(1);
              return;
            }
            setAuthMode("login");
          }}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="chevron-left" size={22} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.sceneWrap}>
        <SpaceScene variant={screen === "login" ? "auth-login" : "auth-register"} />
      </View>

      <View style={[styles.sheet, { paddingHorizontal: horizontalPadding }]}>
        {screen === "login" ? (
          <>
            <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleLineHeight }]}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to continue your journey.</Text>

            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <TextField
                accessibilityLabel="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
              <TextField
                accessibilityLabel="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
                right={
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
                    onPress={() => setIsPasswordVisible((current) => !current)}
                    style={styles.iconBtn}
                  >
                    <MaterialCommunityIcons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={18} color={colors.textMuted} />
                  </Pressable>
                }
              />

              <Pressable accessibilityRole="button" accessibilityLabel="Forgot password" style={styles.forgot}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>
            </View>

            <GradientButton label="Login" onPress={handleSubmit} />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Apple"
                style={styles.socialIconBtn}
                onPress={() => handleProviderLogin("apple")}
              >
                <MaterialCommunityIcons name="apple" size={20} color={colors.text} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Google"
                style={styles.socialIconBtn}
                onPress={() => handleProviderLogin("google")}
              >
                <MaterialCommunityIcons name="google" size={20} color={colors.text} />
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="GitHub" style={styles.socialIconBtn}>
                <MaterialCommunityIcons name="github" size={20} color={colors.text} />
              </Pressable>
            </View>

            <Pressable accessibilityRole="button" accessibilityLabel="Go to register" onPress={() => { setAuthMode("register"); setRegisterStep(1); }}>
              <Text style={styles.bottomLink}>
                Don&apos;t have an account? <Text style={styles.bottomLinkStrong}>Register</Text>
              </Text>
            </Pressable>
          </>
        ) : screen === "register" ? (
          <>
            <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleLineHeight }]}>Create Account</Text>
            <Text style={styles.subtitle}>Start your adventure.</Text>

            <View style={styles.form}>
              <Text style={styles.label}>Name</Text>
              <TextField accessibilityLabel="Name" placeholder="Your name" value={fullName} onChangeText={setFullName} />

              <Text style={[styles.label, { marginTop: 12 }]}>Email</Text>
              <TextField
                accessibilityLabel="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
              <TextField
                accessibilityLabel="Password"
                placeholder="Min. 8 characters"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
                right={
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
                    onPress={() => setIsPasswordVisible((current) => !current)}
                    style={styles.iconBtn}
                  >
                    <MaterialCommunityIcons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={18} color={colors.textMuted} />
                  </Pressable>
                }
              />
            </View>

            <GradientButton label="Continue" onPress={handleSubmit} />

            <Pressable accessibilityRole="button" accessibilityLabel="Go to login" onPress={() => setAuthMode("login")}>
              <Text style={styles.bottomLink}>
                Already have an account? <Text style={styles.bottomLinkStrong}>Login</Text>
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleLineHeight }]}>Almost There</Text>
            <Text style={styles.subtitle}>Tell us a bit more about you.</Text>

            <View style={styles.form}>
              <Text style={styles.label}>Username</Text>
              <TextField
                accessibilityLabel="Username"
                placeholder="Choose a username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              <Text style={[styles.label, { marginTop: 12 }]}>Birthdate</Text>
              <TextField
                accessibilityLabel="Birthdate"
                placeholder="Select your birthdate"
                value={birthday}
                onChangeText={setBirthday}
                right={<MaterialCommunityIcons name="calendar-blank-outline" size={18} color={colors.textMuted} />}
              />

              <Text style={[styles.label, { marginTop: 12 }]}>Favorite Planet (Optional)</Text>
              <TextField
                accessibilityLabel="Favorite Planet"
                placeholder="Choose your favorite"
                value={favoritePlanet}
                onChangeText={() => {}}
                editable={false}
                onPress={() => setIsPlanetModalOpen(true)}
                right={<MaterialCommunityIcons name="chevron-down" size={20} color={colors.textMuted} />}
              />

              <View style={styles.termsRow}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityLabel="Accept terms"
                  accessibilityState={{ checked: acceptedTerms }}
                  onPress={() => setAcceptedTerms((current) => !current)}
                  style={[styles.checkbox, acceptedTerms ? styles.checkboxChecked : null]}
                >
                  {acceptedTerms ? <MaterialCommunityIcons name="check" size={14} color={colors.chineseBlack} /> : null}
                </Pressable>
                <Text style={styles.termsText}>
                  I agree to the Terms of Service{"\n"}and Privacy Policy
                </Text>
              </View>
            </View>

            <GradientButton label="Create Account" onPress={handleSubmit} />
          </>
        )}
      </View>

      <Modal transparent visible={isPlanetModalOpen} animationType="fade" onRequestClose={() => setIsPlanetModalOpen(false)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close planet picker"
          onPress={() => setIsPlanetModalOpen(false)}
          style={styles.modalOverlay}
        >
          <Pressable
            accessibilityRole="menu"
            accessibilityLabel="Favorite planet options"
            onPress={() => {}}
            style={styles.modalSheet}
          >
            {planetOptions.map((option) => (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityLabel={`Select ${option}`}
                onPress={() => {
                  setFavoritePlanet(option);
                  setIsPlanetModalOpen(false);
                }}
                style={styles.modalOption}
              >
                <Text style={styles.modalOptionText}>{option}</Text>
                {favoritePlanet === option ? <MaterialCommunityIcons name="check" size={18} color={colors.primary} /> : null}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background },
  topBar: {
    paddingTop: 46,
    paddingHorizontal: spacing.xl,
    paddingBottom: 6,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  sceneWrap: {
    paddingHorizontal: 0,
  },
  sheet: {
    marginTop: 6,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 0,
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
  form: {
    marginTop: 18,
  },
  label: {
    marginBottom: 6,
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: fontFamilies.bodyRegular,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  forgot: {
    alignSelf: "flex-end",
    marginTop: 10,
    marginBottom: 8,
  },
  forgotText: {
    color: colors.primary,
    fontSize: 11,
    fontFamily: fontFamilies.body,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 18,
    marginBottom: 12,
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
  socialRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginBottom: 14,
  },
  socialIconBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  bottomLink: {
    marginTop: 12,
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: fontFamilies.bodyRegular,
  },
  bottomLinkStrong: {
    color: colors.primary,
    fontFamily: fontFamilies.body,
  },
  termsRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    marginTop: 14,
    marginBottom: 16,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: "rgba(255,255,255,0.02)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: "rgba(255,255,255,0.16)",
  },
  termsText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    fontFamily: fontFamilies.bodyRegular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    backgroundColor: "rgba(10, 17, 35, 0.98)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalOption: {
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  modalOptionText: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fontFamilies.bodyRegular,
  },
});
