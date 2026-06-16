import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { captureError } from "../lib/errorTracking";
import { colors, radii, spacing } from "../shared/theme";
import { AppText } from "./ui/AppText";

type AstrocusErrorBoundaryProps = {
  children: ReactNode;
  /** Screen or feature label for crash grouping. */
  boundary: string;
};

type AstrocusErrorBoundaryState = {
  error: Error | null;
};

export class AstrocusErrorBoundary extends Component<
  AstrocusErrorBoundaryProps,
  AstrocusErrorBoundaryState
> {
  state: AstrocusErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AstrocusErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    captureError(error, {
      source: "AstrocusErrorBoundary",
      boundary: this.props.boundary,
      componentStack: info.componentStack,
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    if (__DEV__) {
      console.error(`[Astrocus] ErrorBoundary (${this.props.boundary}):`, error, info);
    }
  }

  private handleRetry = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (!this.state.error) {
      return this.props.children;
    }

    if (__DEV__) {
      return (
        <View style={styles.devFallback}>
          <AppText variant="modalTitle" style={styles.devTitle}>
            Render crash ({this.props.boundary})
          </AppText>
          <AppText variant="caption" style={styles.devMessage}>
            {this.state.error.message}
          </AppText>
          <AppText variant="caption" style={styles.devStack}>
            {this.state.error.stack}
          </AppText>
          <Pressable accessibilityRole="button" onPress={this.handleRetry} style={styles.retry}>
            <AppText variant="focusCta">Retry</AppText>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.prodFallback}>
        <AppText variant="modalTitle" style={styles.prodTitle}>
          Something went wrong
        </AppText>
        <Pressable accessibilityRole="button" onPress={this.handleRetry} style={styles.retry}>
          <AppText variant="focusCta">Try again</AppText>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  devFallback: {
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.sm,
    justifyContent: "center",
    padding: spacing.lg,
  },
  devTitle: {
    color: colors.danger,
  },
  devMessage: {
    color: colors.textMuted,
  },
  devStack: {
    color: colors.textMuted,
    fontSize: 11,
  },
  prodFallback: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    padding: spacing.lg,
  },
  prodTitle: {
    textAlign: "center",
  },
  retry: {
    alignSelf: "center",
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
});

export default AstrocusErrorBoundary;
