import NetInfo from "@react-native-community/netinfo";
import { isSchemaSessionError, isTransientNetworkError } from "../../shared/api";

const NON_QUEUEABLE = /duration_mismatch|invalid_category|profile_not_found/i;

export const isDeviceOffline = async (): Promise<boolean> => {
  const net = await NetInfo.fetch();
  return !net.isConnected || net.isInternetReachable === false;
};

/** Whether a failed session save should be queued for later sync instead of showing a hard error. */
export const shouldQueueSessionAfterSaveFailure = async (error: unknown): Promise<boolean> => {
  if (isSchemaSessionError(error)) {
    return false;
  }

  const msg = error instanceof Error ? error.message : String(error);
  if (NON_QUEUEABLE.test(msg)) {
    return false;
  }

  if (await isDeviceOffline()) {
    return true;
  }

  return isTransientNetworkError(error);
};
