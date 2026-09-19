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
  ownerProfileId?: number;
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
      ownerProfileId: typeof saved.ownerProfileId === 'number' ? saved.ownerProfileId : undefined,
    };
  } catch {
    return defaultAccount;
  }
}

export async function saveAccountPreferences(account: AccountPreferences) {
  await AsyncStorage.setItem(accountKey, JSON.stringify(account));
}

export type FeedbackEntry = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
};

const feedbackKey = 'nura.feedback';
const sampleFeedback: FeedbackEntry[] = [
  {
    id: 'sample-suggestion',
    type: 'Suggestion',
    message: 'Add support for more report formats.',
    createdAt: '2026-09-18',
  },
  {
    id: 'sample-issue',
    type: 'Issue',
    message: 'The reminder notification was not showing.',
    createdAt: '2026-09-17',
  },
];

export async function loadFeedbackHistory(): Promise<FeedbackEntry[]> {
  const raw = await AsyncStorage.getItem(feedbackKey);
  if (!raw) return sampleFeedback;
  try {
    const saved = JSON.parse(raw) as FeedbackEntry[];
    return Array.isArray(saved) && saved.length ? saved : sampleFeedback;
  } catch {
    return sampleFeedback;
  }
}

export async function saveFeedbackEntry(entry: Omit<FeedbackEntry, 'id' | 'createdAt'>): Promise<FeedbackEntry> {
  const saved = await loadFeedbackHistory();
  const created: FeedbackEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  await AsyncStorage.setItem(feedbackKey, JSON.stringify([created, ...saved]));
  return created;
}