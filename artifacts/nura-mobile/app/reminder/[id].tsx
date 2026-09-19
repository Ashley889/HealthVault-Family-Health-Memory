import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUpdateReminder, useListProfiles, useListReminders } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ActionDialog, OutlineButton, PrimaryButton, Screen, SectionTitle } from '@/components/NuraUI';
import { formatDate, todayIso } from '@/lib/format';
import { loadNotificationPreferences } from '@/lib/preferences';
import { useColors } from '@/hooks/useColors';

export default function RescheduleReminderScreen() {
  const colors = useColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const reminderId = Number(id);
  const reminders = useListReminders();
  const profiles = useListProfiles();
  const updateReminder = useUpdateReminder();
  const reminder = reminders.data?.find((item) => item.id === reminderId);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [reason, setReason] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [savedDate, setSavedDate] = useState<string | null>(null);

  useEffect(() => {
    if (reminder) {
      setDate(reminder.date.slice(0, 10));
      setTime(reminder.detail.match(/Time: ([0-2]\d:[0-5]\d)/)?.[1] || '09:00');
      setReason(reminder.detail.match(/Reason: (.*?)(?: · Notification|$)/)?.[1] || '');
      setNotificationsEnabled(!reminder.detail.includes('Notification OFF'));
    }
  }, [reminder?.id, reminder?.date, reminder?.detail]);

  useEffect(() => {
    void loadNotificationPreferences().then((preferences) => {
      if (!reminder?.detail.includes('Notification ')) setNotificationsEnabled(preferences.enabled);
    });
  }, [reminder?.detail]);

  if (reminders.isLoading || profiles.isLoading) {
    return <Screen scroll={false}><ActivityIndicator color={colors.primary} /></Screen>;
  }
  if (!reminder) {
    return <Screen><Text style={[styles.message, { color: colors.mutedForeground }]}>This reminder is no longer available.</Text></Screen>;
  }

  const save = async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert('Check the date', 'Please enter the date as YYYY-MM-DD.');
      return;
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      Alert.alert('Check the time', 'Please enter the time as HH:MM.');
      return;
    }
    if (date <= todayIso() || date === reminder.date.slice(0, 10)) {
      Alert.alert('Choose a future date', 'Move this reminder to a new date after today.');
      return;
    }
    try {
      const baseDetail = reminder.detail.split(' · Time:')[0];
      const detail = [baseDetail, `Time: ${time}`, reason.trim() ? `Reason: ${reason.trim()}` : '', notificationsEnabled ? 'Notification ON' : 'Notification OFF'].filter(Boolean).join(' · ');
      await updateReminder.mutateAsync({ reminderId: reminder.id, data: { date, detail, status: 'rescheduled' } });
      await queryClient.invalidateQueries();
      setSavedDate(date);
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
        <View style={styles.field}><Text style={[styles.label, { color: colors.inkSoft }]}>Note — optional</Text><TextInput value={reason} onChangeText={setReason} placeholder="Add a note" placeholderTextColor={colors.mutedForeground} multiline style={[styles.input, styles.multiline, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]} /></View>
        <View style={[styles.notificationRow, { borderColor: colors.border, backgroundColor: colors.card }]}><View style={styles.notificationCopy}><Text style={[styles.label, { color: colors.foreground }]}>Notifications</Text><Text style={[styles.detail, { color: colors.mutedForeground }]}>{notificationsEnabled ? 'Notifications are on.' : 'Notifications are off.'}</Text></View><Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.card} accessibilityLabel="Reminder notifications" /></View>
        <PrimaryButton label={updateReminder.isPending ? 'Rescheduling…' : 'Reschedule'} icon="calendar" disabled={updateReminder.isPending} onPress={() => { void save(); }} />
        <OutlineButton label="Keep current date" icon="arrow-left" onPress={() => router.back()} />
      </KeyboardAwareScrollViewCompat>
      <ActionDialog visible={Boolean(savedDate)} title="Reminder rescheduled" message={`Your reminder has been moved to ${formatDate(savedDate)}.`} primaryLabel="Done" onPrimary={() => { setSavedDate(null); router.back(); }} testID="reminder-rescheduled-dialog" />
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