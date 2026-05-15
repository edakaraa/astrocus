import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

export const secureStorage = {
  async get(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
  async remove(key: string) {
    return SecureStore.deleteItemAsync(key);
  },
};

export const asyncStorage = {
  async get<T>(key: string, fallback: T): Promise<T> {
    const rawValue = await AsyncStorage.getItem(key);

    if (!rawValue) {
      return fallback;
    }

    try {
      return JSON.parse(rawValue) as T;
    } catch {
      return fallback;
    }
  },
  async set<T>(key: string, value: T) {
    return AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async remove(key: string) {
    return AsyncStorage.removeItem(key);
  },
};
