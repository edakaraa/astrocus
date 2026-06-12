import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AstroAlertModal } from "../components/AstroAlertModal";
import { AstroConfirmModal } from "../components/AstroConfirmModal";
import { GlassToast } from "../components/GlassToast";
import { colors } from "../shared/theme";

export type ToastIcon = keyof typeof MaterialCommunityIcons.glyphMap;

export type AppAlertOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
};

export type AppConfirmOptions = {
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  destructive?: boolean;
};

export type AppToastOptions = {
  title: string;
  subtitle?: string;
  icon?: ToastIcon;
  iconColor?: string;
  iconBackground?: string;
  placement?: "top" | "bottom";
  /** Bottom toast on stack screens (no tab bar) — see GlassToast.avoidTabBar */
  avoidTabBar?: boolean;
  durationMs?: number;
};

type AlertState = AppAlertOptions & { visible: true };
type ConfirmState = AppConfirmOptions & { visible: true };
type ToastState = AppToastOptions & { visible: true };

export type NotificationContextValue = {
  showAlert: (options: AppAlertOptions) => Promise<void>;
  showConfirm: (options: AppConfirmOptions) => Promise<boolean>;
  showToast: (options: AppToastOptions) => void;
  dismissToast: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

const AppNotifierHost = ({
  alert,
  confirm,
  toast,
  onAlertClose,
  onConfirmCancel,
  onConfirmConfirm,
  onToastHide,
}: {
  alert: AlertState | null;
  confirm: ConfirmState | null;
  toast: ToastState | null;
  onAlertClose: () => void;
  onConfirmCancel: () => void;
  onConfirmConfirm: () => void;
  onToastHide: () => void;
}) => (
  <>
    <AstroAlertModal
      visible={alert !== null}
      title={alert?.title ?? ""}
      message={alert?.message ?? ""}
      confirmLabel={alert?.confirmLabel}
      icon={alert?.icon}
      onClose={onAlertClose}
    />
    <AstroConfirmModal
      visible={confirm !== null}
      title={confirm?.title ?? ""}
      message={confirm?.message ?? ""}
      cancelLabel={confirm?.cancelLabel ?? ""}
      confirmLabel={confirm?.confirmLabel ?? ""}
      destructive={confirm?.destructive}
      onCancel={onConfirmCancel}
      onConfirm={onConfirmConfirm}
    />
    <GlassToast
      visible={toast !== null}
      title={toast?.title ?? ""}
      subtitle={toast?.subtitle}
      icon={toast?.icon}
      iconColor={toast?.iconColor}
      iconBackground={toast?.iconBackground}
      placement={toast?.placement}
      avoidTabBar={toast?.avoidTabBar}
      durationMs={toast?.durationMs}
      onHide={onToastHide}
    />
  </>
);

export const NotificationProvider = ({ children }: PropsWithChildren) => {
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const alertResolverRef = useRef<(() => void) | null>(null);
  const confirmResolverRef = useRef<((confirmed: boolean) => void) | null>(null);

  const showAlert = useCallback((options: AppAlertOptions) => {
    return new Promise<void>((resolve) => {
      alertResolverRef.current = resolve;
      setAlert({ ...options, visible: true });
    });
  }, []);

  const showConfirm = useCallback((options: AppConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      confirmResolverRef.current = resolve;
      setConfirm({ ...options, visible: true });
    });
  }, []);

  const showToast = useCallback((options: AppToastOptions) => {
    setToast({ ...options, visible: true });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const resolveAlert = useCallback(() => {
    setAlert(null);
    alertResolverRef.current?.();
    alertResolverRef.current = null;
  }, []);

  const resolveConfirm = useCallback((confirmed: boolean) => {
    setConfirm(null);
    confirmResolverRef.current?.(confirmed);
    confirmResolverRef.current = null;
  }, []);

  const value = useMemo<NotificationContextValue>(
    () => ({
      showAlert,
      showConfirm,
      showToast,
      dismissToast,
    }),
    [dismissToast, showAlert, showConfirm, showToast],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <AppNotifierHost
        alert={alert}
        confirm={confirm}
        toast={toast}
        onAlertClose={resolveAlert}
        onConfirmCancel={() => resolveConfirm(false)}
        onConfirmConfirm={() => resolveConfirm(true)}
        onToastHide={dismissToast}
      />
    </NotificationContext.Provider>
  );
};

export const useAppNotifier = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useAppNotifier must be used within NotificationProvider");
  }
  return context;
};

/** Preset toast tones for consistent feedback across screens. */
export const toastTone = {
  info: {
    icon: "information-outline" as const,
    iconColor: colors.primary,
    iconBackground: "rgba(131,135,195,0.18)",
  },
  success: {
    icon: "check-circle-outline" as const,
    iconColor: colors.success,
    iconBackground: "rgba(185,240,215,0.14)",
  },
  warning: {
    icon: "alert-circle-outline" as const,
    iconColor: colors.warning,
    iconBackground: "rgba(255,209,102,0.14)",
  },
  error: {
    icon: "close-circle-outline" as const,
    iconColor: colors.danger,
    iconBackground: "rgba(255,107,107,0.14)",
  },
  star: {
    icon: "star-four-points" as const,
    iconColor: colors.primary,
    iconBackground: "rgba(131,135,195,0.18)",
  },
  trophy: {
    icon: "trophy-variant" as const,
    iconColor: colors.warning,
    iconBackground: "rgba(255,209,102,0.14)",
  },
};
