import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCreateReminder, useListProfiles, useListReminders } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { OutlineButton, PrimaryButton, Screen, SectionTitle } from '@/components/NuraUI';
import { formatDate } from '@/lib/format';
import { loadNotificationPreferences, saveReminderStatus } from '@/lib/preferences';
import { useColors } from '@/hooks/useColors';

export default function RescheduleReminderScreen() {
  const colors = useColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const reminderId = Number(id);
  const reminders = useListReminders();
  const profiles = useListProfiles();
  const createReminder = useCreateReminder();
  const reminder = reminders.data?.find((item) => item.id === reminderId);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [reason, setReason] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (reminder) {
      setDate(reminder.date.slice(0, 10));
      setTime('09:00');
    }
  }, [reminder?.id, reminder?.date]);

  useEffect(() => {
    void loadNotificationPreferences().then((preferences) => setNotificationsEnabled(preferences.enabled));
  }, []);

  if (reminders.isLoading || profiles.isLoading) {
    return <Screen scroll={false}><ActivityIndicator color={colors.primary} /></Screen>;
  }
  if (!reminder) {
    return <Screen><Text style={[styles.message, { color: colors.mutedForeground }]}>This reminder is no longer available.</Text></Screen>;
  }

  const save = async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert('Check the date', 'Use the format YYYY-MM-DD.');
      return;
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      Alert.alert('Check the time', 'Use the format HH:MM.');
      return;
    }
    try {
      const detail = [reminder.detail, `Time: ${time}`, reason.trim() ? `Reason: ${reason.trim()}` : '', notificationsEnabled ? 'Notification ON' : 'Notification OFF'].filter(Boolean).join(' · ');
      await createReminder.mutateAsync({ data: { profileId: reminder.profileId, title: reminder.title, date, detail } });
      await saveReminderStatus(reminder.id, 'rescheduled');
      await queryClient.invalidateQueries();
      router.back();
    } catch {
      Alert.alert('Couldn’t reschedule', 'Please check the date and try again.');
    }
  };

  return (
    <Screen scroll={false}>
      <KeyboardAwareScrollViewCompat contentContainerStyle={styles.content} bottomOffset={80} keyboardShouldPersistTaps="handled">
        <SectionTitle title="Reschedule reminder" />
        <View style={[styles.summary, { backgroundColor: colors.softBlue }]}>
          <Text style={[styles.summaryLabel, { color: colors.primary }]}>Current reminder</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>{reminder.title}</Text>
          <Text style={[styles.detail, { color: colors.inkSoft }]}>{profiles.data?.find((profile) => profile.id === reminder.profileId)?.name || 'Family member'}</Text>
          <Text style={[styles.detail, { color: colors.inkSoft }]}>{formatDate(reminder.date)}</Text>
        </View>
        <View style={styles.field}><Text style={[styles.label, { color: colors.inkSoft }]}>New date</Text><TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]} /></View>
        <View style={styles.field}><Text style={[styles.label, { color: colors.inkSoft }]}>New time</Text><TextInput value={time} onChangeText={setTime} placeholder="HH:MM" placeholderTextColor={colors.mutedForeground} keyboardType="numbers-and-punctuation" style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]} /></View>
        <View style={styles.field}><Text style={[styles.label, { color: colors.inkSoft }]}>Reason — optional</Text><TextInput value={reason} onChangeText={setReason} placeholder="Add a note" placeholderTextColor={colors.mutedForeground} multiline style={[styles.input, styles.multiline, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]} /></View>
        <View style={[styles.notificationRow, { borderColor: colors.border, backgroundColor: colors.card }]}><View style={styles.notificationCopy}><Text style={[styles.label, { color: colors.foreground }]}>Notification</Text><Text style={[styles.detail, { color: colors.mutedForeground }]}>{notificationsEnabled ? 'Reminder notifications are on.' : 'Reminder notifications are off.'}</Text></View><Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.card} accessibilityLabel="Reminder notification" /></View>
        <PrimaryButton label={createReminder.isPending ? 'Rescheduling…' : 'Reschedule'} icon="calendar" disabled={createReminder.isPending} onPress={() => { void save(); }} />
        <OutlineButton label="Keep current date" icon="arrow-left" onPress={() => router.back()} />
      </KeyboardAwareScrollViewCompat>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18, paddingBottom: 42 },
  message: { fontFamily: 'Inter_400Regular', fontSize: 15 },
  summary: { borderRadius: 18, padding: 16, gap: 5 },
  summaryLabel: { fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  detail: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  field: { gap: 8 },
  label: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  input: { minHeight: 52, borderWidth: 1, borderRadius: 16, paddingHorizontal: 15, fontFamily: 'Inter_400Regular', fontSize: 15 },
  multiline: { minHeight: 90, paddingTop: 14, textAlignVertical: 'top' },
  notificationRow: { minHeight: 70, borderWidth: 1, borderRadius: 16, paddingHorizontal: 15, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  notificationCopy: { flex: 1, gap: 4 },
});