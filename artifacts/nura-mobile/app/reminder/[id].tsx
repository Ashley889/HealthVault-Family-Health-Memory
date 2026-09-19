import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCreateReminder, useListReminders } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { OutlineButton, PrimaryButton, Screen, SectionTitle } from '@/components/NuraUI';
import { loadReminderStatuses, saveReminderStatus } from '@/lib/preferences';
import { useColors } from '@/hooks/useColors';

export default function RescheduleReminderScreen() {
  const colors = useColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const reminderId = Number(id);
  const reminders = useListReminders();
  const createReminder = useCreateReminder();
  const reminder = reminders.data?.find((item) => item.id === reminderId);
  const [date, setDate] = useState(reminder?.date?.slice(0, 10) ?? '');

  if (!reminder) {
    return <Screen><Text style={[styles.message, { color: colors.mutedForeground }]}>This reminder is no longer available.</Text></Screen>;
  }

  const save = async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert('Check the date', 'Use the format YYYY-MM-DD.');
      return;
    }
    try {
      await createReminder.mutateAsync({ data: { profileId: reminder.profileId, title: reminder.title, date, detail: reminder.detail } });
      await saveReminderStatus(reminder.id, 'rescheduled');
      await queryClient.invalidateQueries();
      router.back();
    } catch {
      Alert.alert('Couldn’t reschedule', 'Please check the date and try again.');
    }
  };

  return (
    <Screen>
      <SectionTitle title="Move this reminder" />
      <Text style={[styles.helper, { color: colors.mutedForeground }]}>The original reminder will be kept as rescheduled, and a new upcoming reminder will be added for the new date.</Text>
      <View style={[styles.summary, { backgroundColor: colors.softBlue }]}><Text style={[styles.title, { color: colors.foreground }]}>{reminder.title}</Text><Text style={[styles.detail, { color: colors.inkSoft }]}>{reminder.detail}</Text></View>
      <View style={styles.field}><Text style={[styles.label, { color: colors.inkSoft }]}>New date</Text><TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]} /></View>
      <PrimaryButton label={createReminder.isPending ? 'Rescheduling…' : 'Save new date'} icon="calendar" disabled={createReminder.isPending} onPress={() => { void save(); }} />
      <OutlineButton label="Keep current date" icon="arrow-left" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  message: { fontFamily: 'Inter_400Regular', fontSize: 15 },
  helper: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21 },
  summary: { borderRadius: 18, padding: 16, gap: 5 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  detail: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  field: { gap: 8 },
  label: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  input: { minHeight: 52, borderWidth: 1, borderRadius: 16, paddingHorizontal: 15, fontFamily: 'Inter_400Regular', fontSize: 15 },
});