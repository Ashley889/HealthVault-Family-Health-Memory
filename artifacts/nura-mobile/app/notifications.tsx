import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen, SectionTitle } from '@/components/NuraUI';
import { useColors } from '@/hooks/useColors';
import { loadNotificationPreferences, saveNotificationPreferences, type NotificationTiming } from '@/lib/preferences';

const timingOptions: { value: NotificationTiming; label: string; detail: string }[] = [
  { value: 'same-day', label: 'On the day', detail: 'A reminder on the appointment date.' },
  { value: 'day-before', label: '1 day before', detail: 'A calm heads-up the day before.' },
  { value: 'both', label: 'On the day + 1 day before', detail: 'The day before and on the day.' },
];

export default function NotificationsScreen() {
  const colors = useColors();
  const [enabled, setEnabled] = useState(true);
  const [timing, setTiming] = useState<NotificationTiming>('day-before');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void loadNotificationPreferences().then((preferences) => {
      setEnabled(preferences.enabled);
      setTiming(preferences.timing);
      setReady(true);
    });
  }, []);

  const update = (next: Partial<{ enabled: boolean; timing: NotificationTiming }>) => {
    const nextPreferences = { enabled: next.enabled ?? enabled, timing: next.timing ?? timing };
    setEnabled(nextPreferences.enabled);
    setTiming(nextPreferences.timing);
    void saveNotificationPreferences(nextPreferences);
  };

  if (!ready) return <Screen scroll={false}><ActivityIndicator color={colors.primary} /></Screen>;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>Profile · Settings</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Notifications & reminder preferences</Text>
      </View>
      <View style={[styles.preferenceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
         <View style={[styles.icon, { backgroundColor: colors.softBlue }]}><Feather name="bell" size={19} color={colors.primary} /></View>
         <View style={styles.copy}><Text style={[styles.cardTitle, { color: colors.foreground }]}>Reminder notifications</Text><Text style={[styles.cardDetail, { color: colors.mutedForeground }]}>Allow reminder notifications.</Text></View>
        <Switch value={enabled} onValueChange={(value) => update({ enabled: value })} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.card} accessibilityLabel="Reminder notifications" />
      </View>
      <View style={styles.section}>
        <SectionTitle title="Reminder notification timing" />
        {!enabled ? <View style={[styles.offNotice, { backgroundColor: colors.muted }]}><Feather name="bell-off" size={16} color={colors.mutedForeground} /><Text style={[styles.offText, { color: colors.inkSoft }]}>Notifications are off. Your reminders will still remain visible in the Reminders tab.</Text></View> : null}
        {timingOptions.map((option) => <Pressable key={option.value} disabled={!enabled} onPress={() => update({ timing: option.value })} style={[styles.timingRow, { backgroundColor: colors.card, borderColor: timing === option.value && enabled ? colors.primary : colors.border, opacity: enabled ? 1 : 0.55 }]}><View style={[styles.radio, { borderColor: timing === option.value && enabled ? colors.primary : colors.border }]}>{timing === option.value && enabled ? <View style={[styles.radioDot, { backgroundColor: colors.primary }]} /> : null}</View><View style={styles.copy}><Text style={[styles.timingLabel, { color: colors.foreground }]}>{option.label}</Text><Text style={[styles.timingDetail, { color: colors.mutedForeground }]}>{option.detail}</Text></View></Pressable>)}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 5 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 1.1, textTransform: 'uppercase' },
  title: { fontFamily: 'Inter_700Bold', fontSize: 30, lineHeight: 36, letterSpacing: -0.7 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22 },
  preferenceCard: { width: '100%', borderWidth: 1, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  cardTitle: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  cardDetail: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
  section: { gap: 12 },
  offNotice: { borderRadius: 15, padding: 13, flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  offText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
  timingRow: { minHeight: 62, borderWidth: 1, borderRadius: 17, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  timingLabel: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  timingDetail: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
});