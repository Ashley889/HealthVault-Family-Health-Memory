import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationTiming = 'day-before' | 'same-day' | 'both';

export type NotificationPreferences = {
  enabled: boolean;
  timing: NotificationTiming;
};

const enabledKey = 'nura.notifications.enabled';
const timingKey = 'nura.notifications.timing';

export async function loadNotificationPreferences(): Promise<NotificationPreferences> {
  const [enabled, timing] = await Promise.all([
    AsyncStorage.getItem(enabledKey),
    AsyncStorage.getItem(timingKey),
  ]);
  return {
    enabled: enabled !== 'false',
    timing: timing === 'day-before' || timing === 'same-day' || timing === 'both' ? timing : 'day-before',
  };
}

export async function saveNotificationPreferences(preferences: NotificationPreferences) {
  await Promise.all([
    AsyncStorage.setItem(enabledKey, String(preferences.enabled)),
    AsyncStorage.setItem(timingKey, preferences.timing),
  ]);
}

export type AccountPreferences = {
  name: string;
  phone: string;
  email: string;
};

const accountKey = 'nura.account';
const defaultAccount: AccountPreferences = {
  name: 'Bhuvaneswari',
  phone: '',
  email: '',
};

export async function loadAccountPreferences(): Promise<AccountPreferences> {
  const raw = await AsyncStorage.getItem(accountKey);
  if (!raw) return defaultAccount;
  try {
    const saved = JSON.parse(raw) as Partial<AccountPreferences>;
    return {
      name: saved.name?.trim() || defaultAccount.name,
      phone: saved.phone?.trim() || '',
      email: saved.email?.trim() || '',
    };
  } catch {
    return defaultAccount;
  }
}

export async function saveAccountPreferences(account: AccountPreferences) {
  await AsyncStorage.setItem(accountKey, JSON.stringify(account));
}