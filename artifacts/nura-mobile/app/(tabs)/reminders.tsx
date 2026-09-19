import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useListProfiles, useListReminders, useUpdateReminder } from '@workspace/api-client-react';
import type { Reminder, ReminderStatus } from '@workspace/api-client-react';
import { ActionDialog, Card, ErrorState, Header, LoadingState, PrimaryButton, Screen, SectionTitle } from '@/components/NuraUI';
import { formatDate } from '@/lib/format';
import { loadNotificationPreferences } from '@/lib/preferences';
import { reminderStateForDate } from '@/lib/reminder-status';
import { useColors } from '@/hooks/useColors';

type ReminderItem = Reminder;
type ReminderState = ReminderStatus;

export default function RemindersScreen() {
  const colors = useColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const reminders = useListReminders();
  const profiles = useListProfiles();
  const updateReminder = useUpdateReminder();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notYetReminder, setNotYetReminder] = useState<ReminderItem | null>(null);
  const [missedReminderId, setMissedReminderId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    void loadNotificationPreferences().then((preferences) => setNotificationsEnabled(preferences.enabled));
  }, []);

  if (reminders.isLoading || profiles.isLoading) return <Screen scroll={false}><LoadingState /></Screen>;
  if (reminders.isError || profiles.isError || !reminders.data || !profiles.data) return <Screen scroll={false}><ErrorState onRetry={() => { void reminders.refetch(); void profiles.refetch(); }} /></Screen>;

  const grouped: Record<ReminderState, ReminderItem[]> = {
    due: [], upcoming: [], missed: [], rescheduled: [], completed: [],
  };
  const today = new Date().toISOString().slice(0, 10);
  reminders.data.forEach((reminder) => grouped[reminderStateForDate(reminder.status, reminder.date.slice(0, 10), today)].push(reminder));

  const updateStatus = async (reminderId: number, status: ReminderStatus, success?: { title: string; message: string }) => {
    try {
      await updateReminder.mutateAsync({ reminderId, data: { status } });
      await queryClient.invalidateQueries();
      setNotYetReminder(null);
      if (success) setNotice(success);
    } catch {
      Alert.alert('Couldn’t update reminder', 'Please try again.');
    }
  };

  return (
    <Screen>
      <Header eyebrow="Keep things close" title="Reminders" subtitle="Keep track of upcoming appointments, tests, and follow-ups." />
      {notificationsEnabled ? <View style={[styles.notificationBanner, { backgroundColor: colors.softBlue }]}><Feather name="bell" size={16} color={colors.primary} /><Text style={[styles.notificationText, { color: colors.inkSoft }]}>Notifications are on. Nura will remind you before upcoming care.</Text></View> : null}
      <View style={[styles.countCard, { backgroundColor: colors.softBlue }]}>
        <Text style={[styles.count, { color: colors.primary }]}>{grouped.upcoming.length + grouped.due.length}</Text>
        <View style={styles.countCopy}><Text style={[styles.countTitle, { color: colors.foreground }]}>open reminders</Text><Text style={[styles.countText, { color: colors.mutedForeground }]}>Appointments, tests, and follow-ups.</Text></View>
      </View>
      {grouped.upcoming.length ? <ReminderSection title="Upcoming" reminders={grouped.upcoming} profiles={profiles.data} state="upcoming" colors={colors} onReschedule={(reminder) => router.push({ pathname: '/reminder/[id]', params: { id: String(reminder.id) } })} /> : null}
      {grouped.due.length ? <ReminderSection title="Due" reminders={grouped.due} profiles={profiles.data} state="due" colors={colors} onYes={(reminder) => router.push({ pathname: '/add-update', params: { profileId: String(reminder.profileId), reminderId: String(reminder.id), prefillTitle: reminder.title, prefillType: 'visit' } })} onNotYet={setNotYetReminder} onReschedule={(reminder) => router.push({ pathname: '/reminder/[id]', params: { id: String(reminder.id) } })} /> : null}
      {grouped.rescheduled.length ? <ReminderSection title="Rescheduled" reminders={grouped.rescheduled} profiles={profiles.data} state="rescheduled" colors={colors} onReschedule={(reminder) => router.push({ pathname: '/reminder/[id]', params: { id: String(reminder.id) } })} /> : null}
      {grouped.missed.length ? <ReminderSection title="Missed" reminders={grouped.missed} profiles={profiles.data} state="missed" colors={colors} onReschedule={(reminder) => router.push({ pathname: '/reminder/[id]', params: { id: String(reminder.id) } })} /> : null}
      <SectionTitle title="Completed" />
      {grouped.completed.map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} profile={profiles.data.find((item) => item.id === reminder.profileId)?.name || 'Family member'} state="completed" colors={colors} />)}
      {!grouped.completed.length ? <Card><Text style={[styles.reminderDetail, { color: colors.mutedForeground }]}>Completed visits will stay here after you save them to health history.</Text></Card> : null}
      <Modal visible={Boolean(notYetReminder)} transparent animationType="slide" onRequestClose={() => setNotYetReminder(null)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.actionSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Not completed yet</Text>
            <Text style={[styles.sheetSubtitle, { color: colors.mutedForeground }]}>What would you like to do?</Text>
            <ActionSheetButton title="Reschedule" detail="Move this reminder to another date." icon="calendar" colors={colors} onPress={() => { if (notYetReminder) router.push({ pathname: '/reminder/[id]', params: { id: String(notYetReminder.id) } }); setNotYetReminder(null); }} />
            <ActionSheetButton title="Keep for later" detail="Keep the reminder due so you can come back to it." icon="clock" colors={colors} onPress={() => { if (notYetReminder) void updateStatus(notYetReminder.id, 'due', { title: 'Reminder kept for later', message: "You can come back to this reminder when you're ready." }); }} />
            <ActionSheetButton title="Mark as missed" detail="Record that this reminder was not completed." icon="x-circle" colors={colors} destructive onPress={() => { if (!notYetReminder) return; setMissedReminderId(notYetReminder.id); setNotYetReminder(null); }} />
            <Pressable onPress={() => setNotYetReminder(null)} style={[styles.cancelSheetButton, { borderColor: colors.border }]}><Text style={[styles.cancelSheetText, { color: colors.inkSoft }]}>Cancel</Text></Pressable>
          </View>
        </View>
      </Modal>
      <ActionDialog visible={missedReminderId !== null} title="Mark reminder as missed?" message="This reminder will be recorded as not completed." primaryLabel="Mark as missed" onPrimary={() => { if (missedReminderId !== null) { const id = missedReminderId; setMissedReminderId(null); void updateStatus(id, 'missed', { title: 'Reminder marked as missed', message: 'This reminder has been recorded as missed.' }); } }} secondaryLabel="Cancel" onSecondary={() => setMissedReminderId(null)} destructive testID="mark-reminder-missed-dialog" />
      <ActionDialog visible={Boolean(notice)} title={notice?.title ?? ''} message={notice?.message ?? ''} primaryLabel="Done" onPrimary={() => setNotice(null)} testID="reminder-success-dialog" />
    </Screen>
  );
}

function ReminderSection({ title, reminders, profiles, state, colors, onYes, onNotYet, onReschedule }: { title: string; reminders: ReminderItem[]; profiles: Array<{ id: number; name: string }>; state: ReminderState; colors: ReturnType<typeof useColors>; onYes?: (reminder: ReminderItem) => void; onNotYet?: (reminder: ReminderItem) => void; onReschedule?: (reminder: ReminderItem) => void }) {
  return <View style={styles.section}><SectionTitle title={title} />{reminders.map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} profile={profiles.find((item) => item.id === reminder.profileId)?.name || 'Family member'} state={state} colors={colors} onYes={onYes} onNotYet={onNotYet} onReschedule={onReschedule} />)}</View>;
}

function ReminderCard({ reminder, profile, state, colors, onYes, onNotYet, onReschedule }: { reminder: ReminderItem; profile: string; state: ReminderState; colors: ReturnType<typeof useColors>; onYes?: (reminder: ReminderItem) => void; onNotYet?: (reminder: ReminderItem) => void; onReschedule?: (reminder: ReminderItem) => void }) {
  const stateLabel = state[0].toUpperCase() + state.slice(1);
  const stateColor = state === 'completed' ? colors.success : state === 'missed' ? colors.destructive : colors.primary;
  return <Card style={[styles.reminderCard, state === 'completed' && styles.completedCard]}><View style={[styles.reminderIcon, { backgroundColor: state === 'due' ? colors.primary : colors.accent }]}><Feather name={state === 'completed' ? 'check-circle' : 'calendar'} size={18} color={state === 'due' ? colors.primaryForeground : stateColor} /></View><View style={styles.reminderCopy}><Text style={[styles.reminderTitle, { color: colors.foreground }]}>{reminder.title}</Text><Text style={[styles.reminderDetail, { color: colors.mutedForeground }]}>{profile} · {reminder.detail}</Text><Text style={[styles.reminderDate, { color: stateColor }]}>{formatDate(reminder.date)}</Text><View style={[styles.statusPill, { backgroundColor: state === 'completed' ? colors.muted : colors.accent }]}><Text style={[styles.statusText, { color: stateColor }]}>{stateLabel}</Text></View>{state === 'due' ? <View style={styles.actions}><Pressable onPress={() => onYes?.(reminder)} style={[styles.actionButton, { backgroundColor: colors.primary }]}><Text style={[styles.actionText, { color: colors.primaryForeground }]}>Yes, I went</Text></Pressable><Pressable onPress={() => onNotYet?.(reminder)} style={[styles.actionButton, { borderColor: colors.border }]}><Text style={[styles.actionText, { color: colors.inkSoft }]}>Not yet</Text></Pressable></View> : null}{state === 'upcoming' || state === 'missed' || state === 'rescheduled' ? <Pressable onPress={() => onReschedule?.(reminder)} style={[styles.rescheduleButton, { borderColor: colors.border }]}><Feather name="calendar" size={14} color={colors.primary} /><Text style={[styles.rescheduleText, { color: colors.inkSoft }]}>{state === 'upcoming' ? 'Change date' : 'Reschedule'}</Text></Pressable> : null}</View></Card>;
}

const styles = StyleSheet.create({
  notificationBanner: { borderRadius: 15, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  notificationText: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 12, lineHeight: 18 },
  countCard: { borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  count: { fontFamily: 'Inter_700Bold', fontSize: 44, letterSpacing: -1 },
  countCopy: { gap: 3 },
  countTitle: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  countText: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  section: { gap: 12 },
  reminderCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  reminderIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  reminderCopy: { flex: 1, minWidth: 0, gap: 5 },
  reminderTitle: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  reminderDetail: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
  reminderDate: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  completedCard: { opacity: 0.8 },
  statusPill: { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 5 },
  statusText: { fontFamily: 'Inter_700Bold', fontSize: 10 },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 4 },
  actionButton: { minHeight: 40, borderRadius: 13, borderWidth: 1, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  rescheduleButton: { alignSelf: 'flex-start', minHeight: 34, borderRadius: 12, borderWidth: 1, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  rescheduleText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(14, 32, 48, 0.32)' },
  actionSheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, borderWidth: 1, padding: 20, gap: 12 },
  sheetHandle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, marginBottom: 4 },
  sheetTitle: { fontFamily: 'Inter_700Bold', fontSize: 22 },
  sheetSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20, marginBottom: 4 },
  sheetAction: { minHeight: 58, borderRadius: 16, borderWidth: 1, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  sheetActionIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  sheetActionCopy: { flex: 1, gap: 3 },
  sheetActionTitle: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  sheetActionDetail: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17 },
  cancelSheetButton: { minHeight: 46, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  cancelSheetText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
});

function ActionSheetButton({ title, detail, icon, colors, destructive, onPress }: { title: string; detail: string; icon: keyof typeof Feather.glyphMap; colors: ReturnType<typeof useColors>; destructive?: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.sheetAction, { borderColor: colors.border }]}><View style={[styles.sheetActionIcon, { backgroundColor: destructive ? colors.muted : colors.accent }]}><Feather name={icon} size={17} color={destructive ? colors.destructive : colors.primary} /></View><View style={styles.sheetActionCopy}><Text style={[styles.sheetActionTitle, { color: destructive ? colors.destructive : colors.foreground }]}>{title}</Text><Text style={[styles.sheetActionDetail, { color: colors.mutedForeground }]}>{detail}</Text></View><Feather name="chevron-right" size={17} color={colors.mutedForeground} /></Pressable>;
}