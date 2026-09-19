import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useGetDashboard } from '@workspace/api-client-react';
import { useListReminders } from '@workspace/api-client-react';
import { Avatar, Card, ErrorState, Header, LoadingState, OutlineButton, PrimaryButton, Screen, SectionTitle } from '@/components/NuraUI';
import { formatShortDate } from '@/lib/format';
import { useColors } from '@/hooks/useColors';

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const dashboard = useGetDashboard();
  const reminders = useListReminders();

  if (dashboard.isLoading) return <Screen scroll={false}><LoadingState /></Screen>;
  if (dashboard.isError || !dashboard.data) return <Screen scroll={false}><ErrorState onRetry={() => void dashboard.refetch()} /></Screen>;

  const { profiles, recentEvents } = dashboard.data;
  const upcomingReminders = reminders.data?.filter((item) => !item.completed).slice(0, 2) ?? [];
  return (
    <Screen>
      <Header
        eyebrow="Nura"
        title="Your family’s health, remembered."
        subtitle="Good morning. Keep the small details close."
        right={
          <Pressable testID="button-profile-tab" onPress={() => router.push('/profile')} style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="person-outline" size={20} color={colors.inkSoft} />
          </Pressable>
        }
      />
      <Card style={[styles.hero, { backgroundColor: colors.softBlue }]}>
        <View style={styles.heroOrb} />
        <View style={styles.heroCopy}>
          <View style={[styles.heroIcon, { backgroundColor: colors.card }]}><Feather name="edit-3" size={18} color={colors.primary} /></View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>What happened?</Text>
          <Text style={[styles.heroText, { color: colors.inkSoft }]}>Save a visit, question, report, or small health update while it’s fresh.</Text>
        </View>
        <PrimaryButton label="Add health memory" icon="plus" onPress={() => router.push('/add-update')} testID="button-add-health-memory" />
      </Card>
      <View style={styles.section}>
        <SectionTitle title="People to care for" action="See all" onAction={() => router.push('/history')} />
        <View style={styles.peopleGrid}>
          {profiles.slice(0, 4).map((profile) => (
            <Card key={profile.id} onPress={() => router.push({ pathname: '/family/[id]', params: { id: String(profile.id) } })} style={styles.personCard} testID={`card-family-${profile.id}`}>
              <Avatar initials={profile.initials} color={profile.color} size={42} />
              <View style={styles.personCopy}><Text numberOfLines={1} style={[styles.personName, { color: colors.foreground }]}>{profile.name}</Text><Text style={[styles.personMeta, { color: colors.mutedForeground }]}>{profile.relationship}</Text></View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </Card>
          ))}
        </View>
        <OutlineButton label="Add family member" icon="plus" onPress={() => router.push('/add-member')} testID="button-add-family-member" />
      </View>
      <View style={styles.section}>
        <SectionTitle title="Recent memories" action="View history" onAction={() => router.push('/history')} />
        {recentEvents.slice(0, 3).map((event) => {
          const profile = profiles.find((item) => item.id === event.profileId);
          return (
            <Card key={event.id} onPress={() => router.push({ pathname: '/family/[id]', params: { id: String(event.profileId) } })} style={styles.memoryCard}>
              <View style={[styles.memoryDot, { backgroundColor: colors.accent }]}><Feather name="activity" size={16} color={colors.primary} /></View>
              <View style={styles.memoryCopy}><Text style={[styles.memoryTitle, { color: colors.foreground }]}>{event.title}</Text><Text style={[styles.memoryMeta, { color: colors.mutedForeground }]}>{profile?.name || 'Family member'} · {formatShortDate(event.date)}</Text></View>
              <Feather name="arrow-up-right" size={17} color={colors.mutedForeground} />
            </Card>
          );
        })}
      </View>
      <View style={styles.section}>
        <SectionTitle title="Upcoming reminders" action="See all" onAction={() => router.push('/reminders')} />
        {upcomingReminders.length ? upcomingReminders.map((reminder) => {
          const profile = profiles.find((item) => item.id === reminder.profileId);
          return (
            <Card key={reminder.id} onPress={() => router.push('/reminders')} style={styles.reminderCard}>
              <View style={[styles.reminderIcon, { backgroundColor: colors.accent }]}><Feather name="calendar" size={16} color={colors.primary} /></View>
              <View style={styles.memoryCopy}><Text style={[styles.memoryTitle, { color: colors.foreground }]}>{reminder.title}</Text><Text style={[styles.memoryMeta, { color: colors.mutedForeground }]}>{profile?.name || 'Family member'} · {formatShortDate(reminder.date)}</Text></View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </Card>
          );
        }) : <Card><Text style={[styles.memoryTitle, { color: colors.foreground }]}>No upcoming reminders</Text><Text style={[styles.memoryMeta, { color: colors.mutedForeground }]}>Add follow-ups after a visit or test.</Text></Card>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  iconButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  hero: { overflow: 'hidden', gap: 18, padding: 20, minHeight: 224 },
  heroOrb: { position: 'absolute', width: 180, height: 180, borderRadius: 90, right: -58, top: -72, backgroundColor: 'rgba(255,255,255,0.65)' },
  heroCopy: { gap: 10 },
  heroIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontFamily: 'Inter_700Bold', fontSize: 25, letterSpacing: -0.6 },
  heroText: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20, maxWidth: 290 },
  section: { gap: 12 },
  peopleGrid: { gap: 10 },
  personCard: { width: '100%', minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  personCopy: { flex: 1, minWidth: 0, gap: 4 },
  personName: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  personMeta: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  memoryCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  memoryDot: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  memoryCopy: { flex: 1, minWidth: 0, gap: 4 },
  memoryTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  memoryMeta: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  reminderCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  reminderIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
