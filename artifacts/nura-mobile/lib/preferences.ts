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

export type LocalReminderStatus = 'missed' | 'rescheduled';
const reminderStatusKey = 'nura.reminder.statuses';

export async function loadReminderStatuses(): Promise<Record<string, LocalReminderStatus>> {
  const raw = await AsyncStorage.getItem(reminderStatusKey);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, LocalReminderStatus>;
  } catch {
    return {};
  }
}

export async function saveReminderStatus(reminderId: number, status: LocalReminderStatus) {
  const statuses = await loadReminderStatuses();
  statuses[String(reminderId)] = status;
  await AsyncStorage.setItem(reminderStatusKey, JSON.stringify(statuses));
}