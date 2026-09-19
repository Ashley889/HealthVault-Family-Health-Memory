import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useListReminders, useCompleteReminder, useListProfiles } from '@workspace/api-client-react';
import { Card, ErrorState, Header, LoadingState, Screen, SectionTitle } from '@/components/NuraUI';
import { formatDate } from '@/lib/format';
import { useColors } from '@/hooks/useColors';

export default function RemindersScreen() {
  const colors = useColors();
  const reminders = useListReminders();
  const profiles = useListProfiles();
  const complete = useCompleteReminder();
  if (reminders.isLoading || profiles.isLoading) return <Screen scroll={false}><LoadingState /></Screen>;
  if (reminders.isError || profiles.isError || !reminders.data || !profiles.data) return <Screen scroll={false}><ErrorState onRetry={() => { void reminders.refetch(); void profiles.refetch(); }} /></Screen>;
  const open = reminders.data.filter((item) => !item.completed);
  return (
    <Screen>
      <Header eyebrow="Keep things close" title="Follow-ups" subtitle="Simple reminders for the next thing your family needs." />
      <View style={styles.countCard}>
        <Text style={[styles.count, { color: colors.primary }]}>{open.length}</Text>
        <View style={styles.countCopy}><Text style={[styles.countTitle, { color: colors.foreground }]}>upcoming moments</Text><Text style={[styles.countText, { color: colors.mutedForeground }]}>A little nudge when it matters.</Text></View>
      </View>
      <SectionTitle title="Upcoming" />
      {open.map((reminder) => {
        const profile = profiles.data.find((item) => item.id === reminder.profileId);
        return (
          <Card key={reminder.id} style={styles.reminderCard}>
            <View style={[styles.reminderIcon, { backgroundColor: colors.accent }]}><Feather name="calendar" size={18} color={colors.primary} /></View>
            <View style={styles.reminderCopy}><Text style={[styles.reminderTitle, { color: colors.foreground }]}>{reminder.title}</Text><Text style={[styles.reminderDetail, { color: colors.mutedForeground }]}>{profile?.name || 'Family member'} · {reminder.detail}</Text><Text style={[styles.reminderDate, { color: colors.primary }]}>{formatDate(reminder.date)}</Text></View>
            <Pressable accessibilityLabel={`Complete ${reminder.title}`} onPress={() => complete.mutate({ reminderId: reminder.id })} style={[styles.complete, { borderColor: colors.border }]}><Feather name="check" size={17} color={colors.primary} /></Pressable>
          </Card>
        );
      })}
      {!open.length ? <Card><Text style={[styles.reminderTitle, { color: colors.foreground }]}>You’re all caught up.</Text><Text style={[styles.reminderDetail, { color: colors.mutedForeground }]}>Completed reminders stay out of the way.</Text></Card> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  countCard: { borderRadius: 20, padding: 20, backgroundColor: '#e8f5fc', flexDirection: 'row', alignItems: 'center', gap: 14 },
  count: { fontFamily: 'Inter_700Bold', fontSize: 44, letterSpacing: -1 },
  countCopy: { gap: 3 },
  countTitle: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  countText: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  reminderCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reminderIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  reminderCopy: { flex: 1, gap: 4 },
  reminderTitle: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  reminderDetail: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
  reminderDate: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  complete: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});